import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  onAuthChange,
  login as firebaseLogin,
  register as firebaseRegister,
  logout as firebaseLogout,
  getCurrentUserToken,
} from '../services/auth';
import { post, getUserProfile } from '../services/api';
import { setUserId as setGaUserId, gaEvent } from '../utils/analytics';
import { mixpanelIdentify, mixpanelSetPeople, mixpanelReset } from '../utils/mixpanel';
// RACE CONDITION FIXES
import { tokenManager } from '../services/TokenManager';
import { retrySyncOperation, retryProfileOperation, retryAuthOperation } from '../utils/retryUtils';

// -----------------------------------------------------------------------------
// Context setup
// -----------------------------------------------------------------------------
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------
export const AuthProvider = ({ children }) => {
  // Firebase user object
  const [currentUser, setCurrentUser] = useState(null);

  // Profile stored in our backend DB
  const [userProfile, setUserProfile] = useState(null);

  // Initial auth-state check
  const [loading, setLoading] = useState(true);
  
  // Profile loading state (separate from auth loading)
  const [profileLoading, setProfileLoading] = useState(false);

  // JWT (stored in localStorage so page refresh persists) - DEPRECATED - will be removed
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));

  // Human-readable auth error for the UI
  const [authError, setAuthError]   = useState(null);

  // ---------------------------------------------------------------------------
  // 🚫  SERVER-RESTART CHECK DISABLED (this was causing the flashing login loop)
  // ---------------------------------------------------------------------------
  const checkServerRestart = async () => false;

  // ---------------------------------------------------------------------------
  // Listen for Firebase auth state changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    checkServerRestart().then(() => {
      const unsubscribe = onAuthChange(async (user) => {
        console.log('AuthStateChanged:', user ? user.email : 'null');
        setCurrentUser(user);
        setUserProfile(null);

        // --- Analytics User ID Tracking ---
        setGaUserId(user ? user.uid : null);

        if (user) {
          // --- Mixpanel Identification ---
          mixpanelIdentify(user.uid);
          mixpanelSetPeople({
              '$email': user.email, // $email is a special Mixpanel property
              'name': user.displayName,
          });

          // Logged-in flow
          setLoading(true);
          try {
            const token = await getCurrentUserToken();
            if (token) {
              localStorage.setItem('authToken', token);
              setAuthToken(token);

              // Back-end sync (fire-and-forget)
              post('/api/firebase/sync', { firebase_uid: user.uid }).catch((err) =>
                console.error('Backend sync failed:', err)
              );

              // Fetch user profile from our DB
              try {
                const profile = await getUserProfile();
                setUserProfile(profile);
              } catch (profileErr) {
                console.error('Profile fetch failed:', profileErr);
                setUserProfile(null);
              }
            } else {
              localStorage.removeItem('authToken');
              setAuthToken(null);
            }
          } catch (err) {
            console.error('Token / sync / profile error:', err);
            localStorage.removeItem('authToken');
            setAuthToken(null);
          } finally {
            setLoading(false);
          }
        } else {
          // --- Mixpanel Reset on Logout ---
          mixpanelReset();
          // Logged-out flow
          localStorage.removeItem('authToken');
          setAuthToken(null);
          setUserProfile(null);
          setLoading(false);
        }
      });

      return unsubscribe;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Auth helpers
  // ---------------------------------------------------------------------------
  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);
    try {
      const user = await firebaseLogin(email, password);

      // --- GA4 Event Tracking ---
      // Fire a specific "login" event.
      gaEvent({ action: 'login', category: 'engagement' });

      setLoading(false);
      return user;
    } catch (error) {
      // Provide user-friendly error messages based on Firebase error codes
      let errorMessage = 'Failed to login.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, displayName) => {
    setAuthError(null);
    setLoading(true);
    try {
      const user = await firebaseRegister(email, password, displayName);

      // Sync new user with backend
      try {
        const token = await getCurrentUserToken();
        if (token) {
          localStorage.setItem('authToken', token);
          setAuthToken(token);
          await post('/api/firebase/sync', { firebase_uid: user.uid });
        }
      } catch (syncErr) {
        console.error('Backend sync after registration failed:', syncErr);
      }

      setLoading(false);
      return user;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email is already taken.  Please try another or log in.');
      } else {
        setAuthError(error.message || 'Failed to register.');
      }
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await firebaseLogout();
    } catch (error) {
      setAuthError(error.message || 'Failed to logout.');
      throw error;
    }
  };

  // ---------------------------------------------------------------------------
  // Value exposed by the context
  // ---------------------------------------------------------------------------
  const value = {
    currentUser,
    loading,
    authToken,
    authError,
    login,
    register,
    logout,
    clearAuthError: () => setAuthError(null),
    userProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};