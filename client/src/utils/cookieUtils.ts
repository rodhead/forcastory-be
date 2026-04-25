import { Cookies } from "react-cookie";
import logger from "./logger/logger";

export interface OriginAndTenant {
    origin: string;
    tenantId: string;
}

export interface Tenant {
    tenantId: string;
}

export const getOriginAndTenantId = (): OriginAndTenant | null => {
    const cookies = new Cookies();
    const origin = cookies.get("origin");
    const tenantId = cookies.get("auth_tenantId");
    if (!origin || !tenantId) {
        logger.error("Origin or TenantId is not available in cookies");
        return null;
    }
    return { origin, tenantId };
};

export const getTenantId = (): string | null => {
    const cookies = new Cookies();
    const tenantId = cookies.get("auth_tenantId");
    if (!tenantId) {
        logger.error("TenantId is not available in cookies");
        return null;
    }
    return tenantId;
};

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
    // Try to remove using react-cookie (handles most cases)
    const cookies = new Cookies();
    cookies.remove(name, { path: "/" });
}

/**
 * Get cookie value by name
 */
export function getCookie(name: string): string | undefined {
    const cookies = new Cookies();
    return cookies.get(name);
}
