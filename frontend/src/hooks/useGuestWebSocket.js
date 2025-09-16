import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { connectGuestWebSocket, sendGuestMessage } from '../services/guestApi';

export const useGuestWebSocket = (guestSession, onPersonaAdded, firstMessage = null) => {
  const { i18n, t } = useTranslation('guest');
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [registrationPromptShown, setRegistrationPromptShown] = useState(false);
  const wsRef = useRef(null);
  const initialMessageAddedRef = useRef(false);

  // Connect to guest WebSocket
  useEffect(() => {
    console.log('[useGuestWebSocket] Guest session:', guestSession);
    if (!guestSession) {
      console.log('No guest session available');
      return;
    }

    // Reset the initial message flag and counters when session changes
    initialMessageAddedRef.current = false;
    setUserMessageCount(0);
    setRegistrationPromptShown(false);
    
    setIsConnecting(true);
    setError(null);

    const handleMessage = (data) => {
      console.log('Guest WebSocket message:', data);
      
      if (data.type === 'message' || data.type === 'ai_response' || !data.type) {
        const messageContent = data.response || data.content;
        
        const newMessage = {
          role: 'assistant',
          content: messageContent,
          timestamp: data.timestamp || new Date().toISOString(),
          persona_id: data.persona_id || 'ai_persona_aileen_carol'
        };
        setMessages(prev => [...prev, newMessage]);
        setIsThinking(false);
      } else if (data.type === 'thinking') {
        setIsThinking(true);
      } else if (data.type === 'error') {
        setError(data.detail || 'WebSocket error');
        setIsThinking(false);
      } else if (data.type === 'session_stats') {
        // Handle session stats if needed
      } else if (data.type === 'persona_added' && onPersonaAdded) {
        onPersonaAdded();
      }
    };

    const handleError = (err) => {
      console.error('Guest WebSocket error:', err);
      setError('Connection error');
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleClose = () => {
      console.log('Guest WebSocket closed');
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleOpen = () => {
      console.log('Guest WebSocket connected');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null); // Clear any previous errors
      // The backend will send the initial message if it exists
    };

    // Connect to guest WebSocket
    // Use conversation_id from the session response
    const conversationId = guestSession.conversation_id;
    const token = guestSession.guest_token;
    
    console.log('[useGuestWebSocket] Connecting with:', { conversationId, token: !!token });
    
    wsRef.current = connectGuestWebSocket(
      conversationId,
      token,
      {
        onMessage: handleMessage,
        onError: handleError,
        onClose: handleClose,
        onOpen: handleOpen
      }
    );

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [guestSession, onPersonaAdded, firstMessage]);

  // Send message function that matches the regular WebSocket interface
  const sendMessage = useCallback((text, fileIds = []) => {
    console.log('[useGuestWebSocket] sendMessage called with:', text);
    
    if (!isConnected || !wsRef.current || !guestSession?.conversation_id) {
      console.error('Cannot send message: not connected or no session');
      setError('Not connected to chat');
      return;
    }

    // Add user message optimistically
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      file_ids: fileIds
    };
    setMessages(prev => [...prev, userMessage]);

    // Increment user message counter
    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    // Check if we should show registration prompt after 3rd user message
    if (newCount === 3 && !registrationPromptShown) {
      setRegistrationPromptShown(true);
      
      // Create fake registration prompt message from Dr. Aileen Carol
      const registrationPrompt = {
        role: 'assistant',
        content: t('registrationPrompt.message'),
        timestamp: new Date().toISOString(),
        persona_id: 'ai_persona_aileen_carol',
        isRegistrationPrompt: true,
        registrationLink: '/register'
      };

      // Add registration prompt message after a short delay to feel natural
      setTimeout(() => {
        setMessages(prev => [...prev, registrationPrompt]);
      }, 1000);
    }

    // Send via WebSocket
    try {
      sendGuestMessage(wsRef.current, text);
      console.log('Guest message sent successfully');
    } catch (err) {
      console.error('Failed to send guest message:', err);
      setError('Failed to send message');
    }
  }, [isConnected, guestSession, userMessageCount, registrationPromptShown]);

  return {
    messages,
    isConnected,
    isConnecting,
    isThinking,
    error,
    sendMessage
  };
};