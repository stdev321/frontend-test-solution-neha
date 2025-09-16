/**
 * TokenManager - Handles Firebase token lifecycle and availability
 * 
 * This class solves the critical race condition where API calls are made
 * before Firebase tokens are ready. It provides a reliable way to get
 * valid tokens with timeout protection and concurrent request deduplication.
 */

import { getAuth, getIdToken } from 'firebase/auth';

class TokenManager {
  constructor() {
    this.currentToken = null;
    this.tokenPromise = null;
    this.refreshPromise = null;
    this.listeners = new Set();
  }

  /**
   * Get a valid Firebase token, waiting if necessary
   * @param {number} timeout - Maximum time to wait for token (ms)
   * @returns {Promise<string|null>} Valid Firebase token or null
   */
  async getValidToken(timeout = 5000) {
    // If we have a valid cached token, return it immediately
    if (this.currentToken && !this.isTokenExpired(this.currentToken)) {
      return this.currentToken;
    }

    // If there's already a token request in progress, wait for it
    if (this.tokenPromise) {
      try {
        return await this.tokenPromise;
      } catch (error) {
        // If the existing promise failed, we'll try again below
        this.tokenPromise = null;
      }
    }

    // Create a new token request
    this.tokenPromise = this.refreshToken(timeout);
    
    try {
      this.currentToken = await this.tokenPromise;
      this.notifyListeners('token-updated', this.currentToken);
      return this.currentToken;
    } catch (error) {
      console.error('Failed to get valid token:', error);
      this.notifyListeners('token-error', error);
      return null;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Refresh the Firebase token with retry logic
   * @private
   * @param {number} timeout - Maximum time to wait
   * @returns {Promise<string>} New Firebase token
   */
  async refreshToken(timeout) {
    const startTime = Date.now();
    const retryInterval = 200; // Check every 200ms
    let lastError;

    while ((Date.now() - startTime) < timeout) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          // Force refresh if token is expired or about to expire
          const forceRefresh = this.currentToken && this.isTokenExpired(this.currentToken);
          const token = await getIdToken(user, forceRefresh);
          
          if (token && token !== this.currentToken) {
            console.log('Token refreshed successfully');
            return token;
          }
        } else {
          // No user yet - might still be loading
          await new Promise(resolve => setTimeout(resolve, retryInterval));
          continue;
        }
      } catch (error) {
        lastError = error;
        console.warn('Token refresh attempt failed:', error.message);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }

    const timeoutError = new Error(
      `Token not available within ${timeout}ms. Last error: ${lastError?.message || 'Unknown'}`
    );
    timeoutError.code = 'TOKEN_TIMEOUT';
    throw timeoutError;
  }

  /**
   * Check if a token is expired or about to expire
   * @private
   * @param {string} token - JWT token to check
   * @returns {boolean} True if token is expired
   */
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      // Consider token expired if it expires within 30 seconds
      return now >= (payload.exp - 30);
    } catch (error) {
      console.warn('Failed to parse token:', error);
      return true;
    }
  }

  /**
   * Get token information for debugging
   * @returns {object} Token information
   */
  getTokenInfo() {
    if (!this.currentToken) {
      return { status: 'no-token' };
    }

    try {
      const payload = JSON.parse(atob(this.currentToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;
      
      return {
        status: 'valid',
        expiresIn: expiresIn,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        isExpired: expiresIn <= 0,
        willExpireSoon: expiresIn <= 30
      };
    } catch (error) {
      return { status: 'invalid', error: error.message };
    }
  }

  /**
   * Clear cached token and notify listeners
   */
  clearToken() {
    const hadToken = !!this.currentToken;
    this.currentToken = null;
    this.tokenPromise = null;
    this.refreshPromise = null;
    
    if (hadToken) {
      console.log('Token cleared');
      this.notifyListeners('token-cleared');
    }
  }

  /**
   * Add event listener for token events
   * @param {string} event - Event name ('token-updated', 'token-error', 'token-cleared')
   * @param {function} callback - Callback function
   */
  addListener(event, callback) {
    this.listeners.add({ event, callback });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {function} callback - Callback function
   */
  removeListener(event, callback) {
    this.listeners.forEach(listener => {
      if (listener.event === event && listener.callback === callback) {
        this.listeners.delete(listener);
      }
    });
  }

  /**
   * Notify all listeners of an event
   * @private
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (listener.event === event) {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Error in token listener:', error);
        }
      }
    });
  }

  /**
   * Preload token in background (useful for warming up)
   * @param {number} timeout - Maximum time to wait
   * @returns {Promise<boolean>} True if token was successfully preloaded
   */
  async preloadToken(timeout = 2000) {
    try {
      const token = await this.getValidToken(timeout);
      return !!token;
    } catch (error) {
      console.warn('Token preload failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const tokenManager = new TokenManager();

// Export class for testing
export { TokenManager };

// Development utilities
if (process.env.NODE_ENV === 'development') {
  window.tokenManager = tokenManager;
  window.debugToken = () => {
    console.log('Token Manager Debug Info:');
    console.log('Token Info:', tokenManager.getTokenInfo());
    console.log('Has cached token:', !!tokenManager.currentToken);
    console.log('Has pending promise:', !!tokenManager.tokenPromise);
  };
}