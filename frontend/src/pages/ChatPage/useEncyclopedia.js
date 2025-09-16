import { useState, useCallback, useEffect } from 'react';
import {
  queryEncyclopedia,
} from '../../services/api'; // Assuming API is correctly pathed

// Cache keys for sessionStorage
const CACHE_KEY_QUERY = 'VirtualMD_encyclopedia_last_query';
const CACHE_KEY_RESPONSE = 'VirtualMD_encyclopedia_cached_response';

// Helper functions for cache management
const getCachedQuery = () => {
  try {
    return sessionStorage.getItem(CACHE_KEY_QUERY) || '';
  } catch (e) {
    return '';
  }
};

const getCachedResponse = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY_RESPONSE);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

const setCachedQuery = (query) => {
  try {
    sessionStorage.setItem(CACHE_KEY_QUERY, query);
  } catch (e) {
    // Silent fail if sessionStorage is unavailable
  }
};

const setCachedResponse = (response) => {
  try {
    sessionStorage.setItem(CACHE_KEY_RESPONSE, JSON.stringify(response));
  } catch (e) {
    // Silent fail if sessionStorage is unavailable
  }
};

const clearCache = () => {
  try {
    console.log('Encyclopedia: clearCache() called - clearing all sessionStorage');
    sessionStorage.removeItem(CACHE_KEY_QUERY);
    sessionStorage.removeItem(CACHE_KEY_RESPONSE);
    sessionStorage.removeItem('VirtualMD_encyclopedia_query_text'); // Also clear the input text
  } catch (e) {
    // Silent fail if sessionStorage is unavailable
  }
};

const clearCacheManually = () => {
  try {
    console.log('Encyclopedia: clearCacheManually() called - clearing all sessionStorage');
    sessionStorage.removeItem(CACHE_KEY_QUERY);
    sessionStorage.removeItem(CACHE_KEY_RESPONSE);
    sessionStorage.removeItem('VirtualMD_encyclopedia_query_text'); // Also clear the input text
  } catch (e) {
    // Silent fail if sessionStorage is unavailable
  }
};

export const useEncyclopedia = (conversationId) => {
  const [encyclopediaResponse, setEncyclopediaResponse] = useState(null);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);
  const [encyclopediaError, setEncyclopediaError] = useState(null);
  
  // Make cache keys conversation-aware
  const CACHE_KEY = conversationId 
    ? `encyclopedia_${conversationId}_cache` 
    : 'VirtualMD_encyclopedia_cached_response';
  const QUERY_KEY = conversationId
    ? `encyclopedia_${conversationId}_query`
    : 'VirtualMD_encyclopedia_last_query';
  
  // Helper functions using dynamic cache keys
  const getConversationCachedQuery = useCallback(() => {
    try {
      return sessionStorage.getItem(QUERY_KEY) || '';
    } catch (e) {
      return '';
    }
  }, [QUERY_KEY]);

  const getConversationCachedResponse = useCallback(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }, [CACHE_KEY]);

  const setConversationCachedQuery = useCallback((query) => {
    try {
      sessionStorage.setItem(QUERY_KEY, query);
    } catch (e) {
      // Silent fail
    }
  }, [QUERY_KEY]);

  const setConversationCachedResponse = useCallback((response) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(response));
    } catch (e) {
      // Silent fail
    }
  }, [CACHE_KEY]);

  // Restore cached response on component mount (even if reset was called)
  useEffect(() => {
    console.log('Encyclopedia: useEffect for restore running');
    const cachedResponse = getConversationCachedResponse();
    const cachedQuery = getConversationCachedQuery();
    console.log('Encyclopedia: Restoring on mount, cached response:', !!cachedResponse, 'cached query:', cachedQuery);
    
    // If we have a cached response and no current response, restore it
    if (cachedResponse && !encyclopediaResponse) {
      console.log('Encyclopedia: Restoring cached response on mount');
      setEncyclopediaResponse(cachedResponse);
      setEncyclopediaError(null); // Clear any errors when restoring
    } else {
      console.log('Encyclopedia: No cached response to restore or response already exists');
    }
  }, [getConversationCachedResponse, getConversationCachedQuery]); // Update dependencies

  const handleEncyclopediaQuery = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setEncyclopediaError({ message: 'Please enter a query.' });
      return;
    }

    const trimmedQuery = query.trim();
    console.log('Encyclopedia: Processing query:', trimmedQuery);
    
    // Check if this query matches the cached query
    const cachedQuery = getConversationCachedQuery();
    const cachedResponse = getConversationCachedResponse();
    console.log('Encyclopedia: Cached query:', cachedQuery);
    console.log('Encyclopedia: Current query:', trimmedQuery);
    console.log('Encyclopedia: Has cached response:', !!cachedResponse);
    console.log('Encyclopedia: Queries match?', trimmedQuery === cachedQuery);
    
    if (trimmedQuery === cachedQuery && cachedResponse) {
      console.log('Encyclopedia: Using cached response');
      setEncyclopediaResponse(cachedResponse);
      setEncyclopediaError(null);
      return;
    }

    console.log('Encyclopedia: Making new API call');
    setEncyclopediaLoading(true);
    setEncyclopediaError(null);
    setEncyclopediaResponse(null); // Clear previous response
    // REMOVED: No longer setting main panel display mode from here
    // if (setMainPanelDisplayMode) {
    //     setMainPanelDisplayMode('encyclopedia'); 
    // }

    try {
      const result = await queryEncyclopedia(trimmedQuery);
      setEncyclopediaResponse(result);
      
      // Cache the query and response
      setConversationCachedQuery(trimmedQuery);
      setConversationCachedResponse(result);
      console.log('Encyclopedia: Cached new response for query:', trimmedQuery);
    } catch (err) {
      console.error('useEncyclopedia: Encyclopedia query failed:', err);
      setEncyclopediaError({ message: err.message || 'Failed to get response from Encyclopedia VirtualMD.' });
      setEncyclopediaResponse(null); 
    } finally {
      setEncyclopediaLoading(false);
    }
  }, [getConversationCachedQuery, getConversationCachedResponse, setConversationCachedQuery, setConversationCachedResponse]);

  const handleEncyclopediaReset = useCallback(() => {
    console.log('Encyclopedia: handleEncyclopediaReset called - clearing UI state only');
    setEncyclopediaResponse(null);
    setEncyclopediaError(null);
    setEncyclopediaLoading(false);
    
    // DON'T clear cache on reset - let cache persist for faster responses
    // clearCache();
  }, []);

  return {
    encyclopediaResponse,
    encyclopediaLoading,
    encyclopediaError, 
    setEncyclopediaError, 
    handleEncyclopediaQuery,
    handleEncyclopediaReset,
    clearCacheManually, // For explicit cache clearing when needed
  };
}; 