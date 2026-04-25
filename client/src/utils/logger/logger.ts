/**
 * Log levels for different types of messages
 */
export const LogLevel = {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
} as const;

export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

/**
 * Logger configuration interface
 */
interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    prefix?: string;
}

/**
 * Lazy message supplier for performance optimization
 * Prevents expensive string operations when log level is disabled
 */
type MessageSupplier = () => string;

/**
 * Log context for structured logging
 */
interface LogContext {
    [key: string]: unknown;
}

class Logger {
    private config: LoggerConfig;
    private timers: Map<string, number>;

    constructor(config: Partial<LoggerConfig> = {}) {
        this.config = {
            enabled:
                import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGGING === "true",
            level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || LogLevel.INFO,
            prefix: "[BOM-UI]",
            ...config,
        };
        this.timers = new Map();
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) {
            return false;
        }

        const levels = [
            LogLevel.ERROR,
            LogLevel.WARN,
            LogLevel.INFO,
            LogLevel.DEBUG,
        ];
        const currentLevelIndex = levels.indexOf(this.config.level);
        const messageLevelIndex = levels.indexOf(level);

        return messageLevelIndex <= currentLevelIndex;
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext,
    ): string {
        const timestamp = new Date().toISOString();
        const prefix = this.config.prefix ? `${this.config.prefix} ` : "";
        let formattedMessage = `${prefix}[${timestamp}] [${level.toUpperCase()}] ${message}`;

        if (context && Object.keys(context).length > 0) {
            formattedMessage += ` ${JSON.stringify(context)}`;
        }

        return formattedMessage;
    }

    private resolveMessage(message: string | MessageSupplier): string {
        return typeof message === "function" ? message() : message;
    }

    /**
     * Log error messages with optional error object and context
     */
    error(
        message: string | MessageSupplier,
        error?: Error,
        context?: LogContext,
    ): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const resolvedMessage = this.resolveMessage(message);
            const formattedMessage = this.formatMessage(
                LogLevel.ERROR,
                resolvedMessage,
                context,
            );
            // eslint-disable-next-line no-console
            console.error(formattedMessage, error || "");
        }
    }

    /**
     * Log warning messages with optional context
     */
    warn(message: string | MessageSupplier, context?: LogContext): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const resolvedMessage = this.resolveMessage(message);
            const formattedMessage = this.formatMessage(
                LogLevel.WARN,
                resolvedMessage,
                context,
            );
            // eslint-disable-next-line no-console
            console.warn(formattedMessage);
        }
    }

    /**
     * Log info messages with optional context
     */
    info(message: string | MessageSupplier, context?: LogContext): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const resolvedMessage = this.resolveMessage(message);
            const formattedMessage = this.formatMessage(
                LogLevel.INFO,
                resolvedMessage,
                context,
            );
            // eslint-disable-next-line no-console
            console.info(formattedMessage);
        }
    }

    /**
     * Log debug messages with optional context
     */
    debug(message: string | MessageSupplier, context?: LogContext): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const resolvedMessage = this.resolveMessage(message);
            const formattedMessage = this.formatMessage(
                LogLevel.DEBUG,
                resolvedMessage,
                context,
            );
            // eslint-disable-next-line no-console
            console.debug(formattedMessage);
        }
    }

    /**
     * Start performance timer
     */
    time(label: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.timers.set(label, performance.now());
        }
    }

    /**
     * End performance timer and log duration
     */
    timeEnd(label: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const startTime = this.timers.get(label);
            if (startTime !== undefined) {
                const duration = performance.now() - startTime;
                this.debug(`${label} completed in ${duration.toFixed(2)}ms`, context);
                this.timers.delete(label);
            }
        }
    }

    /**
     * Create a scoped logger with additional context
     */
    scope(scopeName: string): Logger {
        return new Logger({
            ...this.config,
            prefix: `${this.config.prefix}[${scopeName}]`,
        });
    }
}

// Create default logger instance
export const logger = new Logger();

// Create service-specific loggers
export const apiLogger = logger.scope("API");
export const serviceLogger = logger.scope("Service");
export const componentLogger = logger.scope("Component");

// Export default logger
export default logger;
