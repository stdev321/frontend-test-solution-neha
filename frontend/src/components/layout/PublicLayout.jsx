// frontend/src/components/layout/PublicLayout.jsx
// Layout component for public-facing pages (Landing, Info, Evidence, Features).

import React, { useState, useEffect } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header, { APP_BAR_HEIGHT } from './Header';
import Footer, { FOOTER_DESKTOP_HEIGHT } from './Footer';
import MobileNavigationDrawer from '../../pages/ChatPage/mobile_components/MobileNavigationDrawer';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { ConversationPersistence } from '../../hooks/useConversationPersistence';
import doctorOnComputerImage from '../../assets/images/doctor_on_computer.jpg';

function PublicLayout({ children, showHeader = true, showFooter = true }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser, logout, authToken } = useAuth();
  const themeContext = useThemeContext();
  const mode = themeContext?.mode || 'light';
  const toggleColorMode = themeContext?.toggleColorMode || (() => {});
  const isAuthenticated = !!currentUser;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentConversationId, setCurrentConversationId] = useState(null);
  // Blog configuration removed - now served at blog.virtualmd.app
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };
  
  // Handle navigation from drawer
  const handleNavigateToView = (view) => {
    console.log('🌐 [PUBLIC LAYOUT] handleNavigateToView called with:', view);
    console.log('🌐 [PUBLIC LAYOUT] Current path:', window.location.pathname);
    
    setMobileDrawerOpen(false);
    
    switch(view) {
      case 'dashboard':
        console.log('🌐 [PUBLIC LAYOUT] Dashboard clicked, navigating to /dashboard');
        navigate('/dashboard');
        break;
      case 'chat':
        navigate(currentConversationId ? `/conversation/${currentConversationId}` : '/dashboard');
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

  // Fetch user's current conversation when authenticated
  useEffect(() => {
    // First check our conversation persistence
    const persistedId = ConversationPersistence.get();
    if (persistedId) {
      setCurrentConversationId(persistedId);
    } else {
      // Fallback to old localStorage method
      try {
        const saved = localStorage.getItem('activeConversationId');
        setCurrentConversationId(saved || null);
      } catch {
        setCurrentConversationId(null);
      }
    }
  }, [isAuthenticated, authToken]);

  // Blog configuration removed - now served at blog.virtualmd.app

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center', // Centering might not be desired for full-width layout
        backgroundImage: `url(${doctorOnComputerImage})`,
        backgroundSize: 'cover',
        backgroundPosition: { xs: 'center top', md: 'center center' },
        backgroundRepeat: 'no-repeat',
        // Ensure the background tucks under fixed header/footer on desktop
        ...(isMobile ? {} : { paddingTop: 0, paddingBottom: 0 }),
        color: theme.palette.text.primary, // Reset default text color
      }}
    >
      {/* Conditionally render header, pass isAuthenticated */}
      {showHeader && 
        <Header 
          showLandingButtons={true} 
          isAuthenticated={isAuthenticated} 
          user={currentUser} 
          onLogout={logout}
          chatPageConversationId={currentConversationId}
          mode={mode}
          toggleColorMode={toggleColorMode}
          isMobile={isMobile}
          onMobileDrawerToggle={isMobile ? handleMobileDrawerToggle : null}
        />
      }
      {/* blogEnabled prop removed */}
      
      {/* Mobile Navigation Drawer */}
      {isMobile && (
        <MobileNavigationDrawer
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerToggle}
          onOpen={handleMobileDrawerToggle}
          conversationId={currentConversationId}
          onExitChat={() => {
            // Handle exit if needed
            setCurrentConversationId(null);
          }}
          onNavigateToView={handleNavigateToView}
          isSpeakerEnabled={false}
          onSpeakerToggle={() => {}}
          onCameraClick={() => {}}
          isAuthenticated={isAuthenticated}
          currentUser={currentUser}
          onLogout={logout}
          mode={mode}
          toggleColorMode={toggleColorMode}
          currentMobileView="home"
        />
      )}

      {/* Spacer to offset the fixed header globally on public pages (desktop aligned) */}
      {showHeader && (
        <Box sx={{ height: { xs: 60, sm: 60, md: APP_BAR_HEIGHT }, flexShrink: 0 }} />
      )}

      {/* Main content area */}
      <Box
        id="main-content-area"
        component="main"
        sx={{ 
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent overlay above background
          // Allow natural document scrolling; reserve space so fixed footer doesn't overlap
          ...(isMobile ? {} : {
            paddingBottom: `${FOOTER_DESKTOP_HEIGHT}px`,
          })
        }}
      >
        {children}
      </Box>

      {/* Conditionally render footer - hide on mobile */}
      {showFooter && !isMobile && (
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar - 1, m: 0 }}>
          <Footer />
        </Box>
      )}
    </Box>
  );
}

export default PublicLayout; 