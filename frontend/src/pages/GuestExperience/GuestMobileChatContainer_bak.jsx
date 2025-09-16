import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { 
  connectGuestWebSocket, 
  sendGuestMessage,
  formatTimeRemaining 
} from '../../services/guestApi';
import GuestMobileChatInterface from './mobile_components/GuestMobileChatInterface';
import { GuestMobileMessageInput } from './mobile_components/GuestMobileMessageInput';
import { constructFullImageUrl } from '../../components/features/chat/sidebar/helpers';

const GuestMobileChatContainer = ({ 
  guestSession,
  onSessionExpired,
  onError,
  personas = []
}) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  
  // WebSocket ref
  const wsRef = useRef(null);
  
  // Available personas with proper formatting
  const formattedPersonas = personas.map(p => {
    // If p is a string (just an ID), convert it to an object
    if (typeof p === 'string') {
      const cleanId = p.replace('ai_persona_', '').replace(/_/g, '-');
      return {
        id: p,
        name: cleanId.replace(/-/g, ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        image: `/persona_images/${cleanId}_tiny.png`,
        image_url: `/persona_images/${cleanId}_tiny.png`
      };
    }
    // Otherwise use the provided object
    return {
      id: p.id || p.persona_id,
      name: p.name,
      image: p.image || p.image_url || `/persona_images/${(p.id || p.persona_id || '').replace('ai_persona_', '').replace(/_/g, '-')}_tiny.png`,
      image_url: p.image_url || p.image || `/persona_images/${(p.id || p.persona_id || '').replace('ai_persona_', '').replace(/_/g, '-')}_tiny.png`
    };
  });

  // Connect WebSocket when session is available
  useEffect(() => {
    if (!guestSession?.conversation_id || !guestSession?.guest_token) return;
    
    const connectWebSocket = () => {
      const ws = connectGuestWebSocket(
        guestSession.conversation_id,
        guestSession.guest_token,
        {
          onMessage: (message) => {
            if (message.type === 'message' || message.type === 'ai_response') {
              // Map backend message format to frontend display format
              const formattedMessage = {
                role: 'assistant',
                content: message.data?.response || message.response,
                persona_id: message.data?.persona_id || message.persona_id,
                conversation_id: message.data?.conversation_id || message.conversation_id,
                timestamp: new Date().toISOString()
              };
              setMessages(prev => [...prev, formattedMessage]);
              setIsThinking(false);
            } else if (message.type === 'thinking') {
              setIsThinking(true);
            } else if (message.type === 'session_info') {
              setSessionStats(message.data);
            } else if (message.type === 'session_limit_reached' || message.type === 'session_expired') {
              setSessionStats(message.data);
              onSessionExpired?.(message.data);
            } else if (message.type === 'error') {
              setError(message.message || message.detail);
              setIsThinking(false);
              onError?.(message.message || message.detail);
            }
          },
          onOpen: () => {
            setIsConnected(true);
            setError(null);
          },
          onError: (error) => {
            console.error('WebSocket error:', error);
            setError('Connection lost. Please refresh the page.');
            setIsConnected(false);
          },
          onClose: () => {
            setIsConnected(false);
          }
        }
      );
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    // Initialize session stats
    if (guestSession) {
      setSessionStats({
        max_messages: guestSession.max_messages || 10,
        messages_used: 0,
        messages_remaining: guestSession.max_messages || 10,
        time_remaining_seconds: 900 // 15 minutes
      });
    }
    
    // Cleanup
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [guestSession, onSessionExpired, onError]);

  // Send message handler
  const handleSendMessage = (content = inputValue) => {
    if (!content.trim() || !wsRef.current || !isConnected) return;
    
    try {
      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Send via WebSocket
      sendGuestMessage(wsRef.current, content.trim());
      setInputValue('');
      
      // Update local session stats optimistically
      if (sessionStats) {
        setSessionStats(prev => ({
          ...prev,
          messages_used: (prev.messages_used || 0) + 1,
          messages_remaining: Math.max(0, (prev.messages_remaining || 0) - 1)
        }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // Handle exit chat
  const handleExitChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    // Let parent component handle navigation
    window.location.href = '/guest';
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Chat interface */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <GuestMobileChatInterface
          conversationId={guestSession?.conversation_id}
          messages={messages}
          isThinking={isThinking}
          guestSession={guestSession}
          sessionStats={sessionStats}
          onExitChat={handleExitChat}
          mobileInputMessage={inputValue}
          setMobileInputMessage={setInputValue}
          onSendMessage={handleSendMessage}
          personas={formattedPersonas}
          error={error}
        />
      </Box>
      
      {/* Fixed input at bottom */}
      {guestSession?.conversation_id && (
        <Paper 
          elevation={3} 
          sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            zIndex: 1000
          }}
        >
          <GuestMobileMessageInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSend={handleSendMessage}
            isConnected={isConnected}
            isThinking={isThinking}
            sessionStats={sessionStats}
            disabled={!isConnected || sessionStats?.messages_remaining === 0}
          />
        </Paper>
      )}
    </Box>
  );
};

export default GuestMobileChatContainer;