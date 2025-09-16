/**
 * useAuthNavigation - Custom hook to handle race condition-free navigation
 * 
 * This hook solves the navigation race condition where users are navigated
 * to the chat page before their profile data is fully loaded, causing
 * blank or broken UI states.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling authentication-based navigation
 * @param {string} targetPath - Where to navigate after successful authentication
 * @param {object} options - Configuration options
 * @returns {object} Navigation utilities and status
 */
export const useAuthNavigation = (targetPath = '/chat', options = {}) => {
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const navigationAttempts = useRef(0);
  
  const {
    maxRetries = 3,
    requireProfile = true,
    debugMode = process.env.NODE_ENV === 'development'
  } = options;

  /**
   * Reset navigation state - useful for retries or logout
   */
  const resetNavigation = useCallback(() => {
    hasNavigated.current = false;
    navigationAttempts.current = 0;
    if (debugMode) {
      console.log('🔄 Navigation state reset');
    }
  }, [debugMode]);

  /**
   * Attempt navigation with state validation
   * @param {object} authState - Complete authentication state
   */
  const attemptNavigation = useCallback((authState) => {
    const { 
      currentUser, 
      userProfile, 
      authLoading = false, 
      profileLoading = false,
      error = null 
    } = authState;

    // Reset navigation flag on auth errors
    if (error && hasNavigated.current) {
      if (debugMode) {
        console.log('🚫 Auth error detected, resetting navigation:', error);
      }
      resetNavigation();
      return { navigated: false, reason: 'auth-error', error };
    }

    // Skip if already navigated
    if (hasNavigated.current) {
      return { navigated: true, reason: 'already-navigated' };
    }

    // Check if we've exceeded retry attempts
    if (navigationAttempts.current >= maxRetries) {
      console.error(`❌ Navigation failed after ${maxRetries} attempts`);
      return { navigated: false, reason: 'max-retries-exceeded' };
    }

    // Validate all required conditions
    const conditions = {
      userExists: !!currentUser,
      authReady: !authLoading,
      profileReady: !profileLoading,
      profileExists: !requireProfile || !!userProfile
    };

    if (debugMode) {
      console.log('🔍 Navigation conditions:', {
        ...conditions,
        targetPath,
        attempt: navigationAttempts.current + 1
      });
    }

    // Check if all conditions are met
    const allConditionsMet = Object.values(conditions).every(Boolean);

    if (allConditionsMet) {
      navigationAttempts.current++;
      hasNavigated.current = true;
      
      if (debugMode) {
        console.log(`✅ Navigating to ${targetPath} (attempt ${navigationAttempts.current})`);
      }
      
      navigate(targetPath, { replace: true });
      return { navigated: true, reason: 'success', attempt: navigationAttempts.current };
    }

    // Identify which condition failed
    const failedCondition = Object.entries(conditions).find(([_, met]) => !met)?.[0];
    
    if (debugMode) {
      console.log(`⏳ Navigation pending - waiting for: ${failedCondition}`);
    }

    return { 
      navigated: false, 
      reason: 'conditions-not-met', 
      failedCondition,
      conditions 
    };
  }, [navigate, targetPath, maxRetries, requireProfile, debugMode, resetNavigation]);

  /**
   * Effect hook to automatically attempt navigation when auth state changes
   * This should be called with the complete authentication state
   */
  const useNavigationEffect = useCallback((authState) => {
    useEffect(() => {
      attemptNavigation(authState);
    }, [
      authState.currentUser,
      authState.userProfile,
      authState.authLoading,
      authState.profileLoading,
      authState.error,
      attemptNavigation
    ]);
  }, [attemptNavigation]);

  return {
    attemptNavigation,
    resetNavigation,
    useNavigationEffect,
    hasNavigated: hasNavigated.current,
    navigationAttempts: navigationAttempts.current
  };
};

/**
 * Simplified hook for basic auth navigation (most common use case)
 * @param {object} authState - Complete authentication state
 * @param {string} targetPath - Where to navigate after authentication
 */
export const useSimpleAuthNavigation = (authState, targetPath = '/chat') => {
  const { useNavigationEffect } = useAuthNavigation(targetPath);
  
  useNavigationEffect(authState);
};

/**
 * Hook for handling logout navigation
 * @param {string} targetPath - Where to navigate after logout (default: '/login')
 */
export const useLogoutNavigation = (targetPath = '/login') => {
  const navigate = useNavigate();
  
  return useCallback(() => {
    navigate(targetPath, { replace: true });
  }, [navigate, targetPath]);
};