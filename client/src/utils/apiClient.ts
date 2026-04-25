//import { getTenantId } from "@config/apiConfig";
import { Cookies } from "react-cookie";
import { apiLogger } from "./logger/logger";

/**
 * HTTP response wrapper for API calls
 */
export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Headers;
}

/**
 * API request configuration
 */
export interface ApiRequestConfig
    extends Omit<RequestInit, "body" | "headers"> {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | null | undefined>;
    timeout?: number;
    retry?: RetryConfig;
    skipDefaultHeaders?: boolean;
    responseType?: "json" | "text" | "blob" | "arrayBuffer";
}

/**
 * Retry configuration
 */
export interface RetryConfig {
    maxRetries?: number;
    retryDelay?: number;
    retryOn?: number[];
}

/**
 * Request interceptor type
 */
export type RequestInterceptor = (
    config: ApiRequestConfig & { url: string },
) =>
    | Promise<ApiRequestConfig & { url: string }>
    | (ApiRequestConfig & { url: string });

/**
 * Response interceptor type
 */
export type ResponseInterceptor = <T>(
    response: ApiResponse<T>,
) => Promise<ApiResponse<T>> | ApiResponse<T>;

/**
 * Error interceptor type
 */
export type ErrorInterceptor = (error: ApiError) => Promise<never> | never;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    status: number;
    statusText: string;
    response?: Response;
    data?: unknown;
    url?: string;
    method?: string;

    constructor(
        status: number,
        statusText: string,
        response?: Response,
        data?: unknown,
        url?: string,
        method?: string,
    ) {
        super(`API Error: ${status} ${statusText}`);
        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
        this.response = response;
        this.data = data;
        this.url = url;
        this.method = method;
    }
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
    maxRetries: 2,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
};

class ApiClient {
    private readonly requestInterceptors: RequestInterceptor[] = [];
    private readonly responseInterceptors: ResponseInterceptor[] = [];
    private readonly errorInterceptors: ErrorInterceptor[] = [];
    private defaultTimeout = 30000;
    private defaultRetryConfig = DEFAULT_RETRY_CONFIG;

    /**
     * Add a request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add a response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Add an error interceptor
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): void {
        this.errorInterceptors.push(interceptor);
    }

    /**
     * Set default timeout for all requests
     */
    setDefaultTimeout(timeout: number): void {
        this.defaultTimeout = timeout;
    }

    /**
     * Set default retry configuration
     */
    setDefaultRetryConfig(config: Partial<RetryConfig>): void {
        this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
    }

    /**
     * Get default headers
     */
    private getDefaultHeaders(
        skipDefaultHeaders?: boolean,
    ): Record<string, string> {
        if (skipDefaultHeaders) return {};

        return {
            "Content-Type": "application/json",
            "X-Tenant-ID": "getTenantId()",
        };
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(
        url: string,
        params?: Record<string, string | number | boolean | null | undefined>,
    ): string {
        if (!params) return url;

        const filteredParams = Object.entries(params)
            .filter(([, value]) => value !== null && value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});

        const searchParams = new URLSearchParams(filteredParams);
        const separator = url.includes("?") ? "&" : "?";
        return searchParams.toString()
            ? `${url}${separator}${searchParams.toString()}`
            : url;
    }

    /**
     * Process request body based on content type
     */
    private processRequestBody(
        body: unknown,
        headers: Record<string, string>,
    ): BodyInit | undefined {
        if (!body) return undefined;

        const contentType = headers["Content-Type"] || headers["content-type"];

        // Handle FormData
        if (body instanceof FormData) {
            delete headers["Content-Type"];
            delete headers["content-type"];
            return body;
        }

        // Handle URLSearchParams
        if (body instanceof URLSearchParams) {
            return body.toString();
        }

        // Handle form-urlencoded
        if (contentType?.includes("application/x-www-form-urlencoded")) {
            if (typeof body === "object" && !(body instanceof URLSearchParams)) {
                return new URLSearchParams(body as Record<string, string>).toString();
            }
            return body as string;
        }

        // Default to JSON
        return JSON.stringify(body);
    }

    /**
     * Handle response data based on response type
     */
    private async handleResponseData<T>(
        response: Response,
        responseType: string = "json",
    ): Promise<T> {
        switch (responseType) {
            case "text":
                return (await response.text()) as T;
            case "blob":
                return (await response.blob()) as T;
            case "arrayBuffer":
                return (await response.arrayBuffer()) as T;
            default: {
                const text = await response.text();
                return text ? JSON.parse(text) : ({} as T);
            }
        }
    }

    /**
     * Handle response with error checking
     */
    private async handleResponse<T>(
        response: Response,
        url: string,
        method: string,
        responseType?: string,
    ): Promise<ApiResponse<T>> {
        if (!response.ok) {
            let errorData: unknown;
            try {
                const text = await response.text();
                errorData = text
                    ? text.startsWith("{")
                        ? JSON.parse(text)
                        : text
                    : response.statusText;
            } catch {
                errorData = response.statusText;
            }

            const error = new ApiError(
                response.status,
                typeof errorData === "string" ? errorData : response.statusText,
                response,
                errorData,
                url,
                method,
            );

            apiLogger.error("API request failed", error, {
                url,
                method,
                status: response.status,
                errorData,
            });

            for (const interceptor of this.errorInterceptors) {
                await interceptor(error);
            }

            throw error;
        }

        const data = await this.handleResponseData<T>(response, responseType);
        let apiResponse: ApiResponse<T> = {
            data,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };

        for (const interceptor of this.responseInterceptors) {
            apiResponse = await interceptor(apiResponse);
        }

        return apiResponse;
    }

    /**
     * Execute fetch with timeout
     */
    private async fetchWithTimeout(
        url: string,
        config: RequestInit,
        timeout: number,
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...config,
                signal: config.signal || controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === "AbortError") {
                const timeoutError = new ApiError(
                    408,
                    "Request timeout",
                    undefined,
                    undefined,
                    url,
                    config.method,
                );
                apiLogger.warn("Request timeout", {
                    url,
                    method: config.method,
                    timeout,
                });
                throw timeoutError;
            }
            throw error;
        }
    }

    /**
     * Execute fetch with retry logic
     */
    private async fetchWithRetry(
        url: string,
        config: RequestInit,
        retryConfig: Required<RetryConfig>,
        timeout: number,
    ): Promise<Response> {
        let lastError: ApiError | undefined;

        for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    apiLogger.debug(
                        () => `Retry attempt ${attempt} for ${config.method} ${url}`,
                    );
                }
                return await this.fetchWithTimeout(url, config, timeout);
            } catch (error) {
                if (error instanceof ApiError) {
                    lastError = error;

                    const shouldRetry =
                        retryConfig.retryOn.includes(error.status) &&
                        attempt < retryConfig.maxRetries;

                    if (!shouldRetry) {
                        throw error;
                    }

                    const delay = retryConfig.retryDelay * 2 ** attempt;
                    apiLogger.warn("Request failed, retrying", {
                        url,
                        method: config.method,
                        status: error.status,
                        attempt: attempt + 1,
                        maxRetries: retryConfig.maxRetries,
                        delayMs: delay,
                    });

                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    throw error;
                }
            }
        }

        throw lastError || new Error("Retry logic failed unexpectedly");
    }

    /**
     * Core request method
     */
    async request<T = unknown>(
        method: string,
        url: string,
        body?: unknown,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        const requestId = `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timerLabel = `API-${method}-${url}`;

        apiLogger.time(timerLabel);
        apiLogger.debug(() => `Starting ${method} request to ${url}`, {
            requestId,
            url,
            method,
            hasBody: !!body,
        });

        try {
            const fullUrl = this.buildUrl(url, config.params);

            const headers = {
                ...this.getDefaultHeaders(config.skipDefaultHeaders),
                ...config.headers,
            };

            let requestConfig: ApiRequestConfig & { url: string } = {
                ...config,
                url: fullUrl,
                method,
                headers,
            };

            for (const interceptor of this.requestInterceptors) {
                requestConfig = await interceptor(requestConfig);
            }

            const processedBody = body
                ? this.processRequestBody(
                    body,
                    requestConfig.headers as Record<string, string>,
                )
                : undefined;

            const fetchConfig: RequestInit = {
                method: requestConfig.method,
                headers: requestConfig.headers as Record<string, string>,
                body: processedBody,
                credentials: requestConfig.credentials,
                cache: requestConfig.cache,
                redirect: requestConfig.redirect,
                signal: requestConfig.signal,
                mode: requestConfig.mode,
            };

            const retryConfig = {
                ...this.defaultRetryConfig,
                ...config.retry,
            };

            const timeout = config.timeout || this.defaultTimeout;

            const response = await this.fetchWithRetry(
                requestConfig.url,
                fetchConfig,
                retryConfig,
                timeout,
            );

            const apiResponse = await this.handleResponse<T>(
                response,
                requestConfig.url,
                method,
                config.responseType,
            );

            apiLogger.info(() => `${method} ${url} completed`, {
                requestId,
                status: apiResponse.status,
                url,
                method,
            });

            apiLogger.timeEnd(timerLabel, { requestId, status: apiResponse.status });

            return apiResponse;
        } catch (error) {
            apiLogger.timeEnd(timerLabel, {
                requestId,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            if (error instanceof ApiError) {
                throw error;
            }

            const unknownError = new ApiError(
                500,
                "Network error",
                undefined,
                error,
                url,
                method,
            );
            apiLogger.error(
                "Unexpected network error",
                error instanceof Error ? error : new Error(String(error)),
                {
                    requestId,
                    url,
                    method,
                },
            );

            throw unknownError;
        }
    }

    /**
     * Make a GET request
     */
    async get<T = unknown>(
        url: string,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.request<T>("GET", url, undefined, config);
    }

    /**
     * Make a POST request
     */
    async post<T = unknown>(
        url: string,
        body?: unknown,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.request<T>("POST", url, body, config);
    }

    /**
     * Make a PUT request
     */
    async put<T = unknown>(
        url: string,
        body?: unknown,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.request<T>("PUT", url, body, config);
    }

    /**
     * Make a DELETE request
     */
    async delete<T = unknown>(
        url: string,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        return this.request<T>("DELETE", url, undefined, config);
    }

    /**
     * Upload file
     */
    async upload<T = unknown>(
        url: string,
        file: File | FormData,
        config: ApiRequestConfig = {},
    ): Promise<ApiResponse<T>> {
        apiLogger.debug(() => "Starting file upload", {
            url,
            fileName: file instanceof File ? file.name : "FormData",
            fileSize: file instanceof File ? file.size : undefined,
        });

        const formData =
            file instanceof FormData
                ? file
                : (() => {
                    const fd = new FormData();
                    fd.append("file", file);
                    return fd;
                })();

        return this.post<T>(url, formData, config);
    }

    /**
     * Extract filename from Content-Disposition header
     */
    private extractFilename(headers: Headers, fallbackFilename: string): string {
        const contentDisposition = headers.get("Content-Disposition");
        if (contentDisposition) {
            // Try to match filename*=UTF-8''filename or filename="filename" or filename=filename
            const filenameStarMatch = contentDisposition.match(
                /filename\*=UTF-8''([^;\n]+)/,
            );
            if (filenameStarMatch?.[1]) {
                return decodeURIComponent(filenameStarMatch[1]);
            }

            const filenameMatch = contentDisposition.match(
                /filename[^;=\n]*=(["'])(.*?)\1|filename[^;=\n]*=([^;\n]+)/,
            );
            if (filenameMatch) {
                // Group 2 contains quoted filename, group 3 contains unquoted filename
                const filename = filenameMatch[2] || filenameMatch[3];
                if (filename) {
                    return filename.trim();
                }
            }
        }
        return fallbackFilename;
    }

    /**
     * Download file with automatic filename extraction from Content-Disposition header
     */
    async download(
        url: string,
        fallbackFilename: string,
        config: ApiRequestConfig = {},
    ): Promise<void> {
        apiLogger.debug(() => "Starting file download", { url, fallbackFilename });

        const response = await this.get<Blob>(url, {
            ...config,
            responseType: "blob",
        });

        const filename = this.extractFilename(response.headers, fallbackFilename);
        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        apiLogger.info("File downloaded successfully", {
            filename,
            size: blob.size,
        });
    }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Create a single instance of Cookies to be reused across requests
const cookies = new Cookies();

apiClient.addRequestInterceptor((config) => {
    const token = cookies.get("accessToken");
    const locale = cookies.get("locale");

    if (token) {
        config.headers ??= {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (locale) {
        config.headers ??= {};
        config.headers.locale = locale;
    }
    return config;
});

// Export default
export default apiClient;
