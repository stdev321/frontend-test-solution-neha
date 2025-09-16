import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Fade,
  IconButton,
  Tooltip
} from '@mui/material';
import SimpleGuestHeader from '../../components/layout/SimpleGuestHeader';
import { useThemeContext } from '../../contexts/ThemeContext';
import {
  AccessTime as TimeIcon,
  Message as MessageIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  CheckCircle as CheckIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  ArrowForward as ArrowForwardIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon
} from '@mui/icons-material';
import { startGuestSession } from '../../services/guestApi';
import GuestMobileChatContainer from './GuestMobileChatContainer';
import doctorOnComputerImage from '../../assets/images/doctor_on_computer.jpg';
import { useNavigate } from 'react-router-dom';
import { constructFullImageUrl } from '../../components/features/chat/sidebar/helpers';

const GuestExperiencePageWithChat = () => {
  console.log('GuestExperiencePageWithChat component mounted');
  console.log('Current pathname:', window.location.pathname);
  console.log('Current timestamp:', new Date().toISOString());
  
  // Alert to confirm changes are loaded
  useEffect(() => {
    console.log('===== GUEST PAGE LOADED WITH LATEST CHANGES =====');
    console.log('Build timestamp:', '2025-07-21T' + new Date().toTimeString());
  }, []);
  const theme = useTheme();
  const themeContext = useThemeContext();
  console.log('Theme context raw:', themeContext);
  
  // Create a local dark mode state as fallback
  const [localMode, setLocalMode] = useState(() => {
    try {
      return localStorage.getItem('themeMode') || 'light';
    } catch {
      return 'light';
    }
  });
  
  // Use context values if available, otherwise use local state
  const mode = themeContext?.mode || localMode;
  const toggleColorMode = themeContext?.toggleColorMode && typeof themeContext.toggleColorMode === 'function' 
    ? themeContext.toggleColorMode 
    : () => {
        setLocalMode(prev => {
          const newMode = prev === 'light' ? 'dark' : 'light';
          try {
            localStorage.setItem('themeMode', newMode);
          } catch {}
          return newMode;
        });
      };
  
  console.log('Theme values being used:', { 
    mode, 
    toggleColorMode: !!toggleColorMode,
    toggleColorModeType: typeof toggleColorMode,
    contextType: typeof themeContext
  });
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // State management
  const [guestSession, setGuestSession] = useState(null);
  
  // Debug guest session state changes
  useEffect(() => {
    console.log('[GuestPage] Guest session changed:', {
      hasSession: !!guestSession,
      sessionId: guestSession?.session_id,
      timestamp: new Date().toISOString()
    });
  }, [guestSession]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [selectedPersonas, setSelectedPersonas] = useState([
    'ai_persona_aileen_carol',
    'ai_persona_adam_cardwell',
    'ai_persona_alice_chen'
  ]);

  // Available personas for guest
  const availablePersonas = [
    { 
      id: 'ai_persona_aileen_carol', 
      name: 'Dr. Aileen Carol', 
      specialty: 'Family Medicine',
      image: '/persona_images/aileen-carol_medium.png', // Medium for cards
      image_url: '/persona_images/aileen-carol_medium.png'
    },
    { 
      id: 'ai_persona_adam_cardwell', 
      name: 'Dr. Adam Cardwell', 
      specialty: 'Cardiology',
      image: '/persona_images/adam-cardwell_medium.png', // Medium for cards
      image_url: '/persona_images/adam-cardwell_medium.png'
    },
    { 
      id: 'ai_persona_alice_chen', 
      name: 'Dr. Alice Chen', 
      specialty: 'Neurology',
      image: '/persona_images/alice-chen_medium.png', // Medium for cards
      image_url: '/persona_images/alice-chen_medium.png'
    }
  ];

  // Health concern suggestions
  const healthSuggestions = [
    "I've been having persistent headaches",
    "I'm experiencing chest pain",
    "I have unusual fatigue lately",
    "I'm concerned about a skin rash",
    "I've been having digestive issues",
    "I'm worried about my blood pressure"
  ];

  // Generate topic-specific first messages
  const getTopicFirstMessage = (topic) => {
    const topicMessages = {
      "I've been having persistent headaches": "Hello! I'm Dr. Carol. I understand you're experiencing persistent headaches. Let me help you explore this concern. Can you tell me more about when these headaches started and how often they occur?",
      "I'm experiencing chest pain": "Hello! I'm Dr. Carol. I see you're concerned about chest pain. This is something we should discuss carefully. Can you describe the type of pain you're experiencing and when it happens?",
      "I have unusual fatigue lately": "Hello! I'm Dr. Carol. I understand you've been feeling unusually tired lately. Fatigue can have many causes. Can you tell me how long you've been experiencing this and if there are any other symptoms?",
      "I'm concerned about a skin rash": "Hello! I'm Dr. Carol. I see you have concerns about a skin rash. Let me help you with this. Can you describe where the rash is located and how long you've had it?",
      "I've been having digestive issues": "Hello! I'm Dr. Carol. I understand you're experiencing digestive problems. These can be quite uncomfortable. Can you describe what specific symptoms you're having?",
      "I'm worried about my blood pressure": "Hello! I'm Dr. Carol. I see you're concerned about your blood pressure. This is an important health topic. Do you have any recent blood pressure readings, or are you experiencing symptoms that worry you?"
    };
    
    return topicMessages[topic] || "Hello! I'm Dr. Carol, your AI health assistant. How can I help you today?";
  };

  // Start guest session
  const handleStartSession = async (topic = null) => {
    console.log('[handleStartSession] Called with topic:', topic);
    alert('Starting guest session... (DEBUG: Confirming code is updated)');
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await startGuestSession({ 
        persona_ids: selectedPersonas,
        first_message: topic ? getTopicFirstMessage(topic) : "Hello! I'm Dr. Carol, your AI health assistant. How can I help you today?"
      });
      setGuestSession(response);
      console.log('[GuestPage] Session started successfully:', response);
      
      // Force a re-render by updating a dummy state
      window.dispatchEvent(new Event('guestSessionStarted'));
      
    } catch (err) {
      console.error('Failed to start guest session:', err);
      setError('Unable to start consultation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle session expiry
  const handleSessionExpired = (sessionData) => {
    setShowConversionDialog(true);
  };

  // Removed auto-start - wait for user to click a topic

  // Render mobile view (full screen chat)
  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {guestSession ? (
          <GuestMobileChatContainer
            guestSession={guestSession}
            onSessionExpired={handleSessionExpired}
            onError={setError}
            personas={availablePersonas}
          />
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            p: 2 
          }}>
            {error ? (
              <Alert severity="error" action={
                <Button onClick={() => handleStartSession()}>Retry</Button>
              }>
                {error}
              </Alert>
            ) : (
              <Box textAlign="center">
                <Typography variant="h6" gutterBottom>
                  Welcome to Virtual MD
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Try our AI medical consultation for free
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => handleStartSession()}
                  size="large"
                  startIcon={<HospitalIcon />}
                  disabled={isLoading}
                >
                  {isLoading ? 'Starting...' : 'Start Consultation'}
                </Button>
              </Box>
            )}
          </Box>
        )}
        
        {/* Conversion Dialog */}
        <Dialog open={showConversionDialog} onClose={() => setShowConversionDialog(false)}>
          <DialogTitle>Session Complete</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              You've experienced our AI medical consultation. Create a free account for unlimited access!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConversionDialog(false)}>Close</Button>
            <Button variant="contained" onClick={() => window.location.href = '/register'}>
              Create Account
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Desktop/Tablet view with split layout
  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundImage: `url(${doctorOnComputerImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Simple Guest Header - dark mode toggle appears when chat session starts */}
      {/* DEBUG: Adding timestamp to force re-render visibility */}
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        bgcolor: 'red', 
        color: 'white', 
        p: 1, 
        zIndex: 9999,
        fontSize: '12px'
      }}>
        DEBUG: Session={!!guestSession ? 'YES' : 'NO'} | {new Date().toLocaleTimeString()}
      </Box>
      <SimpleGuestHeader 
        mode={mode}
        toggleColorMode={toggleColorMode}
        showDarkModeToggle={!!guestSession}
        isMobile={isMobile}
      />
      <Container maxWidth="xl" sx={{ height: 'calc(100vh - 70px)', py: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%', mt: 0 }}>
          {/* Left side - Information (2/3 width) */}
          <Grid item xs={12} md={8} lg={8}>
            <Box sx={{ 
              height: '100%', 
              overflowY: 'auto', 
              pr: 2,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                '&:hover': {
                  background: 'rgba(255,255,255,0.5)',
                }
              }
            }}>
            {/* Hero Section */}
            <Fade in={true} timeout={800}>
              <Box mb={4} sx={{ 
                bgcolor: 'rgba(255,255,255,0.95)', 
                p: 3, 
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{
                  background: 'linear-gradient(45deg, #2196f3 30%, #3f51b5 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  AI Medical Consultation
                </Typography>
                <Typography variant="h6" color="text.secondary" mb={3}>
                  Chat with our AI medical specialists - Free trial, no registration required
                </Typography>
              
                {/* Benefits */}
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: 'rgba(33,150,243,0.1)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid rgba(33,150,243,0.2)'
                    }}>
                    <TimeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Instant Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No waiting rooms
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: 'rgba(63,81,181,0.1)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(63,81,181,0.2)'
                  }}>
                    <HospitalIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      AI Specialists
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Multiple disciplines
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: 'rgba(76,175,80,0.1)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(76,175,80,0.2)'
                  }}>
                    <CheckIcon sx={{ fontSize: 40, mb: 1, color: '#4caf50' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Free Trial
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      10 messages included
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              </Box>
            </Fade>

            {/* AI Team Preview */}
            <Fade in={true} timeout={1000}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: 3
              }}>
                <Typography variant="h5" gutterBottom sx={{
                  background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold',
                  mb: 3
                }}>
                  Meet Your AI Medical Team
                </Typography>
                <Grid container spacing={2}>
                  {availablePersonas.map((persona) => {
                    const cleanId = persona.id.replace('ai_persona_', '');
                    const imageUrl = constructFullImageUrl(`/persona_images/${cleanId}_medium.png`); // Default to medium
                    return (
                      <Grid item xs={12} sm={6} md={4} key={persona.id}>
                        <Card elevation={0} sx={{ 
                          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                          border: '1px solid rgba(0,0,0,0.08)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                          }
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Avatar 
                              sx={{ 
                                width: 80, 
                                height: 80, 
                                mx: 'auto', 
                                mb: 2,
                                border: '3px solid',
                                borderColor: 'primary.light',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                              }}
                              src={imageUrl}
                            >
                              <PersonIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {persona.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {persona.specialty}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Fade>

            {/* Quick Start Suggestions */}
            <Fade in={true} timeout={1200}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                mb: 3,
                bgcolor: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 3
              }}>
                <Typography variant="h5" gutterBottom sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: 1
                }}>
                  Common Health Concerns
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Click any topic to start chatting about it
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {healthSuggestions.map((suggestion, index) => (
                    <Chip
                      key={index}
                      label={suggestion}
                      onClick={() => {
                        // Start session with topic-specific first message
                        if (!guestSession) {
                          handleStartSession(suggestion);
                        }
                      }}
                      sx={{ 
                        cursor: 'pointer',
                        background: 'linear-gradient(145deg, #e3f2fd 0%, #bbdefb 100%)',
                        border: '1px solid rgba(33,150,243,0.2)',
                        '&:hover': {
                          background: 'linear-gradient(145deg, #bbdefb 0%, #90caf9 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 8px rgba(33,150,243,0.2)'
                        },
                        transition: 'all 0.2s ease',
                        fontWeight: 500
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Fade>

            {/* Session Limits Info */}
            <Fade in={true} timeout={1400}>
              <Alert severity="info" sx={{ 
                mb: 2,
                bgcolor: 'rgba(33,150,243,0.08)',
                border: '1px solid rgba(33,150,243,0.3)',
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  color: 'primary.main'
                }
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Free Guest Experience Includes:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  <li>10 messages with AI medical specialists</li>
                  <li>15 minutes of consultation time</li>
                  <li>Access to cardiology and neurology specialists</li>
                  <li>Professional health insights and guidance</li>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<LoginIcon />}
                  sx={{ 
                    mt: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      bgcolor: 'primary.main',
                      color: 'white'
                    }
                  }}
                  onClick={() => window.location.href = '/register'}
                >
                  Create Free Account for Unlimited Access
                </Button>
              </Alert>
            </Fade>
          </Box>
        </Grid>

        {/* Right side - Chat (1/3 width) */}
        <Grid item xs={12} md={4} lg={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Dark mode toggle in top right corner of chat */}
            {guestSession && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <Tooltip title="Toggle dark/light mode">
                  <IconButton
                    onClick={toggleColorMode}
                    size="small"
                    sx={{ 
                      bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                    }}
                  >
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {guestSession ? (
              <GuestMobileChatContainer
                guestSession={guestSession}
                onSessionExpired={handleSessionExpired}
                onError={setError}
                personas={availablePersonas}
              />
            ) : (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 3 
              }}>
                {error ? (
                  <Alert severity="error" action={
                    <Button onClick={() => handleStartSession()}>Retry</Button>
                  }>
                    {error}
                  </Alert>
                ) : (
                  <Box textAlign="center">
                    <Typography color="text.secondary" gutterBottom>
                      {isLoading ? 'Starting your consultation...' : 'Click to start chatting'}
                    </Typography>
                    {!isLoading && (
                      <Button 
                        variant="contained" 
                        onClick={handleStartSession}
                        size="large"
                        sx={{ mt: 2 }}
                      >
                        Start Chat
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Conversion Dialog */}
      <Dialog 
        open={showConversionDialog} 
        onClose={() => setShowConversionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Your Free Trial Has Ended</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Thank you for trying our AI medical consultation service!
          </Typography>
          <Typography paragraph>
            Create a free account to continue with:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>Unlimited messages with AI doctors</li>
            <li>Access to all medical specialties</li>
            <li>Save and review conversation history</li>
            <li>Personalized health insights</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConversionDialog(false)}>
            Not Now
          </Button>
          <Button 
            variant="contained" 
            startIcon={<LoginIcon />}
            onClick={() => window.location.href = '/register'}
          >
            Create Free Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default GuestExperiencePageWithChat;