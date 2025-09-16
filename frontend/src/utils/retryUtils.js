/**
 * Retry utilities for critical operations
 * 
 * Provides exponential backoff retry logic for operations that may fail
 * due to race conditions, network issues, or temporary service unavailability.
 */

/**
 * Retry an operation with exponential backoff
 * @param {function} operation - Async function to retry
 * @param {object} options - Retry configuration
 * @returns {Promise} Result of the operation
 */
export const retryWithBackoff = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    jitter = true,
    retryCondition = (error) => true,
    onRetry = null,
    debugMode = process.env.NODE_ENV === 'development'
  } = options;

  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      if (debugMode && attempt > 1) {
        console.log(`🔄 Retry attempt ${attempt - 1}/${maxRetries}`);
      }
      
      const result = await operation();
      
      if (debugMode && attempt > 1) {
        console.log(`✅ Operation succeeded on attempt ${attempt}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // If this was the last attempt, throw the error
      if (attempt > maxRetries) {
        if (debugMode) {
          console.error(`❌ Operation failed after ${maxRetries} retries:`, error);
        }
        throw error;
      }
      
      // Check if we should retry this error
      if (!retryCondition(error)) {
        if (debugMode) {
          console.log('🚫 Error not retryable:', error.message);
        }
        throw error;
      }
      
      // Calculate delay with exponential backoff
      let delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
      
      // Add jitter to prevent thundering herd
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }
      
      if (debugMode) {
        console.warn(`⏳ Operation failed (attempt ${attempt}/${maxRetries + 1}), retrying in ${Math.round(delay)}ms:`, error.message);
      }
      
      // Call retry callback if provided
      if (onRetry) {
        try {
          await onRetry(error, attempt);
        } catch (retryCallbackError) {
          console.error('Error in retry callback:', retryCallbackError);
        }
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Specialized retry for authentication operations
 * @param {function} operation - Auth operation to retry
 * @param {object} options - Configuration options
 * @returns {Promise} Result of the operation
 */
export const retryAuthOperation = (operation, options = {}) => {
  const authRetryCondition = (error) => {
    // Retry on network errors, timeouts, and temporary server errors
    const retryableCodes = [
      'NETWORK_ERROR',
      'TOKEN_TIMEOUT', 
      'auth/network-request-failed',
      'auth/timeout',
      'auth/internal-error'
    ];
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return retryableCodes.includes(error.code) ||
           retryableStatuses.includes(error.status) ||
           error.name === 'NetworkError' ||
           error.message.includes('timeout');
  };

  return retryWithBackoff(operation, {
    maxRetries: 3,
    initialDelay: 500,
    retryCondition: authRetryCondition,
    ...options
  });
};

/**
 * Specialized retry for Firebase sync operations
 * @param {function} syncOperation - Sync operation to retry
 * @param {object} options - Configuration options
 * @returns {Promise} Result of the sync operation
 */
export const retrySyncOperation = (syncOperation, options = {}) => {
  const syncRetryCondition = (error) => {
    // Don't retry on 400-level errors except rate limiting
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return error.response.status === 429; // Rate limited
    }
    
    // Retry on network errors and 5xx server errors
    return error.code === 'ERR_NETWORK' || 
           error.response?.status >= 500 ||
           error.name === 'NetworkError';
  };

  return retryWithBackoff(syncOperation, {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    retryCondition: syncRetryCondition,
    onRetry: (error, attempt) => {
      console.log(`🔄 Sync operation retry ${attempt}: ${error.message}`);
    },
    ...options
  });
};

/**
 * Specialized retry for profile loading operations
 * @param {function} profileOperation - Profile loading operation to retry
 * @param {object} options - Configuration options
 * @returns {Promise} Result of the profile operation
 */
export const retryProfileOperation = (profileOperation, options = {}) => {
  const profileRetryCondition = (error) => {
    // Don't retry on authentication errors or user not found
    const nonRetryableCodes = [401, 403, 404];
    
    if (nonRetryableCodes.includes(error.response?.status)) {
      return false;
    }
    
    // Retry on network errors and temporary server issues
    return error.code === 'ERR_NETWORK' || 
           error.response?.status >= 500 ||
           error.name === 'NetworkError';
  };

  return retryWithBackoff(profileOperation, {
    maxRetries: 3,
    initialDelay: 500,
    retryCondition: profileRetryCondition,
    ...options
  });
};

/**
 * Circuit breaker pattern implementation for critical operations
 */
export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.reset();
        }
      } else {
        this.reset();
      }
      
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      successCount: this.successCount
    };
  }
}

/**
 * Timeout wrapper for operations
 * @param {function} operation - Operation to execute with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} timeoutMessage - Custom timeout message
 * @returns {Promise} Result of the operation or timeout error
 */
export const withTimeout = (operation, timeout = 10000, timeoutMessage = 'Operation timed out') => {
  return Promise.race([
    operation(),
    new Promise((_, reject) => {
      setTimeout(() => {
        const error = new Error(timeoutMessage);
        error.code = 'TIMEOUT';
        reject(error);
      }, timeout);
    })
  ]);
};

/**
 * Debounced retry - prevents multiple rapid retry attempts
 * @param {function} operation - Operation to retry
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @param {object} retryOptions - Retry configuration
 * @returns {Promise} Result of the operation
 */
export const debouncedRetry = (() => {
  const debounceMap = new Map();
  
  return (operation, debounceMs = 1000, retryOptions = {}) => {
    const operationKey = operation.toString();
    
    if (debounceMap.has(operationKey)) {
      return debounceMap.get(operationKey);
    }
    
    const promise = retryWithBackoff(operation, retryOptions)
      .finally(() => {
        setTimeout(() => debounceMap.delete(operationKey), debounceMs);
      });
    
    debounceMap.set(operationKey, promise);
    return promise;
  };
})();

// Development utilities
if (process.env.NODE_ENV === 'development') {
  window.retryUtils = {
    retryWithBackoff,
    retryAuthOperation,
    retrySyncOperation,
    retryProfileOperation,
    CircuitBreaker,
    withTimeout,
    debouncedRetry
  };
}