// File: frontend/src/services/guestApi.js

/**
 * Guest API Service - Handles all guest user interactions
 * 
 * This service is completely separate from the main API service because:
 * 1. Different authentication model (guest tokens vs Firebase tokens)
 * 2. Different error handling (session expiration vs user auth)
 * 3. Separation of concerns (guest functionality is self-contained)
 */

import axios from 'axios';
import i18n from '../i18n/index';

// Same-origin base in dev, VITE_API_URL in prod
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl;
  if (typeof window !== 'undefined') return '';
  return 'http://localhost:8000';
};
const API_BASE_URL = resolveBaseUrl();

// Build a WebSocket URL that respects VITE_API_URL in prod and stays relative in dev
const buildWsUrl = (path) => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() && typeof window !== 'undefined') {
    const base = new URL(envUrl, window.location.origin);
    const wsProto = base.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = base.host; // includes port if any
    const basePath = base.pathname.replace(/\/$/, ''); // ensure no trailing slash
    return `${wsProto}//${host}${basePath}${path}`;
  }
  return path; // relative for dev proxy
};

/**
 * Create a public API instance for guest requests (no authentication required)
 */
const guestApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add language header to all guest requests
guestApi.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language || 'en';
  return config;
});

// Guest-specific error handler
guestApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Guest API Error:', error);
    
    // Handle guest-specific errors
    if (error.response?.status === 404 && error.response?.data?.detail?.includes('session')) {
      throw new Error('Session expired or not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Session access denied');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment.');
    }
    
    throw error;
  }
);

/**
 * Start a new guest session for anonymous users.
 * Creates a guest user, session, and initial conversation.
 * 
 * @returns {Promise<object>} Guest session data including:
 *   - guest_token: Token for guest authentication
 *   - session_id: Session ID for tracking limits
 *   - conversation_id: Conversation ID for WebSocket
 *   - expires_at: Session expiration time
 *   - max_messages: Maximum messages allowed
 *   - websocket_url: WebSocket connection URL
 */
export const startGuestSession = async (options = {}) => {
  try {
    console.log('Starting guest session with options:', options);
    const response = await guestApi.post('/api/guest/start', options);
    console.log('Guest session started:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to start guest session:', error);
    throw new Error('Unable to start consultation. Please try again.');
  }
};

/**
 * Get session statistics for a guest session.
 * 
 * @param {string} sessionId - The guest session ID
 * @returns {Promise<object>} Session statistics including:
 *   - messages_used: Number of messages used
 *   - messages_remaining: Number of messages remaining
 *   - max_messages: Maximum messages allowed
 *   - time_remaining_seconds: Time remaining in seconds
 *   - expires_at: Session expiration time (ISO string)
 *   - is_expired: Whether session has expired
 *   - is_at_message_limit: Whether message limit reached
 */
export const getGuestSessionStats = async (sessionId) => {
  try {
    const response = await guestApi.get(`/api/guest/session/${sessionId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Failed to get guest session stats:', error);
    throw new Error('Unable to get session information');
  }
};

/**
 * Get available AI personas for guest users.
 * Returns a curated list of personas suitable for guest experience.
 * 
 * @returns {Promise<Array>} List of persona objects with:
 *   - id: Persona ID
 *   - name: Persona name
 *   - specialty: Medical specialty
 *   - public_bio: Public biography
 *   - image: Image URL
 */
export const getGuestPersonas = async () => {
  try {
    const response = await guestApi.get('/api/guest/personas');
    return response.data.personas || [];
  } catch (error) {
    console.error('Failed to get guest personas:', error);
    throw new Error('Unable to get available specialists');
  }
};

/**
 * Connect to the guest WebSocket for real-time chat.
 * Handles all WebSocket events and provides callbacks for the UI.
 * 
 * @param {string} conversationId - The guest conversation ID
 * @param {string} guestToken - The guest user token
 * @param {object} handlers - Event handlers for WebSocket events:
 *   - onOpen: Called when connection opens
 *   - onMessage: Called when message received
 *   - onError: Called on error
 *   - onClose: Called when connection closes
 * @returns {WebSocket} The WebSocket connection
 */
export const connectGuestWebSocket = (conversationId, guestToken, handlers = {}) => {
  const language = i18n.language || 'en';
  const wsUrl = buildWsUrl(`/api/guest/ws/${conversationId}?token=${guestToken}&language=${language}`);
  
  console.log('Connecting to guest WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = (event) => {
    console.log('Guest WebSocket connected');
    if (handlers.onOpen) handlers.onOpen(event);
  };
  
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log('Guest WebSocket message:', message);
      
      // Handle different message types
      if (message.type === 'error') {
        console.error('WebSocket error message:', message.detail || message.message);
        if (handlers.onError) {
          handlers.onError(new Error(message.detail || message.message));
          return;
        }
      }
      
      if (handlers.onMessage) handlers.onMessage(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      if (handlers.onError) handlers.onError(error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('Guest WebSocket error:', error);
    if (handlers.onError) handlers.onError(error);
  };
  
  ws.onclose = (event) => {
    console.log('Guest WebSocket closed:', event.code, event.reason);
    if (handlers.onClose) handlers.onClose(event);
  };
  
  return ws;
};

/**
 * Send a message through the guest WebSocket.
 * Helper function to send properly formatted messages.
 * 
 * @param {WebSocket} ws - The WebSocket connection
 * @param {string} content - The message content
 */
export const sendGuestMessage = (ws, content) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    throw new Error('WebSocket connection not available');
  }
  
  console.log('i18n object:', i18n);
  console.log('i18n.language:', i18n.language);
  
  const message = {
    type: 'user_message',
    content: content.trim(),
    lang: i18n.language || 'en'  // Include the current language
  };
  
  console.log('Sending guest message:', message);
  console.log('Language being sent:', message.lang);
  ws.send(JSON.stringify(message));
};

/**
 * Cleanup expired guest sessions (utility function).
 * This is typically called by administrators or background processes.
 * 
 * @returns {Promise<object>} Cleanup results with deleted session count
 */
export const cleanupExpiredGuestSessions = async () => {
  try {
    const response = await guestApi.post('/api/guest/cleanup-expired');
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    throw new Error('Unable to cleanup expired sessions');
  }
};

/**
 * Utility function to format time remaining in a human-readable way.
 * 
 * @param {number} seconds - Time remaining in seconds
 * @returns {string} Formatted time string (e.g., "14:30")
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return "0:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Utility function to check if a guest session is near expiration.
 * 
 * @param {object} sessionStats - Session statistics object
 * @returns {object} Warning states for UI
 */
export const getSessionWarnings = (sessionStats) => {
  if (!sessionStats) return { timeWarning: false, messageWarning: false };
  
  const timeWarning = sessionStats.time_remaining_seconds <= 30; // 30 seconds
  const messageWarning = false; // Disabled message warnings
  
  return { timeWarning, messageWarning };
};

export default {
  startGuestSession,
  getGuestSessionStats,
  getGuestPersonas,
  connectGuestWebSocket,
  sendGuestMessage,
  cleanupExpiredGuestSessions,
  formatTimeRemaining,
  getSessionWarnings
};