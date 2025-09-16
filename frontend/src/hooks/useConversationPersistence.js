import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ai_chat_current_conversation';
const STORAGE_TIMESTAMP_KEY = 'ai_chat_conversation_timestamp';
const MAX_AGE_HOURS = 24; // Conversation considered stale after 24 hours

/**
 * Hook to persist and retrieve the current conversation ID
 * Saves to localStorage whenever conversation changes
 * Retrieves on app load to allow continuation
 */
export function useConversationPersistence(conversationId) {
  // Save conversation ID when it changes
  useEffect(() => {
    if (conversationId) {
      // Save the conversation ID and timestamp
      localStorage.setItem(STORAGE_KEY, conversationId);
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      console.log('[ConversationPersistence] Saved conversation:', conversationId);
    }
  }, [conversationId]);

  // Get saved conversation ID
  const getSavedConversationId = useCallback(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
      
      if (!savedId) {
        return null;
      }

      // Check if conversation is too old
      if (savedTimestamp) {
        const age = Date.now() - parseInt(savedTimestamp);
        const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
        
        if (age > maxAge) {
          console.log('[ConversationPersistence] Saved conversation is too old, ignoring');
          clearSavedConversation();
          return null;
        }
      }

      console.log('[ConversationPersistence] Retrieved saved conversation:', savedId);
      return savedId;
    } catch (error) {
      console.error('[ConversationPersistence] Error retrieving saved conversation:', error);
      return null;
    }
  }, []);

  // Clear saved conversation (when user explicitly exits)
  const clearSavedConversation = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
      console.log('[ConversationPersistence] Cleared saved conversation');
    } catch (error) {
      console.error('[ConversationPersistence] Error clearing saved conversation:', error);
    }
  }, []);

  // Check if there's a saved conversation
  const hasSavedConversation = useCallback(() => {
    const savedId = getSavedConversationId();
    return savedId !== null;
  }, [getSavedConversationId]);

  return {
    getSavedConversationId,
    clearSavedConversation,
    hasSavedConversation
  };
}

/**
 * Static helper functions for use outside of React components
 */
export const ConversationPersistence = {
  save: (conversationId) => {
    if (conversationId) {
      localStorage.setItem(STORAGE_KEY, conversationId);
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
    }
  },
  
  get: () => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
      
      if (!savedId) return null;
      
      // Check age
      if (savedTimestamp) {
        const age = Date.now() - parseInt(savedTimestamp);
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (age > maxAge) {
          ConversationPersistence.clear();
          return null;
        }
      }
      
      return savedId;
    } catch {
      return null;
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
    } catch {
      // Ignore errors
    }
  },
  
  exists: () => {
    return ConversationPersistence.get() !== null;
  }
};