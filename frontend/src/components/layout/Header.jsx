// frontend/src/components/layout/Header.jsx
// Reusable Header component for the entire application.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Box, Button, Typography, IconButton, Menu, MenuItem, Avatar, Tooltip, Divider, useMediaQuery, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext'; // Import context hook and modes
// Use tiered logo system for better performance
import logoImage from '../../assets/branding/full_logo_medium.png'; // Desktop header (256x256)
import logoImageSmall from '../../assets/branding/V_transparent_tiny.png'; // Mobile header (96x96)
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Added for dropdown
import MenuIcon from '@mui/icons-material/Menu'; // For mobile hamburger menu
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import AddCommentIcon from '@mui/icons-material/AddComment'; // For Start New Consult
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { FEATURE_FLAGS } from '../../config/featureFlags';
import { getUserDisplayName } from '../../utils/nameTransliteration';
import MobileUserMenu from '../../pages/ChatPage/mobile_components/MobileUserMenu';

// Define explicit bright colors used in the header
const BRAND_COLORS = {
  paleBlue: '#D6EAFF',        // Slightly darker pale blue start
  mediumBlue: '#82B5FF',      // Medium blue for faster transition
  brightBlue: '#5A9AFE',      // Brighter medium blue
  blue: '#4385F4',            // bright blue
  darkBlue: '#356AC3',        // darker blue
  purple: '#6741D9',          // purple
  lightPurple: '#9D69FA'      // light purple
};

export const APP_BAR_HEIGHT = 64; // Keep this constant to avoid breaking imports

// Menu items will be defined inside the component to use translations

const researchMenuItem = { label: 'Research & Publications', path: '/research' };

function Header({
  isAuthenticated, user, onLogout, showLandingButtons = false, 
  mode = 'light', toggleColorMode, 
  chatPageConversationId,
  onChatPageAction,
  isMobile = false,
  guestSessionActive = false,
  onMobileDrawerToggle = null,
  // blogEnabled removed - blog now served at blog.virtualmd.app
}) {
  // Create a local fallback for toggleColorMode if not provided
  const [localMode, setLocalMode] = useState(mode);
  
  const effectiveToggleColorMode = toggleColorMode || (() => {
    setLocalMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      // Update body class for theme
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${newMode}`);
      // Store preference
      try {
        localStorage.setItem('themeMode', newMode);
      } catch {}
      return newMode;
    });
  });
  
  const effectiveMode = toggleColorMode ? mode : localMode;
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.error('useNavigate hook failed:', error);
    navigate = null;
  }
  const location = useLocation();
  const { userProfile, currentUser: authUser } = useAuth();
  const { headerMode } = useHeaderVisibility();
  const { t, i18n } = useTranslation('common');
  
  // Check if RTL language is active
  const isRTLLanguage = ['ar', 'he', 'fa'].includes(i18n.language);

  // Persisted active consult id (fallback when prop not provided)
  let persistedConversationId = null;
  try {
    persistedConversationId = localStorage.getItem('activeConversationId');
  } catch {}
  const routeConversationId = (location.pathname || '').startsWith('/chat/')
    ? (location.pathname.split('/')[2] || null)
    : null;
  const activeConsultId = chatPageConversationId || routeConversationId || persistedConversationId || null;
  
  // Safe navigation function that always works
  const safeNavigate = (path) => {
    console.log('Attempting navigation to:', path, 'RTL:', isRTLLanguage);
    
    // Always use window.location for RTL languages as a workaround
    if (isRTLLanguage) {
      console.log('Using window.location for RTL language navigation');
      window.location.href = path;
      return;
    }
    
    // Try React Router navigation for non-RTL
    if (navigate && typeof navigate === 'function') {
      try {
        navigate(path);
      } catch (error) {
        console.error('Navigate failed, falling back to window.location:', error);
        window.location.href = path;
      }
    } else {
      console.log('Navigate not available, using window.location');
      window.location.href = path;
    }
  };

  // Define menu items using translations
  const aboutUsMenuItems = [
    { label: t('navigation.aboutUsItems.advisory'), path: '/health-advisory' },
    { label: t('navigation.aboutUsItems.dataPrivacy'), path: '/data-privacy-whitepaper' },
  ];

  // Build Learn More menu items based on feature flags
  const learnMoreMenuItems = [
    // About Us items moved here
    { label: t('navigation.aboutUsItems.advisory'), path: '/health-advisory' },
    { label: t('navigation.aboutUsItems.dataPrivacy'), path: '/data-privacy-whitepaper' },
    { label: t('header:legal', 'Legal'), path: '/legal' },
    { label: t('header:blog', 'Blog'), path: 'https://blog.virtualmd.app', external: true },
    // Add Deep Research and Empower Yourself
    { label: t('landing.cards.wellness.title'), path: '/about-VirtualMD-health-encyclopedia' },
    { label: t('navigation.learnMore.empowerYourself', 'Empower Yourself'), path: '/your-health-your-hands' },
    // Conditionally show whitepapers based on feature flags
    ...(FEATURE_FLAGS.showImagingAIWhitepaper ? [{ label: t('navigation.learnMore.imagingAI'), path: '/whitepapers/imaging-ai-assist' }] : []),
    ...(FEATURE_FLAGS.showPathologyAIWhitepaper ? [{ label: t('navigation.learnMore.pathologyAI'), path: '/whitepapers/pathology-ai-assist' }] : []),
    ...(FEATURE_FLAGS.showDermatologyAIWhitepaper ? [{ label: t('navigation.learnMore.dermatologyAI'), path: '/whitepapers/dermatology-ai-assist' }] : []),
    ...(FEATURE_FLAGS.showMentalHealthAIWhitepaper ? [{ label: t('navigation.learnMore.mentalHealthAI'), path: '/for-mental-health' }] : []),
    // Always show AI Accuracy Studies if enabled
    ...(FEATURE_FLAGS.showAIAccuracyWhitepaper ? [{ label: t('navigation.learnMore.accuracyStudies'), path: '/research/ai-accuracy' }] : []),
    // Show Research link only if enabled
    ...(FEATURE_FLAGS.showResearchPage ? [{ label: t('navigation.learnMore.allResearch'), path: '/research' }] : []),
    // Blog removed - now served at blog.virtualmd.app
  ];
  // Mobile: avoid duplicating Advisory (rendered separately above)
  const learnMoreMenuItemsForMobile = learnMoreMenuItems.filter(item => item.path !== '/health-advisory');
  // Split Learn More (ordering only; no section headers)
  const researchMenuItems = learnMoreMenuItemsForMobile.filter(
    (item) => item.path?.startsWith('/whitepapers') || item.path?.startsWith('/research')
  );
  const aboutDocsMenuItems = learnMoreMenuItemsForMobile.filter(
    (item) => !(item.path?.startsWith('/whitepapers') || item.path?.startsWith('/research'))
  );
  const shouldShowResearchGroup = FEATURE_FLAGS.showResearchPage || researchMenuItems.length > 0;
  
  // Add mobile detection
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md')) || isMobile;

  // Ensure desktop header height aligns with exported constant
  const visualHeaderHeight = { xs: 60, sm: 60, md: 60, lg: APP_BAR_HEIGHT, xl: APP_BAR_HEIGHT };

  // State for mobile menu
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMenuAnchorEl);

  // State for AUTO_HIDE mode: tracks if header should be currently visible
  const [isVisible, setIsVisible] = useState(true);
  // Ref to store the last scroll position
  const lastScrollY = useRef(0);
  // Ref to track if currently hovering over header/peek area
  const isHovering = useRef(false);
  // State for the new dropdown menus
  const [aboutUsMenuAnchorEl, setAboutUsMenuAnchorEl] = useState(null);
  const [learnMoreMenuAnchorEl, setLearnMoreMenuAnchorEl] = useState(null);
  const aboutUsMenuOpen = Boolean(aboutUsMenuAnchorEl);
  const learnMoreMenuOpen = Boolean(learnMoreMenuAnchorEl);

  // Check if current language is RTL (right-to-left)
  const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);
  
  // Debug logging

  // Always use the same gradient, we'll flip it with CSS transform for RTL
  const headerBackground = `linear-gradient(to right, ${BRAND_COLORS.paleBlue} 0%, ${BRAND_COLORS.paleBlue} 10%, ${BRAND_COLORS.mediumBlue} 20%, ${BRAND_COLORS.brightBlue} 35%, ${BRAND_COLORS.blue} 50%, ${BRAND_COLORS.darkBlue} 65%, ${BRAND_COLORS.purple} 80%, ${BRAND_COLORS.lightPurple} 100%)`;
  
  // Consistent padding for 2-column mobile menu items
  const mobileMenuItemSx = { fontSize: '0.875rem', py: 1, px: 1.5 };
  

  // Handlers for the new dropdown menus
  const handleAboutUsMenuClick = (event) => setAboutUsMenuAnchorEl(event.currentTarget);
  const handleAboutUsMenuClose = () => setAboutUsMenuAnchorEl(null);
  const handleAboutUsMenuItemClick = (path) => {
    handleAboutUsMenuClose();
    safeNavigate(path);
  };

  const handleLearnMoreMenuClick = (event) => setLearnMoreMenuAnchorEl(event.currentTarget);
  const handleLearnMoreMenuClose = () => setLearnMoreMenuAnchorEl(null);
  const handleLearnMoreMenuItemClick = (path, external = false) => {
    handleLearnMoreMenuClose();
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      safeNavigate(path);
    }
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };

  const handleMobileMenuItemClick = (path, external = false) => {
    handleMobileMenuClose();
    if (external) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      safeNavigate(path);
    }
  };

  // Smart consultation navigation handler
  const handleConsultationClick = () => {
    if (chatPageConversationId) {
      // User has active conversation - navigate to specific conversation
      safeNavigate(`/chat/${chatPageConversationId}`);
    } else {
      // No active conversation - navigate to chat page (will show welcome screen)
      safeNavigate('/chat');
    }
    handleMobileMenuClose();
  };

  // NEW: Handler to navigate to functional encyclopedia
  const handleEncyclopediaClick = () => {
    // Navigate to chat page and set the view to encyclopedia
    safeNavigate('/chat?view=encyclopedia');
    handleMobileMenuClose();
  };

  // Scroll handler for AUTO_HIDE
  const handleScroll = () => {
    if (headerMode !== HEADER_MODES.AUTO_HIDE || isHovering.current) return;
    const currentScrollY = window.scrollY;
    const threshold = 5; 
    const currentAppBarHeight = APP_BAR_HEIGHT; 
    if (currentScrollY > lastScrollY.current && currentScrollY > currentAppBarHeight) {
      if (isVisible) setIsVisible(false);
    } else if (currentScrollY < lastScrollY.current - threshold || currentScrollY <= 10) {
      if (!isVisible) setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  };
  // Effect to add/remove scroll listener
  useEffect(() => {
    if (headerMode === HEADER_MODES.AUTO_HIDE) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      setIsVisible(true); 
      lastScrollY.current = window.scrollY;
    } else {
      setIsVisible(true); 
    }
    return () => { window.removeEventListener('scroll', handleScroll); };
  }, [headerMode]); // Note: Added isVisible to dependency array was likely incorrect, keeping only headerMode

  // Determine final visibility: Hidden mode overrides everything
  const isEffectivelyHidden = headerMode === HEADER_MODES.HIDDEN;
  // Determine transform based on AUTO_HIDE state
  const transformStyle = (headerMode === HEADER_MODES.AUTO_HIDE && !isVisible)
    ? 'translateY(-100%)'
    : 'translateY(0)';
  if (isEffectivelyHidden) {
    return null; // Render nothing if mode is HIDDEN
  }
  // --- Render Logic --- 
  // Use window.location.pathname as fallback if React Router location is not accurate
  const currentPath = location.pathname || window.location.pathname;
  const onChatPage = currentPath.startsWith('/chat') || 
                     currentPath.startsWith('/dashboard') || 
                     currentPath.startsWith('/conversation') ||
                     currentPath.startsWith('/consultations') ||
                     currentPath.startsWith('/team') ||
                     currentPath.startsWith('/encyclopedia') ||
                     currentPath.startsWith('/profile');
  const onGuestPage = currentPath.startsWith('/guest');
  const onGuestChatPage = currentPath.startsWith('/guest-chat');
  
  // Determine current view for mobile menu highlighting
  const getCurrentView = () => {
    if (currentPath === '/') return 'home';
    if (currentPath === '/chat' && !chatPageConversationId) return 'dashboard';
    if (currentPath.startsWith('/chat') && chatPageConversationId) return 'chat';
    if (currentPath === '/health-advisory') return 'advisory';
    if (currentPath.includes('encyclopedia')) return 'encyclopedia';
    if (currentPath.includes('team-builder')) return 'teamBuilder';
    if (currentPath.includes('team')) return 'team';
    if (currentPath.includes('history') || currentPath.includes('consultation')) return 'history';
    if (currentPath.includes('profile')) return 'profile';
    return null;
  };
  // Check if SlidingGuestExperience is active
  const [isGuestChatActive, setIsGuestChatActive] = useState(false);
  
  useEffect(() => {
    const checkGuestChat = () => {
      setIsGuestChatActive(document.body.classList.contains('guest-chat-active'));
    };
    
    // Check initially
    checkGuestChat();
    
    // Set up observer for class changes
    const observer = new MutationObserver(checkGuestChat);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  
  // For testing purposes, let's consider all unauthenticated users as guest users
  const isGuestUser = !isAuthenticated;
  
  // Check if we're on a marketing guest landing page (should not show dark mode toggle)
  const isGuestLandingPage = currentPath.match(/^\/guest(-[a-z]+)*$/) && currentPath !== '/guest-chat';
  
  // Debug dark mode toggle visibility
  // Show dark mode toggle on: chat pages, active guest chat, but NOT on guest landing pages
  const darkModeCondition = (onChatPage || onGuestChatPage || guestSessionActive || isGuestChatActive) && !isGuestLandingPage;
  
  
  let chatActionText = "";
  let chatActionType = null;
  let ChatActionIcon = null;
  let showChatActionButton = false;
  if (onChatPage && !isGuestUser) {
    if (!chatPageConversationId) {
      chatActionText = t('header:start');
      chatActionType = 'START_NEW_FROM_HEADER';
      ChatActionIcon = AddCommentIcon;
      showChatActionButton = true;
    }
  }
  return (
    // Box wrapper with adjusted padding to align with MainLayout
    <Box sx={{ 
      mt: { xs: '5px', md: 0 },
      width: '100%',
    }}>
      <AppBar 
        position="fixed"
        elevation={0}
        sx={{ 
          background: `${headerBackground} !important`,
          backgroundColor: 'transparent !important',
          backgroundImage: `${headerBackground} !important`,
          width: '100%', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transform: transformStyle,
          transition: 'transform 0.3s ease-in-out',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          height: { 
            xs: `${visualHeaderHeight.xs}px`,
            lg: `${visualHeaderHeight.lg}px`,
            xl: `${visualHeaderHeight.xl}px`
          }, // Use responsive height
        }}
        onMouseEnter={() => { if (headerMode === HEADER_MODES.AUTO_HIDE) isHovering.current = true; }}
        onMouseLeave={() => { if (headerMode === HEADER_MODES.AUTO_HIDE) isHovering.current = false; }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%', 
          px: '10px', // 10 points of padding on left and right
          minHeight: { 
            xs: `${visualHeaderHeight.xs}px !important`,
            lg: `${visualHeaderHeight.lg}px !important`,
            xl: `${visualHeaderHeight.xl}px !important`
          }, 
          height: {
            xs: `${visualHeaderHeight.xs}px`,
            lg: `${visualHeaderHeight.lg}px`,
            xl: `${visualHeaderHeight.xl}px`
          },
        }}>
          {/* Left Section */}
          {isMobileScreen ? (
            // Mobile: Left-side controls (Language + Hamburger), no brand image
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
              <IconButton
                color="inherit"
                aria-label={t('common:aria.openMenu')}
                edge="start"
                onClick={onMobileDrawerToggle || handleMobileMenuOpen}
                size="small"
                sx={{ color: '#AD55DA' }}
              >
                <MenuIcon sx={{ fontSize: '1.7rem' }} />
              </IconButton>
              <LanguageSwitcher color="white" size="small" sx={{
                '& svg': { color: '#AD55DA !important', filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.9))' }
              }} />
            </Box>
          ) : (
            // Desktop: Brand link and wordmark
            <RouterLink 
              to="/" 
              style={{ textDecoration: 'none' }}
              onClick={(e) => {
                if (location.pathname === '/') {
                  e.preventDefault();
                  const isGuestExperienceActive = document.body.classList.contains('guest-experience-active');
                  if (isGuestExperienceActive) {
                    window.dispatchEvent(new CustomEvent('close-guest-experience'));
                  } else {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollLeft = 0;
                    document.body.scrollLeft = 0;
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Box 
                  component="img" 
                  src={logoImage}
                  alt={t('common:alt.logo')}
                  sx={{ 
                    height: { xs: 40, md: 45, lg: 50, xl: 55 },
                    width: 'auto',
                    display: 'block',
                    verticalAlign: 'middle',
                    objectFit: 'contain',
                    my: 'auto',
                  }}
                />
              </Box>
            </RouterLink>
          )}
          
          {/* Center Section: User Greeting (when authenticated and not on landing page) */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, px: 2 }}>
            {(isGuestChatActive || onGuestChatPage) ? (
              <Typography variant="h6" color="inherit" sx={{ display: { xs: 'none', md: 'block' }, fontSize: { md: '1.25rem', lg: '1.4rem' }, fontWeight: 'bold', fontStyle: 'italic' }}>
                {t('header.welcomeToVirtualMD', 'Welcome to VirtualMD!')}
              </Typography>
            ) : (
              !showLandingButtons && isAuthenticated && (authUser || userProfile) && (
                <Typography variant="h6" color="inherit" sx={{ fontSize: { md: '1.25rem', lg: '1.4rem' }, fontWeight: 'bold', fontStyle: 'italic' }}>
                  {
                    t('header.greetingHello', { 
                      name: getUserDisplayName(authUser, userProfile, i18n.language)
                    })
                  }
                </Typography>
              )
            )}
          </Box>
          {/* --- Desktop Right Section --- */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: { md: 1, lg: 1.5 }, alignItems: 'center' }}>
            {/* Dynamic Chat Action Button for Chat Page */}
            {showChatActionButton && onChatPageAction && ChatActionIcon && (
              <Tooltip title={chatActionText}>
                <IconButton
                  onClick={() => onChatPageAction(chatActionType)}
                  color="inherit"
                  size="small"
                  sx={{ color: 'white' }}
                  aria-label={chatActionText}
                >
                  <ChatActionIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </Tooltip>
            )}

            {/* Toggle Icons Section - positioned based on language direction */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, order: isRTL ? -1 : 0 }}>
              {/* Language Switcher */}
              <LanguageSwitcher color="white" size="small" />
              
              {/* Dark/Light toggle – appears on chat pages and guest pages with active session */}
              {darkModeCondition && !isMobileScreen && (
                <Tooltip title={t('header:toggleMode')}>
                  <IconButton
                    onClick={effectiveToggleColorMode}
                    size="small"
                    sx={{ color: 'white' }}
                    aria-label={t('header:toggleMode')}
                  >
                    {effectiveMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            {/* Mobile authenticated user menu */}
            {isMobileScreen && isAuthenticated ? (
              <MobileUserMenu
                currentUser={user}
                userProfile={userProfile}
                onLogout={onLogout}
                mode={mode}
                toggleColorMode={toggleColorMode}
                conversationId={chatPageConversationId}
                currentView={getCurrentView()}
                onExitChat={() => {
                  if (onChatPageAction) {
                    onChatPageAction('exit');
                  } else {
                    safeNavigate('/chat');
                  }
                }}
                onNavigateToDashboard={() => safeNavigate('/chat')}
                onNavigateToHome={() => safeNavigate('/')}
                onNavigateToChat={() => {
                  if (onChatPageAction) {
                    onChatPageAction('new');
                  }
                  safeNavigate('/chat');
                }}
                onNavigateToTeam={() => safeNavigate('/chat')}
                onNavigateToHealthAdvisory={() => safeNavigate('/health-advisory')}
                onNavigateToEncyclopedia={() => safeNavigate('/about-VirtualMD-health-encyclopedia')}
                onNavigateToHistory={() => safeNavigate('/chat')}
                onNavigateToProfile={() => safeNavigate('/profile')}
                onNavigateToAITeamBuilder={() => safeNavigate('/chat')}
              />
            ) : /* Advisory button on chat/guest pages; Science dropdown elsewhere */
            (onChatPage || onGuestPage) ? (
              <Button
                onClick={() => safeNavigate('/health-advisory')}
                size="small"
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontSize: { md: '0.9rem', xl: '1.2rem' },
                  py: { md: 0.5, xl: 1 },
                  px: { md: 1.5, xl: 2 },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {t('header:advisory')}
              </Button>
            ) : (
              <>
                {/* Learn More dropdown (includes former About Us items) */}
                <Button
                  id="learn-more-button"
                  aria-controls={learnMoreMenuOpen ? 'learn-more-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={learnMoreMenuOpen ? 'true' : undefined}
                  onClick={handleLearnMoreMenuClick}
                  endIcon={<KeyboardArrowDownIcon sx={{ ml: -0.5 }} />}
                  sx={{ 
                    color: 'white',
                    textTransform: 'none',
                    fontSize: { md: '0.9rem', xl: '1.2rem' },
                    py: { md: 0.5, xl: 1 },
                    px: { md: 1.5, xl: 2 },
                    pr: { md: 1, xl: 1.5 },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  {t('header:learnMore')}
                </Button>
                <Menu
                  id="learn-more-menu"
                  anchorEl={learnMoreMenuAnchorEl}
                  open={learnMoreMenuOpen}
                  onClose={handleLearnMoreMenuClose}
                  MenuListProps={{ 'aria-labelledby': 'learn-more-button' }}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {learnMoreMenuItems.map((item) => (
                    <MenuItem
                      key={item.path}
                      onClick={() => handleLearnMoreMenuItemClick(item.path, item.external)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            {/* Conditional Buttons based on page and auth status */}
            {showLandingButtons ? (
              // --- On Landing Page --- 
              isAuthenticated ? (
                // User is LOGGED IN on Landing Page
                <>
                  {/* Avatar Icon Button (like Sidebar) - Navigates to Chat */}
                  <Tooltip title={t('header:myProfile')}>
                     <IconButton
                       onClick={() => {
                         if (chatPageConversationId) {
                           navigate(`/chat/${chatPageConversationId}`);
                         } else {
                           navigate('/chat');
                         }
                       }}
                       size="small"
                       sx={{
                         p: 0,
                         ml: 1
                       }}
                      >
                         <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1rem' }} src={userProfile?.profile_picture || undefined}>
                            {!userProfile?.profile_picture && (
                                (() => {
                                  let userInitials = '?';
                                  const sourceForInitials = userProfile || authUser;
                                  if (sourceForInitials) {
                                      if (sourceForInitials.full_name) {
                                          const names = sourceForInitials.full_name.trim().split(' ');
                                          userInitials = names[0].charAt(0).toUpperCase();
                                          if (names.length > 1) userInitials += names[names.length - 1].charAt(0).toUpperCase();
                                      } else if (sourceForInitials.display_name) {
                                          userInitials = sourceForInitials.display_name.charAt(0).toUpperCase();
                                      } else if (sourceForInitials.email) {
                                          userInitials = sourceForInitials.email.charAt(0).toUpperCase();
                                      }
                                  }
                                  return userInitials;
                                })()
                            )}
                         </Avatar>
                     </IconButton>
                  </Tooltip>
                  {/* Logout Button with extra spacing */}
                  <Tooltip title={t('header:logoutTitle')}>
                     <Button
                       onClick={onLogout}
                       color="inherit"
                       size="small"
                       sx={{
                         ml: 2, // Increased spacing from Science dropdown
                         textTransform: 'none',
                         color: 'white',
                         fontSize: { md: '0.9rem', xl: '1.2rem' },
                         py: { md: 0.5, xl: 1 },
                         px: { md: 1.5, xl: 2 }
                       }}
                     >
                       {t('header:logout')}
                     </Button>
                  </Tooltip>
                </>
              ) : (
                // User is LOGGED OUT on Landing Page
                <>
                  {/* Login Button - will now be outlined */}
                  <Button 
                    variant="outlined" // Changed from contained
                    size="small"
                    onClick={() => safeNavigate('/login')}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.8)', // Style from old Register button
                      color: 'white',
                      fontSize: { md: '0.9rem', xl: '1.2rem' }, 
                      py: { md: 0.5, xl: 1 },
                      px: { md: 2, xl: 3 },
                      minHeight: { md: '32px', xl: '48px' },
                      minWidth: { md: '80px', xl: '120px' },
                      height: { md: '38px', xl: '54px' },
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    {t('header:login')}
                  </Button>
                  {/* Register Button - will now be contained */}
                  <Button 
                    variant="contained" // Changed from outlined
                    size="small"
                    onClick={() => safeNavigate('/register')}
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.9)', // Style from old Login button
                      color: BRAND_COLORS.blue,
                      fontWeight: 'bold',
                      fontSize: { md: '0.9rem', xl: '1.2rem' },
                      py: { md: 0.5, xl: 1 },
                      px: { md: 2, xl: 3 },
                      minHeight: { md: '32px', xl: '48px' },
                      minWidth: { md: '90px', xl: '130px' },
                      height: { md: '38px', xl: '54px' },
                      '&:hover': { bgcolor: 'white' }
                    }}
                  >
                    {t('header:register')}
                  </Button>
                </>
              )
            ) : isAuthenticated ? (
               // --- Not on Landing Page, IS Authenticated --- 
              <>
                {/* Logout Button with extra spacing from Science */}
                <Tooltip title={t('header:logoutTitle')}>
                                      <Button
                     onClick={() => {
                       console.log('Header: Desktop logout button clicked, onLogout prop:', onLogout);
                       if (onLogout) {
                         console.log('Header: Calling onLogout function...');
                         onLogout();
                       } else {
                         console.log('Header: onLogout prop is undefined/null');
                       }
                     }}
                     color="inherit"
                     size="small"
                     sx={{
                       ml: 2, // Increased spacing from Science dropdown
                       textTransform: 'none',
                       color: 'white',
                       fontSize: { md: '0.9rem', xl: '1.2rem' },
                       py: { md: 0.5, xl: 1 },
                       px: { md: 1.5, xl: 2 }
                     }}
                   >
                     {t('header:logout')}
                   </Button>
                </Tooltip>
              </>
            ) : (
              // --- Not on Landing Page, NOT Authenticated (Guest Users) --- 
              <>
                {/* Signup for full access Button */}
                <Tooltip title={t('header.signupForFullAccess', 'Signup for full access')}>
                  <Button
                    onClick={() => safeNavigate('/register')}
                    color="inherit"
                    size="small"
                    sx={{
                      ml: 2,
                      textTransform: 'none',
                      color: 'white',
                      fontSize: { md: '0.9rem', xl: '1.2rem' },
                      py: { md: 0.5, xl: 1 },
                      px: { md: 1.5, xl: 2 },
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    {t('header:register')}
                  </Button>
                </Tooltip>
              </>
            )}
          </Box>

          {/* --- Mobile Right Section --- */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            {showLandingButtons && (
              isAuthenticated ? (
                <>
                  {/* Avatar navigates to dashboard/chat */}
                  <Tooltip title={t('header:myProfile', 'My Profile')}>
                    <IconButton
                      size="small"
                      onClick={() => safeNavigate('/chat')}
                      sx={{ p: 0.25 }}
                      aria-label={t('header:myProfile', 'My Profile')}
                    >
                      <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: '0.9rem' }} src={userProfile?.profile_picture || undefined}>
                        {(!userProfile?.profile_picture && (authUser?.displayName || authUser?.email)) ? (authUser.displayName?.[0] || authUser.email?.[0] || '?').toUpperCase() : null}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="text"
                    size="small"
                    onClick={onLogout}
                    sx={{ color: 'white', textTransform: 'none', fontSize: '0.85rem', px: 1 }}
                  >
                    {t('header:logout', 'Logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => safeNavigate('/register')}
                    sx={{ color: 'white', textTransform: 'none', fontSize: '0.85rem', px: 1 }}
                  >
                    {t('header:register', 'Register')}
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => safeNavigate('/login')}
                    sx={{ color: 'white', textTransform: 'none', fontSize: '0.85rem', px: 1 }}
                  >
                    {t('header:login', 'Login')}
                  </Button>
                </>
              )
            )}
          </Box>
          
        </Toolbar>
      </AppBar>
      
      
      {/* Removed mobile logout link - now in dropdown menu */}
      
      {/* --- Mobile Menu --- */}
      <Menu
        id="mobile-menu"
        anchorEl={mobileMenuAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        PaperProps={{
          sx: {
            width: { xs: '90vw', sm: '400px' },
            maxWidth: '400px',
            '& .MuiList-root': {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              py: 1,
            }
          }
        }}
      >
        {/* GUEST/NOT AUTHENTICATED (titles removed) */}
        {!isAuthenticated && [
          <MenuItem key="advisory" onClick={() => handleMobileMenuItemClick('/health-advisory')} sx={{ gridColumn: 'span 2' }}>
            {t('header:advisory')}
          </MenuItem>,
          <Divider key="div-guest-1" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Navigation
          <MenuItem key="home-guest" onClick={() => handleMobileMenuItemClick('/')} sx={{ fontSize: '0.875rem', py: 1 }}>
            {t('header:home')}
          </MenuItem>,
          <Divider key="div-guest-2" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Research (feature-flagged)
          ...(researchMenuItems.length ? [
            ...researchMenuItems.map(item => (
              <MenuItem key={item.path} onClick={() => handleMobileMenuItemClick(item.path)} sx={{ fontSize: '0.875rem', py: 1, px: 1.5 }}>
                {item.label}
              </MenuItem>
            )),
            <Divider key="div-guest-3" sx={{ gridColumn: 'span 2', my: 1 }} />
          ] : []),

          // About us
          <MenuItem key="note-founders" onClick={() => handleMobileMenuItemClick('/note-from-founders')} sx={{ fontSize: '0.875rem', py: 1 }}>
            {t('header:noteFromFounders', 'Note from Founders')}
          </MenuItem>,
          ...aboutDocsMenuItems.map(item => (
            <MenuItem key={item.path} onClick={() => handleMobileMenuItemClick(item.path)} sx={{ fontSize: '0.875rem', py: 1, px: 1.5 }}>
              {item.label}
            </MenuItem>
          )),
          <Divider key="div-guest-4" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Site navigation links
          <MenuItem key="contact" onClick={() => handleMobileMenuItemClick('/contact')} sx={{ fontSize: '0.875rem', py: 1 }}>
            {t('header:contactUs')}
          </MenuItem>,
          <MenuItem key="blog" onClick={() => handleMobileMenuItemClick('https://blog.virtualmd.app', true)} sx={{ fontSize: '0.875rem', py: 1 }}>
            {t('header:blog', 'Blog')}
          </MenuItem>,
          <MenuItem key="legal" onClick={() => handleMobileMenuItemClick('/legal')} sx={{ fontSize: '0.875rem', py: 1 }}>
            {t('header:legal', 'Legal')}
          </MenuItem>,
          <Divider key="div-guest-5" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Toggle mode (if applicable)
          ...(darkModeCondition ? [
            <MenuItem key="toggle-mode-guest" onClick={() => { effectiveToggleColorMode(); handleMobileMenuClose(); }} sx={{ gridColumn: 'span 2' }}>
              {t('header:toggleModeText', { mode: effectiveMode === 'dark' ? t('header:light') : t('header:dark') })}
            </MenuItem>,
            <Divider key="div-guest-6" sx={{ gridColumn: 'span 2', my: 1 }} />
          ] : []),

          // Login / Register
          <MenuItem key="login" onClick={() => handleMobileMenuItemClick('/login')} sx={{ gridColumn: 'span 2' }}>
            {t('header:login')}
          </MenuItem>,
          <MenuItem key="register" onClick={() => handleMobileMenuItemClick('/register')} sx={{ gridColumn: 'span 2' }}>
            {t('header:register')}
          </MenuItem>
        ]}
        
        {isAuthenticated && [
          <MenuItem key="advisory" onClick={() => handleMobileMenuItemClick('/health-advisory')} sx={{ gridColumn: 'span 2' }}>
            {t('header:advisory')}
          </MenuItem>,
          // Specific critical functions (dynamic)
          (() => {
            const isChatDashboard = onChatPage && !currentPath.startsWith('/chat/');
            if (activeConsultId) {
              // There is an active consult
              if (!onChatPage || isChatDashboard) {
                // Not on chat page OR on chat dashboard (not the specific consult)
                return ([
                  <MenuItem key="return-consult" onClick={() => handleMobileMenuItemClick(`/chat/${activeConsultId}`)} sx={{ gridColumn: 'span 2' }}>
                    {t('header:returnToConsult', 'Return to Consult')}
                  </MenuItem>,
                  <MenuItem key="end-consult" onClick={() => { 
                    // Pass the activeConsultId with the action
                    if (onChatPageAction) {
                      onChatPageAction('END_CONSULT_FROM_HEADER', activeConsultId);
                    }
                    handleMobileMenuClose(); 
                  }} sx={{ gridColumn: 'span 2' }}>
                    {t('header:endConsult', 'End Consult')}
                  </MenuItem>
                ]);
              }
              // On the specific consult page → only show End Consult
              return (
                <MenuItem key="end-conversation" onClick={() => { 
                  // Already on the consult page, just trigger exit
                  if (onChatPageAction) onChatPageAction('END_CONSULT_FROM_HEADER');
                  handleMobileMenuClose(); 
                }} sx={{ gridColumn: 'span 2' }}>
                  {t('header:endConsult', 'End Consult')}
                </MenuItem>
              );
            }
            // No active consult → Start Consult
            return (
              <MenuItem key="start-conversation" onClick={() => { 
                if (onChatPageAction) {
                  onChatPageAction('START_NEW_FROM_HEADER');
                }
                handleMobileMenuClose(); 
              }} sx={{ gridColumn: 'span 2' }}>
                {t('header:startConsult', 'Start Consult')}
              </MenuItem>
            );
          })(),
          <Divider key="div-auth-1" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Navigation (Dashboard first, Home to the right when not in a conversation)
          // Dashboard
          <MenuItem key="dashboard" onClick={() => handleMobileMenuItemClick('/chat')} sx={mobileMenuItemSx}>
            {t('header:dashboard', 'Dashboard')}
          </MenuItem>,
          // Home - only show when NOT in a conversation; goes to landing page
          ...(!chatPageConversationId ? [
            <MenuItem key="home" onClick={() => handleMobileMenuItemClick('/')} sx={mobileMenuItemSx}>
              {t('header:home')}
            </MenuItem>
          ] : []),
          
          // Health Encyclopedia
          <MenuItem key="encyclopedia" onClick={handleEncyclopediaClick} sx={mobileMenuItemSx}>
            {t('header:healthEncyclopedia')}
          </MenuItem>,
          // (divider before next group will be inserted conditionally below)

          // Research (adds its own divider below)
          ...(FEATURE_FLAGS.showResearchPage || researchMenuItems.length ? [
            ...(FEATURE_FLAGS.showResearchPage ? [
            <MenuItem key="research" onClick={() => handleMobileMenuItemClick('/research')} sx={mobileMenuItemSx}>
                {t('header:researchPublications')}
              </MenuItem>
            ] : []),
            // Exclude AI Accuracy Studies here to avoid duplication (it's listed in About us group)
            ...researchMenuItems
              .filter(item => item.path !== '/research/ai-accuracy')
              .map(item => (
              <MenuItem key={item.path} onClick={() => handleMobileMenuItemClick(item.path)} sx={mobileMenuItemSx}>
                {item.label}
              </MenuItem>
            )),
            <Divider key="div-auth-3" sx={{ gridColumn: 'span 2', my: 1 }} />
          ] : []),

          // About us (if research group is not shown, add a divider before)
          ...(!(FEATURE_FLAGS.showResearchPage || researchMenuItems.length) ? [
            <Divider key="div-auth-2b" sx={{ gridColumn: 'span 2', my: 1 }} />
          ] : []),
          <MenuItem key="note-founders" onClick={() => handleMobileMenuItemClick('/note-from-founders')} sx={mobileMenuItemSx}>
            {t('header:noteFromFounders', 'Note from Founders')}
          </MenuItem>,
          ...(FEATURE_FLAGS.showAIAccuracyWhitepaper ? [
            <MenuItem key="ai-accuracy" onClick={() => handleMobileMenuItemClick('/research/ai-accuracy')} sx={mobileMenuItemSx}>
              {t('navigation.learnMore.accuracyStudies')}
            </MenuItem>
          ] : []),
          ...aboutDocsMenuItems.map((item) => (
            <MenuItem 
              key={item.path}
              onClick={() => handleMobileMenuItemClick(item.path)}
              sx={mobileMenuItemSx}
            >
              {item.label}
            </MenuItem>
          )),
          // Divider only if research group not shown (avoid double lines)
          ...(!shouldShowResearchGroup ? [
            <Divider key="div-auth-4" sx={{ gridColumn: 'span 2', my: 1 }} />
          ] : []),

          // Site navigation links (Contact only; Legal moved above with About Us group)
          <MenuItem key="contact" onClick={() => handleMobileMenuItemClick('/contact')} sx={mobileMenuItemSx}>
            {t('header:contactUs')}
          </MenuItem>,
          <MenuItem key="blog" onClick={() => handleMobileMenuItemClick('https://blog.virtualmd.app', true)} sx={mobileMenuItemSx}>
            {t('header:blog', 'Blog')}
          </MenuItem>,
          <Divider key="div-auth-5" sx={{ gridColumn: 'span 2', my: 1 }} />,

          // Toggle Dark Mode - full width
          ...(darkModeCondition ? [
            <MenuItem key="toggle-mode" onClick={() => { 
              effectiveToggleColorMode(); 
              handleMobileMenuClose(); 
            }} sx={{ gridColumn: 'span 2' }}>
              {t('header:toggleModeText', { mode: effectiveMode === 'dark' ? t('header:light') : t('header:dark') })}
            </MenuItem>
          ] : []),
          
          // Logout at bottom - full width
          <MenuItem key="logout" onClick={() => { 
            onLogout(); 
            handleMobileMenuClose(); 
          }} sx={{ gridColumn: 'span 2', bgcolor: 'action.hover' }}>
            {t('header:logout')}
          </MenuItem>
        ]}
      </Menu>
    </Box>
  );
}

Header.propTypes = {
  isAuthenticated: PropTypes.bool,
  user: PropTypes.object, 
  onLogout: PropTypes.func,
  showLandingButtons: PropTypes.bool,
  mode: PropTypes.string, 
  toggleColorMode: PropTypes.func, 
  chatPageConversationId: PropTypes.string,
  onChatPageAction: PropTypes.func,
  isMobile: PropTypes.bool,
  guestSessionActive: PropTypes.bool,
};

export default Header; 