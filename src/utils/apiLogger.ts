/**
 * API Request/Response Logger
 * Helps debug API interactions by logging detailed information
 */

interface LogConfig {
  enabled: boolean;
  logRequests: boolean;
  logResponses: boolean;
  logErrors: boolean;
  useColors: boolean;
}

class ApiLogger {
  private config: LogConfig = {
    enabled: import.meta.env.DEV, // Only enable in development
    logRequests: true,
    logResponses: true,
    logErrors: true,
    useColors: true,
  };

  /**
   * Log API request
   */
  logRequest(method: string, url: string, data?: unknown, headers?: Record<string, string>) {
    if (!this.config.enabled || !this.config.logRequests) return;

    const style = this.config.useColors ? 'color: #2563eb; font-weight: bold;' : '';

    console.group(`%c→ ${method} ${url}`, style);
    console.log('📤 Request Time:', new Date().toLocaleTimeString());
    if (headers) {
      console.log('📋 Headers:', headers);
    }
    if (data) {
      console.log('📦 Payload:', data);
    }
    console.groupEnd();
  }

  /**
   * Log API response
   */
  logResponse(
    method: string,
    url: string,
    status: number,
    statusText: string,
    data: unknown,
    duration: number
  ) {
    if (!this.config.enabled || !this.config.logResponses) return;

    const isSuccess = status >= 200 && status < 300;
    const style = this.config.useColors
      ? isSuccess
        ? 'color: #16a34a; font-weight: bold;'
        : 'color: #ea580c; font-weight: bold;'
      : '';

    console.group(`%c← ${status} ${method} ${url}`, style);
    console.log('📥 Response Time:', new Date().toLocaleTimeString());
    console.log(`⏱️ Duration: ${duration.toFixed(0)}ms`);
    console.log('📊 Status:', `${status} ${statusText}`);
    console.log('📦 Data:', data);
    console.groupEnd();
  }

  /**
   * Log API error
   */
  logError(
    method: string,
    url: string,
    error: Error,
    status?: number,
    duration?: number
  ) {
    if (!this.config.enabled || !this.config.logErrors) return;

    const style = this.config.useColors ? 'color: #dc2626; font-weight: bold;' : '';

    console.group(`%c✖ ERROR ${method} ${url}`, style);
    console.error('❌ Error Time:', new Date().toLocaleTimeString());
    if (duration !== undefined) {
      console.error(`⏱️ Duration: ${duration.toFixed(0)}ms`);
    }
    console.error('🔴 Error Type:', error.name);
    console.error('💬 Message:', error.message);
    if (status) {
      console.error('📊 Status:', status);
    }
    console.error('📋 Full Error:', error);
    console.groupEnd();
  }

  /**
   * Log network error (no response)
   */
  logNetworkError(method: string, url: string, duration?: number) {
    if (!this.config.enabled || !this.config.logErrors) return;

    const style = this.config.useColors ? 'color: #dc2626; font-weight: bold; background: #fee2e2;' : '';

    console.group(`%c🔌 NETWORK ERROR ${method} ${url}`, style);
    console.error('❌ Time:', new Date().toLocaleTimeString());
    if (duration !== undefined) {
      console.error(`⏱️ Duration: ${duration.toFixed(0)}ms`);
    }
    console.error('⚠️ Issue: No response from server');
    console.error('💡 Possible causes:');
    console.error('   - Server is down or unreachable');
    console.error('   - CORS policy blocking the request');
    console.error('   - Network connection lost');
    console.error('   - Request timeout exceeded');
    console.groupEnd();
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();
