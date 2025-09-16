import React, { useRef, useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Tooltip,
  Alert
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import { ThinkingIndicator } from '../../../components/common/ThinkingIndicator';
import { MobileMessageItem } from './MobileMessageItem';
import MobileChatWelcomeScreen from './MobileChatWelcomeScreen';
import { getPersonaImageUrl, PERSONA_IMAGE_SIZES } from '../../../utils/personaImageUtils';
import { useI18nPersonas } from '../../../hooks/useI18nPersonas';

const INPUT_BAR_HEIGHT = 88; // Keep in sync with ChatPageMobileUI.jsx

export default function MobileChatInterface({
  // Chat state
  conversationId,
  conversationDetails,
  messages = [],
  isThinking,
  sidebarIsLoading,
  sidebarError,
  
  // User data
  currentUser,
  profileData,
  
  // Chat functionality
  onChatAreaStartTeamChat,
  onExitChat,
  onNavigateToView,
  
  // Mobile input
  mobileInputMessage,
  setMobileInputMessage,
  onSendMessage,
  
  // UI state
  isSpeakerEnabled,
  onDrawerToggle,
  
  // Navigation handlers
  onNavigateToTeam,
  onNavigateToHealthAdvisory,
  onNavigateToConsultations,
  onNavigateToEncyclopedia,
  onNavigateToProfile,
  onLogout,
  isGuestMode
}) {
  const { t } = useTranslation('chat');
  const { personas: localizedPersonas } = useI18nPersonas();
  const localizedNameById = useMemo(() => {
    const map = {};
    for (const p of localizedPersonas || []) {
      if (p && p.id) map[p.id] = p.name;
    }
    return map;
  }, [localizedPersonas]);
  
  // Refs for auto-scroll functionality and scroll detection
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const didMountRef = useRef(false);
  
  // State for header visibility
  const [headersVisible, setHeadersVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollingDown, setScrollingDown] = useState(false);

  // Auto-scroll to bottom when component mounts or conversation changes
  useEffect(() => {
    // Always scroll to bottom when entering the chat view
    if (messagesEndRef.current && conversationId) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [conversationId]); // Trigger when conversation changes

  // Auto-scroll to bottom for new messages, but skip on initial mount
  useEffect(() => {
    if (!messagesEndRef.current) return;
    if (!didMountRef.current) {
      didMountRef.current = true; // keep header visible on first render
      return;
    }
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle scroll to show/hide headers
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const currentScrollY = messagesContainerRef.current.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // Only trigger if scroll is significant (prevents tiny movements)
    if (Math.abs(scrollDelta) > 5) {
      const isScrollingDown = scrollDelta > 0;
      setScrollingDown(isScrollingDown);
      
      // Show headers when scrolling up or at top, hide when scrolling down
      if (isScrollingDown && currentScrollY > 100) {
        // Scrolling down and not near top - hide headers
        setHeadersVisible(false);
      } else if (!isScrollingDown || currentScrollY < 50) {
        // Scrolling up or near top - show headers
        setHeadersVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    }
  }, [lastScrollY]);

  // Add scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Calculate heights for fixed subheader stack
  const chatHeaderHeight = 56; // mobile toolbar height
  const hasMultiplePersonas = !!(conversationDetails?.personas && conversationDetails.personas.length > 1);
  const personaRowHeight = hasMultiplePersonas ? 56 : 0;
  const totalHeaderHeight = chatHeaderHeight + personaRowHeight;
  const SUBHEADER_SPACER = 16; // small buffer so first bubble never tucks under
  const subheaderRef = useRef(null);
  const [subheaderHeight, setSubheaderHeight] = useState(0);

  // Measure the fixed subheader (title + optional persona row) to offset messages precisely
  useLayoutEffect(() => {
    const measure = () => {
      if (subheaderRef.current) {
        const h = subheaderRef.current.offsetHeight || 0;
        setSubheaderHeight(h);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [hasMultiplePersonas, conversationDetails?.title, isSpeakerEnabled]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* FIXED SUBHEADER STACK: title bar and optional persona row, under the 64px app header */}
      {conversationId && (
        <Box
          ref={subheaderRef}
          sx={{
            position: 'fixed',
            top: 'calc(64px + env(safe-area-inset-top))',
            left: 0,
            right: 0,
            zIndex: 1100,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          {/* Chat header row (title + mic + X) */}
          <Paper square elevation={0} sx={{ 
            height: chatHeaderHeight, 
            px: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            borderBottom: hasMultiplePersonas ? 1 : 0,
            borderColor: 'divider',
            bgcolor: 'background.paper' 
          }}>
            <Typography variant="h6" noWrap sx={{flexGrow: 1}}>
              {(() => {
                const title = conversationDetails?.title;
                if (title && title !== 'New Conversation') return title;
                return isGuestMode
                  ? t('guest.consultation', 'Guest Consultation')
                  : t('mobileChat.healthConsult', 'Health Consult');
              })()}
            </Typography>
            {isGuestMode ? (
              <Tooltip title={t('chat:tooltips.audioOnlyRegistered', t('common:guest.registrationRequired'))}>
                <span>
                  <IconButton disabled sx={{ mr: 1 }}>
                    <VolumeUpIcon sx={{ color: 'grey.500' }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              isSpeakerEnabled && (
                <IconButton 
                  onClick={() => {
                    console.log('Toggle Health Expert Carol speaker');
                  }}
                  sx={{ mr: 1, color: 'primary.main' }}
                >
                  <VolumeUpIcon />
                </IconButton>
              )
            )}
            {/* Always show the X in title bar on mobile (guest and logged-in) */}
            <IconButton 
              onClick={onExitChat} 
              sx={{ 
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  color: '#c62828'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: '1.5rem' }} />
            </IconButton>
          </Paper>
          {/* Persona circles row (fixed) if more than one persona */}
          {hasMultiplePersonas && (
            <Box sx={{ 
              height: personaRowHeight,
              p: 1, 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.paper'
            }}>
              {conversationDetails.personas.map((persona) => {
                const displayName = localizedNameById[persona.id] || persona.name;
                return (
                  <Tooltip key={persona.id} title={t('mobileChat.speakToAI', { name: displayName })} placement="top">
                    <Avatar
                      src={getPersonaImageUrl(persona.id, PERSONA_IMAGE_SIZES.TINY)}
                      onClick={() => {
                        const message = t(['chat:mobileChat.requestToSpeakToAI','chat:messages.requestToSpeak'], { name: displayName });
                        setMobileInputMessage(message);
                        onSendMessage(message);
                      }}
                      sx={{
                        width: 40,
                        height: 40,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          borderColor: 'secondary.main'
                        },
                        transition: 'all 0.2s ease-in-out'
                      }}
                    >
                      {displayName?.[0]}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </Box>
      )}
      
      {/* Messages area with proper top padding */}
      <Box
        ref={messagesContainerRef}
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          // Top edge: app header (64px + safe-area) + measured subheader stack + small spacer
          top: conversationId 
            ? `calc(64px + env(safe-area-inset-top) + ${(subheaderHeight || totalHeaderHeight)}px + ${SUBHEADER_SPACER}px)`
            : `calc(64px + env(safe-area-inset-top))`, // No subheader for welcome screen
          // Bottom edge: fixed input + safe-area (during conversation)
          bottom: conversationId
            ? `calc(${INPUT_BAR_HEIGHT}px + env(safe-area-inset-bottom))`
            : `calc(56px + env(safe-area-inset-bottom))`,
          overflow: 'auto',
          overscrollBehaviorY: 'contain',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          boxSizing: 'border-box',
          paddingLeft: 0,   // keep bubbles full-width like before
          paddingRight: 0,  // (use 0 or '8px' if you want a tiny gutter)
          zIndex: 1
        }}
      >
        {(conversationId && sidebarIsLoading && !conversationDetails) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <ThinkingIndicator />
          </Box>
        ) : (conversationId && sidebarError && !conversationDetails) ? (
          <Alert severity="error" sx={{ mb: 2 }}>{sidebarError}</Alert>
        ) : !conversationId ? (
          <MobileChatWelcomeScreen
            currentUser={currentUser}
            userProfile={profileData}
            onChatAreaStartTeamChat={onChatAreaStartTeamChat}
            onNavigateToTeam={onNavigateToTeam}
            onNavigateToHealthAdvisory={onNavigateToHealthAdvisory}
            onNavigateToConsultations={onNavigateToConsultations}
            onNavigateToEncyclopedia={onNavigateToEncyclopedia}
            onNavigateToProfile={onNavigateToProfile}
            onLogout={onLogout}
          />
        ) : (
          // Active conversation with enhanced message rendering
          <Box sx={{ flexGrow: 1, pb: 1, width: '100%' }}>
            {messages && messages.length > 0 ? (
              messages.map((message, index) => (
                <MobileMessageItem 
                  key={index} 
                  message={message} 
                  userProfile={profileData}
                  currentUser={currentUser}
                  personas={conversationDetails?.personas || []}
                />
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  {t('mobileChat.startConversation')}
                </Typography>
              </Box>
            )}
            {isThinking && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <ThinkingIndicator />
              </Box>
            )}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>
    </Box>
  );
} 