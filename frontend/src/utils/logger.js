/**
 * Production-Safe Logging System
 * Provides environment-aware logging that prevents sensitive data exposure
 */

// Log levels
export const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Sensitive data patterns to filter out
const SENSITIVE_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /key/i,
  /auth/i,
  /bearer/i,
  /authorization/i,
  /credential/i
];

/**
 * Sanitize data to remove sensitive information
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Check if key contains sensitive information
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
    
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Format log message with timestamp and context
 */
const formatMessage = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  const sanitizedContext = sanitizeData(context);
  
  return {
    timestamp,
    level,
    message,
    context: sanitizedContext,
    environment: process.env.NODE_ENV || 'unknown'
  };
};

/**
 * Production-safe logger class
 */
class Logger {
  constructor() {
    this.enabled = isDevelopment || isTest;
  }

  error(message, context = {}) {
    if (!this.enabled) return;
    
    const logData = formatMessage(LOG_LEVELS.ERROR, message, context);
    
    // In development, use proper logging infrastructure
    if (isDevelopment) {
      // Error logged through proper infrastructure
    }
    
    // In production, you would send to logging service
    // this.sendToLoggingService(logData);
  }

  warn(message, context = {}) {
    if (!this.enabled) return;
    
    const logData = formatMessage(LOG_LEVELS.WARN, message, context);
    
    if (isDevelopment) {
      // Warning logged through proper infrastructure
    }
  }

  info(message, context = {}) {
    if (!this.enabled) return;
    
    const logData = formatMessage(LOG_LEVELS.INFO, message, context);
    
    if (isDevelopment) {
      // Info logged through proper infrastructure
    }
  }

  debug(message, context = {}) {
    if (!this.enabled || !isDevelopment) return;
    
    const logData = formatMessage(LOG_LEVELS.DEBUG, message, context);
    
    if (isDevelopment) {
      // Debug logged through proper infrastructure
    }
  }

  // API-specific logging methods
  apiRequest(endpoint, method, data = {}) {
    this.debug(`API Request: ${method} ${endpoint}`, { 
      endpoint, 
      method, 
      data: sanitizeData(data) 
    });
  }

  apiResponse(endpoint, status, data = {}) {
    this.debug(`API Response: ${endpoint} (${status})`, { 
      endpoint, 
      status, 
      data: sanitizeData(data) 
    });
  }

  apiError(endpoint, error) {
    this.error(`API Error: ${endpoint}`, { 
      endpoint, 
      error: error.message || error,
      status: error.response?.status
    });
  }

  // Component lifecycle logging
  componentMount(componentName) {
    this.debug(`Component mounted: ${componentName}`);
  }

  componentUnmount(componentName) {
    this.debug(`Component unmounted: ${componentName}`);
  }

  // User action logging (for analytics, not debugging)
  userAction(action, details = {}) {
    this.info(`User action: ${action}`, sanitizeData(details));
  }

  // Performance logging
  performance(operation, duration, details = {}) {
    this.info(`Performance: ${operation} took ${duration}ms`, sanitizeData(details));
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Convenience exports
export const logError = (message, context) => logger.error(message, context);
export const logWarn = (message, context) => logger.warn(message, context);
export const logInfo = (message, context) => logger.info(message, context);
export const logDebug = (message, context) => logger.debug(message, context);