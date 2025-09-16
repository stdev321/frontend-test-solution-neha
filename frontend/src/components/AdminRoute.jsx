import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';
import { get } from '../services/api';

/**
 * AdminRoute - Protects admin pages
 * Requires:
 * 1. User to be authenticated
 * 2. User to have is_admin = true in database
 * 3. Admin password (handled by AdminPage component)
 */
export default function AdminRoute({ children }) {
  console.log('[AdminRoute] Component rendering');
  const { currentUser, loading: authLoading, userProfile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log('[AdminRoute] Checking admin status for user:', currentUser?.email);
      
      // Wait for auth to fully load and user to be available
      if (authLoading) {
        console.log('[AdminRoute] Still loading auth, waiting...');
        return;
      }
      
      if (!currentUser) {
        console.log('[AdminRoute] No user after auth loaded, setting loading to false');
        setLoading(false);
        return;
      }

      try {
        console.log('[AdminRoute] Calling /api/admin/check-status');
        const response = await get('/api/admin/check-status');
        console.log('[AdminRoute] Admin check response:', response);
        setIsAdmin(response.is_admin);
      } catch (error) {
        console.error('[AdminRoute] Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [currentUser, authLoading]);

  // Show loading while checking auth or admin status
  if (authLoading || loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Not logged in - redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin
  if (!isAdmin) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You do not have permission to access this page.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Only administrators can access the admin panel.
        </Typography>
      </Box>
    );
  }

  // User is authenticated and is admin - render admin page
  // The admin page itself will handle the password check
  return children;
}