// File: src/components/layout/MainLayout.jsx

import React, { useEffect, useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header, { APP_BAR_HEIGHT } from './Header';
import Footer from './Footer';                          // ← your footer component
import MobileNavigationDrawer from '../../pages/ChatPage/mobile_components/MobileNavigationDrawer';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ConversationPersistence } from '../../hooks/useConversationPersistence';

import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';

/**
 * MainLayout Component
 * 
 * This component serves as the primary layout wrapper for the application.
 * It provides a consistent structure with:
 * - A fixed AppBar/header at the top (conditionally rendered)
 * - Space for a sidebar/drawer (to be implemented)
 * - A main content area where page-specific content is rendered
 * - A footer at the bottom (conditionally rendered)
 * 
 * The layout maintains proper spacing and z-index management to ensure
 * components don't overlap incorrectly. It's designed to be responsive
 * and will be the container for all main application pages.
 */

// Now accepts showHeader/showFooter flags
function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
}) {
  const { logout, currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { headerMode, setHeaderMode } = useHeaderVisibility();
  const themeContext = useThemeContext();
  const mode = themeContext?.mode || 'light';
  const toggleColorMode = themeContext?.toggleColorMode || (() => {});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Get saved conversation for persistence
  const savedConversationId = ConversationPersistence.get();
  
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  
  // Handle navigation from drawer
  const handleNavigateToView = (view) => {
    console.log('🏛️ [MAIN LAYOUT] handleNavigateToView called with:', view);
    console.log('🏛️ [MAIN LAYOUT] Current path:', window.location.pathname);
    
    setMobileDrawerOpen(false);
    
    switch(view) {
      case 'dashboard':
        console.log('🏛️ [MAIN LAYOUT] Dashboard clicked, navigating to /dashboard');
        navigate('/dashboard');
        break;
      case 'chat':
        const savedConversationId = ConversationPersistence.get();
        navigate(savedConversationId ? `/conversation/${savedConversationId}` : '/dashboard');
        break;
      case 'consultations':
        navigate('/consultations');
        break;
      case 'team':
        navigate('/team');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'encyclopedia':
        navigate('/encyclopedia');
        break;
      default:
        console.log('Unknown view:', view);
    }
  };

  // Drive headerMode based on showHeader
  useEffect(() => {
    setHeaderMode(showHeader ? HEADER_MODES.AUTO_HIDE : HEADER_MODES.HIDDEN);
  }, [setHeaderMode, showHeader]);

  const handleLogout = async () => {
    try {
      console.log('Logout attempt starting...');
      await logout();
      console.log('Logout successful');
      // Navigate to home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // You could add a toast notification here for user feedback
      alert(`Logout failed: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      {/* Conditionally render header */}
      {showHeader && (
        <Header
          isAuthenticated={!!currentUser}
          user={currentUser}
          onLogout={handleLogout}
          mode={mode}
          toggleColorMode={toggleColorMode}
          isMobile={isMobile}
          onMobileDrawerToggle={isMobile ? handleMobileDrawerToggle : null}
        />
      )}
      
      {/* Mobile Navigation Drawer */}
      {isMobile && (
        <MobileNavigationDrawer
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerToggle}
          onOpen={handleMobileDrawerToggle}
          conversationId={savedConversationId}
          onExitChat={() => {}}
          onNavigateToView={handleNavigateToView}
          isSpeakerEnabled={false}
          onSpeakerToggle={() => {}}
          onCameraClick={() => {}}
          isAuthenticated={!!currentUser}
          currentUser={currentUser}
          userProfile={userProfile}
          onLogout={handleLogout}
          mode={mode}
          toggleColorMode={toggleColorMode}
          currentMobileView="home"
        />
      )}

      {/* Main content: push down by APP_BAR_HEIGHT if header is shown */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          boxSizing: 'border-box',
          display: 'flex',
          overflow: { xs: 'auto', md: 'hidden' }, // Allow scrolling on mobile
          width: '100%',
          bgcolor: 'grey.200',
          border: '5px solid',
          borderColor: 'primary.light'
        }}
      >
        {children}
      </Box>

      {/* Conditionally render footer */}
      {showFooter && <Footer />}
    </Box>
  );
}

export default MainLayout;
