import { useState, useCallback, useEffect, useRef } from 'react';
import { queryEncyclopedia } from '../../services/api';
import ConversationCache from '../../utils/conversationCache';

// Polling interval in milliseconds
const POLL_INTERVAL = 2000; // 2 seconds
const MAX_POLL_ATTEMPTS = 360; // 12 minutes max (to safely exceed the 11 minute API timeout)

export const useEncyclopediaAsync = (conversationId) => {
  const [encyclopediaResponse, setEncyclopediaResponse] = useState(null);
  const [encyclopediaLoading, setEncyclopediaLoading] = useState(false);
  const [encyclopediaError, setEncyclopediaError] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  
  // Use ref to track polling
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  // Function to check job status
  const checkJobStatus = useCallback(async (jobId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/encyclopedia/async/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${await getCurrentUserToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to check job status');
      }
      
      const data = await response.json();
      setJobStatus(data.status);
      
      // Handle different statuses
      if (data.status === 'completed') {
        const encyclopediaData = {
          response: data.response,
          engine_id: data.engine_id,
          processing_time: data.processing_time_seconds
        };
        setEncyclopediaResponse(encyclopediaData);
        setEncyclopediaLoading(false);
        setEncyclopediaError(null);
        
        // Save to cache if we have a conversationId
        if (conversationId) {
          ConversationCache.set(conversationId, 'encyclopedia', encyclopediaData);
        }
        
        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        console.log('Encyclopedia: Query completed in', data.processing_time_seconds, 'seconds');
      } else if (data.status === 'failed') {
        console.error('Encyclopedia: Job failed with error:', data.error);
        
        // Stop polling immediately
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        // Set appropriate error message based on the error type
        let errorMessage = 'Query processing failed. Please try again.';
        
        if (data.error) {
          if (data.error.includes('Connection error') || data.error.includes('Server disconnected')) {
            errorMessage = 'Connection lost while generating response. This usually happens with very long queries. Please try a shorter query.';
          } else if (data.error.includes('overloaded') || data.error.includes('Overloaded')) {
            errorMessage = 'The AI service is temporarily busy. Please wait a moment and try again.';
          } else if (data.error.includes('greenlet_spawn')) {
            errorMessage = 'Technical error occurred while saving the response. Please try again.';
          } else if (data.error === 'Unknown error') {
            errorMessage = 'An unexpected error occurred. Please try again with a shorter query.';
          } else {
            errorMessage = data.error;
          }
        }
        
        setEncyclopediaError({ message: errorMessage });
        setEncyclopediaLoading(false);
        setJobStatus('failed');
      }
      
      return data;
    } catch (err) {
      console.error('Encyclopedia: Error checking job status:', err);
      throw err;
    }
  }, []);

  // Main query function
  const handleEncyclopediaQuery = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setEncyclopediaError({ message: 'Please enter a query.' });
      return;
    }

    const trimmedQuery = query.trim();
    console.log('Encyclopedia: Submitting async query:', trimmedQuery);
    
    setEncyclopediaLoading(true);
    setEncyclopediaError(null);
    setEncyclopediaResponse(null);
    setJobStatus('submitting');
    pollAttemptsRef.current = 0;

    try {
      // Submit query and get job ID
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/encyclopedia/async/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getCurrentUserToken()}`,
        },
        body: JSON.stringify({ user_query: trimmedQuery }),
      });
      
      if (!result.ok) {
        throw new Error('Failed to submit encyclopedia query');
      }
      
      const data = await result.json();
      const jobId = data.job_id;
      
      console.log('Encyclopedia: Job created with ID:', jobId);
      setCurrentJobId(jobId);
      setJobStatus('pending');
      
      // Start polling for results
      pollIntervalRef.current = setInterval(async () => {
        pollAttemptsRef.current += 1;
        
        // Stop polling after max attempts
        if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setEncyclopediaError({ 
            message: 'Query is taking longer than expected (over 12 minutes). This usually means the AI is still processing your request. Please try a shorter query or check back later.' 
          });
          setEncyclopediaLoading(false);
          return;
        }
        
        try {
          await checkJobStatus(jobId);
        } catch (err) {
          // Continue polling even if one check fails
          console.error('Encyclopedia: Poll error:', err);
        }
      }, POLL_INTERVAL);
      
    } catch (err) {
      console.error('Encyclopedia: Query submission failed:', err);
      setEncyclopediaError({ message: err.message || 'Failed to submit query' });
      setEncyclopediaLoading(false);
      setJobStatus(null);
    }
  }, [checkJobStatus]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleEncyclopediaReset = useCallback(() => {
    console.log('Encyclopedia: Resetting async state');
    setEncyclopediaResponse(null);
    setEncyclopediaError(null);
    setEncyclopediaLoading(false);
    setCurrentJobId(null);
    setJobStatus(null);
    
    // Stop any ongoing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  return {
    encyclopediaResponse,
    encyclopediaLoading,
    encyclopediaError,
    jobStatus,
    currentJobId,
    setEncyclopediaError,
    handleEncyclopediaQuery,
    handleEncyclopediaReset,
  };
};

// Helper function to get current user token
async function getCurrentUserToken() {
  const { getCurrentUserToken: getToken } = await import('../../services/auth');
  return getToken();
}