import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Avatar,
  Tooltip,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MessageIcon from '@mui/icons-material/Message';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';
import { useI18nPersonas } from '../../../hooks/useI18nPersonas';
import { useMemo } from 'react';
import { ThinkingIndicator } from '../../../components/common/ThinkingIndicator';
import { GuestMobileMessageItem } from './GuestMobileMessageItem';
import { formatTimeRemaining } from '../../../services/guestApi';
import { constructFullImageUrl } from '../../../components/features/chat/sidebar/helpers';

export default function GuestMobileChatInterface({
  // Chat state
  conversationId,
  messages = [],
  isThinking,
  
  // Guest session data
  guestSession,
  sessionStats,
  
  // Chat functionality
  onExitChat,
  
  // Mobile input
  mobileInputMessage,
  setMobileInputMessage,
  onSendMessage,
  
  // Available personas
  personas = [],
  
  // Error state
  error
}) {
  const { t } = useTranslation();
  const { personas: localizedPersonas } = useI18nPersonas();
  const localizedNameById = useMemo(() => {
    const map = {};
    for (const p of localizedPersonas || []) {
      if (p && p.id) map[p.id] = p.name;
    }
    return map;
  }, [localizedPersonas]);
  
  // Refs for auto-scroll functionality
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // State for header visibility
  const [headersVisible, setHeadersVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Handle scroll to show/hide headers
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    
    const currentScrollY = messagesContainerRef.current.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY;
    
    // Only trigger if scroll is significant (prevents tiny movements)
    if (Math.abs(scrollDelta) > 5) {
      const isScrollingDown = scrollDelta > 0;
      
      // Show headers when scrolling up or at top, hide when scrolling down
      if (isScrollingDown && currentScrollY > 100) {
        setHeadersVisible(false);
      } else if (!isScrollingDown || currentScrollY < 50) {
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

  // Calculate header heights
  const chatHeaderHeight = 48;
  const sessionInfoHeight = sessionStats ? 56 : 0;
  const personaRowHeight = personas.length > 1 ? 56 : 0;
  const totalHeaderHeight = chatHeaderHeight + sessionInfoHeight + personaRowHeight;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* HEADER STACK */}
      {conversationId && (
        <Box
          sx={{
            position: headersVisible ? 'relative' : 'absolute',
            top: headersVisible ? 0 : -totalHeaderHeight,
            left: 0,
            right: 0,
            transition: 'top 0.3s ease-in-out',
            zIndex: 100,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          {/* Chat header row */}
          <Paper square elevation={0} sx={{ 
            height: chatHeaderHeight, 
            px: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper' 
          }}>
            <Typography variant="h6" noWrap sx={{flexGrow: 1}}>
              Guest Health Consultation
            </Typography>
            
            <IconButton onClick={onExitChat} sx={{ color: '#AD55DA' }}>
              <ExitToAppIcon />
            </IconButton>
          </Paper>

          {/* Session info row */}
          {sessionStats && (
            <Box sx={{ 
              height: sessionInfoHeight,
              px: 2,
              py: 1,
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'background.paper',
              borderBottom: personas.length > 1 ? 1 : 0,
              borderColor: 'divider'
            }}>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  icon={<MessageIcon />}
                  label={`${sessionStats.messages_remaining || 0} messages left`}
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={formatTimeRemaining(sessionStats.time_remaining_seconds || 0)}
                  color={sessionStats.time_remaining_seconds > 30 ? "primary" : "warning"}
                  size="small"
                />
              </Box>
              
              <LinearProgress
                variant="determinate"
                value={(sessionStats.messages_used / sessionStats.max_messages) * 100}
                sx={{ width: 100, height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* AI Persona Circles Row */}
          {personas && personas.length > 1 && (
            <Box sx={{ 
              height: personaRowHeight,
              p: 1, 
              display: 'flex', 
              gap: 1, 
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.paper'
            }}>
              {personas.map((persona) => {
                const displayName = localizedNameById[persona.id] || persona.name;
                return (
                  <Tooltip key={persona.id} title={t('chat:tooltips.speakToAI', { name: displayName, defaultValue: `Speak to AI ${displayName}` })} placement="top">
                    <Avatar
                      src={constructFullImageUrl(persona.image_url || persona.image)}
                      onClick={() => {
                        // Send message to specific AI
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
      
      {/* Messages area */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          display: 'flex', 
          flexDirection: 'column',
          paddingTop: headersVisible ? '8px' : `${totalHeaderHeight + 8}px`,
          paddingBottom: conversationId ? '120px' : '8px', // Space for input
          paddingLeft: 1,
          paddingRight: 1,
          transition: 'padding-top 0.3s ease-in-out'
        }}
      >
        {error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : !conversationId ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="text.secondary">
              Starting your consultation...
            </Typography>
          </Box>
        ) : (
          // Active conversation
          <Box sx={{ flexGrow: 1, pb: 1 }}>
            {messages.length === 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your consultation is starting. An AI medical specialist will respond shortly.
              </Alert>
            )}
            
            {messages.map((message, index) => (
              <GuestMobileMessageItem 
                key={index} 
                message={message} 
                personas={personas}
              />
            ))}
            
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