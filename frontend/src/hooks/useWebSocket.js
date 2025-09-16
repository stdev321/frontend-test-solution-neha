// File: frontend/src/hooks/useWebSocket.js

// This file contains the useWebSocket hook for the chatbot.
// It is used to connect to the WebSocket server and send/receive messages.

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getConversation } from '../services/api'; // Import API function
import { gaEvent } from '../utils/analytics'; // Import the GA util
import { mixpanelTrack } from '../utils/mixpanel'; // Import Mixpanel util

// Derive WebSocket URL from the same API base URL
const getWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // Convert http://domain:port to ws://domain:port
  const wsUrl = apiUrl.replace(/^http/, 'ws') + '/api/conversation/ws/';
  return wsUrl;
};

export const useWebSocket = (conversationId, token, onPersonaAdded) => {
  const { i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const ws = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000; // 5 seconds
  const PING_INTERVAL = 30000; // 30 seconds

  // --- Fetch Message History --- 
  const fetchMessageHistory = useCallback(async () => {
    if (!conversationId || !token) return; // Need ID and token
    console.log(`Fetching message history for conversation: ${conversationId}`);
    try {
      // Use getConversation which includes messages
      const convDetails = await getConversation(conversationId);
      if (convDetails && Array.isArray(convDetails.messages)) {
        console.log(`Received ${convDetails.messages.length} historical messages.`);
        // Map API response to the structure expected by the hook's state
        const historicalMessages = convDetails.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          // Backend now ensures all timestamps have timezone info
          timestamp: msg.created_at || new Date().toISOString(),
          persona_id: msg.persona_id,
          file_ids: msg.file_ids // Assuming API provides this
        }));
        setMessages(historicalMessages);
      } else {
        console.warn('No messages found in conversation details or format invalid.');
        setMessages([]); // Clear messages if none found
      }
    } catch (err) {
      console.error('Failed to fetch conversation history:', err);
      setError('Failed to load message history.');
      setMessages([]); // Clear messages on error
    }
  }, [conversationId, token]); // Dependencies for fetching history

  // --- WebSocket Connection Logic --- 
  const connect = useCallback(() => {
    if (!conversationId || !token) {
      console.log('WebSocket connect prerequisites not met.');
      return;
    }
    // Prevent multiple connections
    if (ws.current && (ws.current.readyState === WebSocket.CONNECTING || ws.current.readyState === WebSocket.OPEN)) {
        console.log(`WebSocket already connecting or open (readyState: ${ws.current.readyState}).`);
        return;
    }
    
    // Clear previous messages when initiating a new connection for a (potentially) different ID
    console.log("Clearing messages before connecting...");
    setMessages([]); 
    setIsConnecting(true);
    setError(null);
    setIsThinking(false); // Reset thinking state too

    console.log(`Attempting to connect WebSocket for conversation: ${conversationId}`);
    const socketUrl = `${getWsUrl()}${conversationId}?token=${token}`;
    const currentWsInstance = new WebSocket(socketUrl);
    ws.current = currentWsInstance;

    currentWsInstance.onopen = () => {
      if (ws.current === currentWsInstance) {
        console.log('WebSocket Connected');
        setIsConnected(true);
        setIsConnecting(false);
        // Fetch history *after* successful connection
        fetchMessageHistory(); 
      } else {
         console.log('WebSocket (old instance) opened. Ignoring.');
      }
    };

    currentWsInstance.onclose = (event) => {
       if (ws.current === currentWsInstance) {
         console.log('WebSocket Disconnected', event.reason, `Code: ${event.code}`);
         setIsConnected(false); setIsConnecting(false); setIsThinking(false); ws.current = null; 
         // Maybe trigger reconnect logic here if !event.wasClean
       } else {
           console.log(`WebSocket (old instance, closed by code ${event.code}) closed. Ignoring.`);
       }
    };
    currentWsInstance.onerror = (err) => {
        if (ws.current === currentWsInstance) {
           console.error('WebSocket Error:', err);
           setError('WebSocket connection error.');
           setIsConnected(false); setIsConnecting(false); setIsThinking(false); ws.current = null;
        } else {
            console.log('WebSocket (old instance) errored. Ignoring.');
        }
     };

    currentWsInstance.onmessage = (event) => {
       try {
         const message = JSON.parse(event.data);
         console.log('WebSocket Message Received:', message);
         switch (message.type) {
           // Remove 'conversation_history' case - handled by initial fetch
           case 'ai_response':
             setIsThinking(false);
             // --- Analytics Event Tracking ---
             gaEvent({ action: 'ai_response', category: 'chat', label: message.persona_id });
             mixpanelTrack('AI Response Received', {
                'Persona ID': message.persona_id,
                'Character Count': message.response.length
             });
             setMessages((prevMessages) => [
               ...prevMessages,
               { role: 'assistant', content: message.response, persona_id: message.persona_id, timestamp: message.timestamp || new Date().toISOString() }
             ]);
             break;
           case 'thinking':
             setIsThinking(true);
             break;
           case 'error':
             setIsThinking(false);
             console.error('WebSocket Server Error:', message.detail);
             setError(message.detail || 'Received error from server.');
             break;
           case 'persona_added':
             console.log('[useWebSocket] Persona added notification received');
             console.log('[useWebSocket] onPersonaAdded callback exists:', !!onPersonaAdded);
             if (onPersonaAdded) {
               console.log('[useWebSocket] Calling onPersonaAdded callback');
               onPersonaAdded();
             }
             break;
           case 'pong': /* Handle pong */ break;
           default: console.warn('Received unknown message type:', message.type);
         }
       } catch (e) { console.error('Failed to parse WebSocket message:', e); }
    };

  }, [conversationId, token, fetchMessageHistory, onPersonaAdded]); // Add fetchMessageHistory and onPersonaAdded dependencies

  const disconnect = useCallback(() => {
     if (ws.current) {
       console.log('Disconnecting WebSocket.');
       ws.current.close(1000, 'User action or ID change'); // Specify reason
       ws.current = null;
       setIsConnected(false); setIsConnecting(false); setIsThinking(false);
       setMessages([]); // Clear messages on explicit disconnect too
       setError(null); // Clear any errors when disconnecting
     }
   }, []);

  // Main effect to connect/disconnect based on ID/token
  useEffect(() => {
    if (conversationId && token) {
      // Disconnect previous connection cleanly before starting new one if ID changes
      // Check if ws.current exists and corresponds to a DIFFERENT conversationId implicitly
      // This logic might need refinement if token changes but ID doesn't
      if (ws.current) {
         console.log("Conversation ID or token changed, disconnecting previous socket.");
         disconnect(); 
      }
      // Use a small timeout to ensure the old socket has time to close cleanly 
      // before the new connection attempt in connect()
      const timerId = setTimeout(() => {
         console.log("Attempting connection after potential disconnect...")
         connect();
      }, 50); // Short delay 
      return () => clearTimeout(timerId);

    } else {
       // If no ID or token, ensure disconnected
       disconnect();
       setError(null); // Clear any errors when no conversation
    }
  // IMPORTANT: Only include conversationId and token here.
  // connect/disconnect are stable due to useCallback with empty deps array or deps matching this effect.
  }, [conversationId, token, connect, disconnect]); 

  // Function to send messages
  const sendMessage = useCallback((text, fileIds = []) => {
     // LOG D (New)
     console.log("[useWebSocket] sendMessage called with text:", text, "Files:", fileIds, "isConnected:", isConnected, "ws.current readyState:", ws.current?.readyState);

     if (isConnected && ws.current && ws.current.readyState === WebSocket.OPEN) {
       const messageToSend = {
         type: 'send_message',
         content: text,
         file_ids: fileIds,
         lang: i18n.language,
       };
       console.log('[useWebSocket] Sending message over WS:', messageToSend); // LOG A (Existing, but good to keep)
       ws.current.send(JSON.stringify(messageToSend));
       
       // --- Analytics Event Tracking ---
       gaEvent({ action: 'send_message', category: 'chat', label: 'user' });
       mixpanelTrack('Message Sent', {
          'Source': 'Chat Input',
          'Character Count': text.length
       });

       const optimisticUserMessage = { 
         id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // <<< ADDED: Temporary local unique ID
         role: 'user', 
         content: text, 
         timestamp: new Date().toISOString(), 
         file_ids: fileIds,
         persona_id: null // Explicitly null for user messages if MessageItem expects it
       };
       // LOG B-Prime (New)
       console.log('[useWebSocket] Optimistically updating messages state with:', optimisticUserMessage); 

       setMessages((prevMessages) => {
         const newMessages = [...prevMessages, optimisticUserMessage];
         // LOG B-DoublePrime (New)
         console.log("[useWebSocket] setMessages executed. New messages count:", newMessages.length, "Last message:", newMessages[newMessages.length-1]);
         return newMessages;
       });

     } else {
       console.error( // LOG C (Existing, but good to keep)
           `[useWebSocket] WebSocket is not connected or not ready to send messages. isConnected: ${isConnected}, readyState: ${ws.current?.readyState}`
       );
       setError('Cannot send message: WebSocket not connected.');
     }
   }, [isConnected, setMessages, setError, i18n.language]); // Corrected dependency array

  // Add server restart detection
  const handleWebSocketOpen = () => {
    fetch('/api/server_info')
      .then(res => res.json())
      .then(data => {
        const storedServerId = localStorage.getItem('server_generation_id');
        const newServerId = data.generation_id;
        
        if (storedServerId && storedServerId !== newServerId) {
          // Server has restarted since last connection
          console.log('Server restart detected, resetting state');
          localStorage.setItem('server_generation_id', newServerId);
          
          // Force disconnect and cleanup
          if (ws.current) ws.current.close();
          setMessages([]);
          setIsConnected(false);
          window.location.href = '/chat'; // Redirect to chat landing page
        } else {
          // Store current server ID
          localStorage.setItem('server_generation_id', newServerId);
          setIsConnected(true);
        }
      })
      .catch(err => {
        console.error('Failed to check server status', err);
      });
  };

  return {
    messages, isConnected, isConnecting, isThinking, error, sendMessage, 
    // connect, disconnect // Only expose if needed externally
  };
}; 