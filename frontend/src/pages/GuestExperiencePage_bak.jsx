import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
  Grid
} from '@mui/material';
import {
  Send as SendIcon,
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { 
  startGuestSession, 
  connectGuestWebSocket, 
  sendGuestMessage, 
  formatTimeRemaining 
} from '../services/guestApi';
import { useI18nPersonas } from '../hooks/useI18nPersonas';

const GuestExperiencePage = () => {
  const theme = useTheme();
  const { t } = useTranslation(['common', 'chat']);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { personas: allPersonas, loading: personasLoading } = useI18nPersonas();
  
  // State management
  const [phase, setPhase] = useState('landing'); // 'landing', 'chat', 'expired'
  const [guestSession, setGuestSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStats, setSessionStats] = useState(null);
  const [error, setError] = useState(null);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [currentTopicKey, setCurrentTopicKey] = useState(null);
  
  // WebSocket ref
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Topic configurations - matching desktop functionality
  const getTopics = () => ({
    child: {
      title: t('chat:guest.topics.child.title'),
      personas: ['ai_persona_aileen_carol'],
      firstMessage: t('chat:guest.topics.child.initialMessage')
    },
    sleep: {
      title: t('chat:guest.topics.sleep.title'),
      personas: [
        'ai_persona_aileen_carol',
        'ai_persona_benjamin_stein',
        'ai_persona_alice_chen'
      ],
      firstMessage: t('chat:guest.topics.sleep.initialMessage')
    },
    nutrition: {
      title: t('chat:guest.topics.nutrition.title'),
      personas: [
        'ai_persona_aileen_carol',
        'ai_persona_angelica_fordham',
        'ai_persona_rachel_levy',
        'ai_persona_amina_okufur'
      ],
      firstMessage: t('chat:guest.topics.nutrition.initialMessage')
    }
  });

  const topics = getTopics();
  const healthSuggestions = Object.entries(topics);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start guest session
  const handleStartSession = async (topicKey = null, customConcern = '') => {
    try {
      setError(null);
      
      let personaIds;
      let firstMessage;
      
      if (topicKey && topics[topicKey]) {
        // Use topic-specific configuration
        personaIds = topics[topicKey].personas;
        firstMessage = topics[topicKey].firstMessage;
        setCurrentTopicKey(topicKey);
      } else {
        // Default configuration for custom concerns
        personaIds = ['ai_persona_aileen_carol'];
        firstMessage = customConcern || "Hello! I'm AI Dr. Aileen Carol, your Virtual Health Advisor. How can I help you today?";
        setCurrentTopicKey(null);
      }
      
      const response = await startGuestSession({
        persona_ids: personaIds,
        first_message: firstMessage
      });
      
      setGuestSession(response);
      setPhase('chat');
      
      // Connect to WebSocket
      connectWebSocket(response);
      
      // Send initial message if custom concern provided
      if (customConcern && customConcern.trim()) {
        setTimeout(() => {
          handleSendMessage(customConcern);
        }, 1000);
      }
      
    } catch (err) {
      console.error('Failed to start guest session:', err);
      setError(t('guest.errors.startFailed', 'Unable to start consultation. Please try again.'));
    }
  };

  // Connect WebSocket
  const connectWebSocket = (sessionData) => {
    const ws = connectGuestWebSocket(
      sessionData.conversation_id,
      sessionData.guest_token,
      {
        onMessage: (message) => {
          console.log('Guest WebSocket message:', message);
          if (message.type === 'message' || message.type === 'ai_response') {
            // Map backend message format to frontend display format
            const formattedMessage = {
              role: 'assistant',
              content: message.data?.response || message.response, // Handle both nested and direct response
              persona_id: message.data?.persona_id || message.persona_id,
              conversation_id: message.data?.conversation_id || message.conversation_id,
              timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, formattedMessage]);
          } else if (message.type === 'typing') {
            setIsTyping(message.data.is_typing);
          } else if (message.type === 'session_info') {
            setSessionStats(message.data);
          } else if (message.type === 'session_limit_reached' || message.type === 'session_expired') {
            setPhase('expired');
            setSessionStats(message.data);
            setShowConversionDialog(true);
          } else if (message.type === 'error') {
            setError(message.message);
          }
        },
        onError: (error) => {
          console.error('WebSocket error:', error);
          setError(t('guest.errors.connectionLost', 'Connection lost. Please refresh the page.'));
        },
        onClose: () => {
          console.log('WebSocket connection closed');
        }
      }
    );
    
    wsRef.current = ws;
  };

  // Send message
  const handleSendMessage = (content = inputValue) => {
    if (!content.trim() || !wsRef.current) return;
    
    try {
      // Add user message to UI immediately
      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      sendGuestMessage(wsRef.current, content.trim());
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(t('guest.errors.sendFailed', 'Failed to send message. Please try again.'));
    }
  };

  // Handle input key press
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };


  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Landing Phase - Professional introduction
  if (phase === 'landing') {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h1" gutterBottom color="primary" fontWeight="bold">
            {t('guest.landing.title', 'Experience AI Medical Consultation')}
          </Typography>
          <Typography variant="h6" color="text.secondary" mb={4}>
            {t('guest.landing.subtitle', 'Get instant health insights from our AI medical specialists - completely free, no registration required')}
          </Typography>
          
          {/* AI Team Preview - Show main personas */}
          <Grid container spacing={2} justifyContent="center" mb={4}>
            {!personasLoading && allPersonas.length > 0 && (
              <>
                {/* Always show Aileen Carol */}
                {(() => {
                  const aileenCarol = allPersonas.find(p => p.id === 'ai_persona_aileen_carol');
                  const adamCardwell = allPersonas.find(p => p.id === 'ai_persona_adam_cardwell');
                  
                  return (
                    <>
                      {aileenCarol && (
                        <Grid item>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Avatar 
                                src={aileenCarol.image} 
                                sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}
                              >
                                <PersonIcon />
                              </Avatar>
                              <Typography variant="subtitle2">{aileenCarol.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{aileenCarol.specialty}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                      {adamCardwell && (
                        <Grid item>
                          <Card elevation={2}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                              <Avatar 
                                src={adamCardwell.image}
                                sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'secondary.main' }}
                              >
                                <PersonIcon />
                              </Avatar>
                              <Typography variant="subtitle2">{adamCardwell.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{adamCardwell.specialty}</Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </Grid>
        </Box>

        {/* Quick Start Options */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom textAlign="center">
            {t('guest.landing.whatBringsYou', 'What brings you here today?')}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {t('guest.landing.selectConcern', 'Select a common concern or describe your own')}
          </Typography>
          
          <Grid container spacing={2} mb={4}>
            {healthSuggestions.map(([topicKey, topic], index) => (
              <Grid item xs={12} sm={6} md={4} key={topicKey}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleStartSession(topicKey)}
                  sx={{ 
                    py: 1.5, 
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none'
                  }}
                >
                  {topic.title}
                </Button>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Custom input */}
          <Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('guest.landing.customConcernPlaceholder', 'Or describe your health concern in your own words...')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => handleStartSession(null, inputValue)}
              disabled={!inputValue.trim()}
              startIcon={<SendIcon />}
            >
              {t('guest.landing.startConsultation', 'Start Free Consultation')}
            </Button>
          </Box>
        </Paper>

        {/* Experience Limits */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('guest.landing.experienceIncludes', 'Free Guest Experience Includes:')}
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            <li>{t('guest.landing.includes.messages', '10 messages with AI medical specialists')}</li>
            <li>{t('guest.landing.includes.time', '15 minutes of consultation time')}</li>
            <li>{t('guest.landing.includes.insights', 'Professional health insights and guidance')}</li>
          </Box>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Container>
    );
  }

  // Chat Phase - Real-time consultation
  if (phase === 'chat') {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header with session info */}
        <Paper elevation={1} sx={{ p: 2, borderRadius: 0 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              {currentTopicKey && topics[currentTopicKey] 
                ? topics[currentTopicKey].title 
                : t('chat:guest.consultation', 'Guest Consultation')}
            </Typography>
            
            {sessionStats && (
              <Box display="flex" gap={2} alignItems="center">
                <Chip
                  icon={<MessageIcon />}
                  label={t('guest.chat.messagesLeft', '{{count}} messages left', { count: sessionStats.messages_remaining || 0 })}
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<TimeIcon />}
                  label={t('guest.chat.timeLeft', '{{time}} left', { time: formatTimeRemaining(sessionStats.time_remaining_seconds || 0) })}
                  color={sessionStats.time_remaining_seconds > 30 ? "primary" : "warning"}
                  size="small"
                />
              </Box>
            )}
          </Box>
          
          {sessionStats && (
            <LinearProgress
              variant="determinate"
              value={(sessionStats.messages_used / sessionStats.max_messages) * 100}
              sx={{ mt: 1 }}
            />
          )}
        </Paper>

        {/* Messages area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('guest.chat.startingConsultation', 'Your consultation is starting. An AI medical specialist will respond shortly.')}
            </Alert>
          )}
          
          {messages.map((message, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  ml: message.role === 'user' ? 'auto' : 0,
                  mr: message.role === 'assistant' ? 'auto' : 0,
                  bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                  color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                }}
              >
                {message.role === 'assistant' && message.persona_name && (
                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                    {message.persona_name}
                  </Typography>
                )}
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
              </Paper>
            </Box>
          ))}
          
          {isTyping && (
            <Box sx={{ mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, maxWidth: '80%', bgcolor: 'grey.100' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('guest.chat.aiTyping', 'AI specialist is typing...')}
                </Typography>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <Paper elevation={3} sx={{ p: 2, borderRadius: 0 }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder={t('guest.chat.inputPlaceholder', 'Describe your symptoms or ask a question...')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={phase === 'expired'}
            />
            <IconButton
              color="primary"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || phase === 'expired'}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }

  // Expired Phase - Conversion opportunity
  if (phase === 'expired') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {t('guest.expired.title', 'Consultation Complete')}
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={4}>
              {t('guest.expired.subtitle', "You've experienced the power of AI medical consultation")}
            </Typography>
            
            {sessionStats && (
              <Box mb={4}>
                <Typography variant="body1" gutterBottom>
                  {t('guest.expired.messagesUsed', 'You used {{used}} of {{max}} messages', { used: sessionStats.messages_used, max: sessionStats.max_messages })}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(sessionStats.messages_used / sessionStats.max_messages) * 100}
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
            
            <Typography variant="h6" gutterBottom>
              {t('guest.expired.continuePrompt', 'Want to continue with unlimited access?')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              {t('common:guest.registration.prompt')}
            </Typography>
            
            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => window.location.href = '/register'}
              >
                {t('guest.expired.createAccount', 'Create Free Account')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => window.location.href = '/login'}
              >
                {t('guest.expired.signIn', 'Sign in')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return null;
};

export default GuestExperiencePage;