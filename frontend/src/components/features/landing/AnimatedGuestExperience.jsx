import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Grid,
  Chip,
  useTheme,
  Fade,
  Zoom,
  Collapse,
  alpha,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ChildCare as ChildCareIcon,
  NightsStay as SleepIcon,
  Favorite as HeartIcon,
  MedicalInformation as MedicalInformationIcon,
  Security as SecurityIcon,
  Psychology as PsychologyIcon,
  LocalHospital as LocalHospitalIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { startGuestSession } from '../../../services/guestApi';
// GuestChatReplica removed - using unified ChatPage instead
import { useTranslation } from 'react-i18next';
import { getLandingPageConfig } from '../../../configs/landingPages';
import { motion, AnimatePresence } from 'framer-motion';
// Use medium size for guest experience display
import VLogo from '../../../assets/branding/V_transparent_medium.png';
import { useHeaderVisibility, HEADER_MODES } from '../../../contexts/HeaderVisibilityContext';
import { useThemeContext } from '../../../contexts/ThemeContext';
import doctorOnComputerImage from '../../../assets/images/doctor_on_computer.jpg';
import sickChildIcon from '../../../assets/icons/sick_child_icon.png';
import sleepingIcon from '../../../assets/icons/sleeping_icon.png';
import nutritionIcon from '../../../assets/icons/nutrition_icon.png';
import Footer from '../../layout/Footer';
import InfoGrid from '../../common/InfoGrid';

const AnimatedGuestExperience = ({ onClose, initialCards, configId }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['common', 'chat', 'landingPages']);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Load the persona namespace dynamically based on current language
  useEffect(() => {
    i18n.loadNamespaces([`ai_personas_${i18n.language}`]);
  }, [i18n.language]);
  const { mode, toggleColorMode } = useThemeContext();
  const [currentState, setCurrentState] = useState('landing'); // 'landing', 'specialists', 'chat'
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [guestSession, setGuestSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exitingState, setExitingState] = useState(null);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  // Add guest-chat-active class to body ONLY when in chat state
  useEffect(() => {
    if (currentState === 'chat') {
      document.body.classList.add('guest-chat-active');
    } else {
      document.body.classList.remove('guest-chat-active');
    }
    return () => {
      document.body.classList.remove('guest-chat-active');
    };
  }, [currentState]);

  // Get configuration - fail fast if not found
  const config = getLandingPageConfig(configId);
  if (!config) {
    throw new Error(`Landing page configuration not found for configId: ${configId}`);
  }

  // Get topics from configuration
  const topics = config.topics;

  // Original nav card data from landing page
  const landingCards = [
    { 
      id: 'why-use-VirtualMD',
      title: t('landing.cards.whyUse.title'),
      description: t('landing.cards.whyUse.description'),
      icon: <MedicalInformationIcon sx={{ fontSize: 36 }} />,
      color: '#3F51B5'
    },
    { 
      id: 'try-it-out',
      title: t('landing.tryItOut'),
      icon: <MedicalInformationIcon sx={{ fontSize: 36 }} />,
      description: t('landing.cards.tryItOut.description', 'Experience 30 minutes of free consultation with our Virtual Health Care Specialists'),
      color: '#1976d2'
    },
    { 
      id: 'data-privacy',
      title: t('landing.cards.dataPrivacy.title'),
      icon: <SecurityIcon sx={{ fontSize: 36 }} />,
      description: t('landing.cards.dataPrivacy.description'),
      color: '#1976d2'
    }
  ];

  // Load persona information
  const getPersonaInfo = (personaId) => {
    const persona = t(`ai_personas_${i18n.language}:personas.persona_${personaId}`, { returnObjects: true });
    return {
      ...persona,
      id: personaId,
      color: {
        'ai_persona_aileen_carol': '#2196F3',
        'ai_persona_jessica_lee': '#4CAF50',
        'ai_persona_daniel_clark': '#9C27B0',
        'ai_persona_benjamin_stein': '#673AB7',
        'ai_persona_alice_chen': '#00BCD4',
        'ai_persona_angelica_fordham': '#FF5722',
        'ai_persona_esther_weissman': '#795548'
      }[personaId] || '#2196F3',
      title: persona.specialty
    };
  };

  const handleTransition = async (from, to, data = {}) => {
    setExitingState(from);
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (to === 'specialists') {
      // Skip specialists page and go directly to chat
      setSelectedTopic(data.topic);
      // Instead of showing specialists, start chat session immediately
      try {
        setIsLoading(true);
        const topicData = topics[data.topic];
        // Translate the first message using the landingPages namespace
        const translatedFirstMessage = t(topicData.firstMessage, { ns: 'landingPages' });
        const response = await startGuestSession({
          persona_ids: topicData.personas,
          first_message: translatedFirstMessage
        });
        
        if (response.success) {
          navigate('/guest-chat', { 
            state: { 
              isGuest: true, 
              guestSession: response,
              personas: topicData.personas,
              firstMessage: translatedFirstMessage,
              selectedTopic: data.topic
            } 
          });
        }
      } catch (err) {
        setError(err.message || t('chat:guest.errors.sessionFailed'));
      } finally {
        setIsLoading(false);
      }
      return;
    } else if (to === 'chat') {
      // Start chat session
      try {
        setIsLoading(true);
        const topicData = topics[selectedTopic];
        // Translate the first message using the landingPages namespace
        const translatedFirstMessage = t(topicData.firstMessage, { ns: 'landingPages' });
        console.log('[AnimatedGuestExperience] Starting guest session with:', {
          persona_ids: topicData.personas,
          first_message: translatedFirstMessage
        });
        const response = await startGuestSession({
          persona_ids: topicData.personas,
          first_message: translatedFirstMessage
        });
        
        // Navigate to unified ChatPage with guest session
        navigate('/guest-chat', { 
          state: { 
            isGuest: true, 
            guestSession: response,
            personas: topicData.personas,
            firstMessage: translatedFirstMessage,
            selectedTopic: selectedTopic
          } 
        });
      } catch (err) {
        console.error('Failed to start guest session:', err);
        setError('Unable to start consultation. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else if (to === 'landing') {
      setSelectedTopic(null);
      setGuestSession(null);
      setCurrentState('landing');
    }
    
    setExitingState(null);
  };

  const handleBack = () => {
    if (currentState === 'chat') {
      // Exit from chat back to specialists
      handleTransition('chat', 'specialists');
    }
  };

  // Animation variants - slide effects from right
  const cardVariants = {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Render landing cards (guest-specific): desktop matches landing page card sizing/position
  const renderLandingCards = () => (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100vh',
      py: { xs: 0.5, sm: 4 },
      pt: { xs: '108px', sm: '120px' } // bring cards slightly down on mobile
    }}>
      <Container maxWidth={isDesktop ? 'lg' : 'md'}>
        {isDesktop && (
          <Box sx={{ textAlign: 'center', mb: 1.5 }}>
            {/* Mirror landing title style: big sizing, per-word brand colors, subtle shadow */}
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { 
                  lg: `${4 * (['de', 'nl', 'es', 'pt', 'it'].includes(i18n.language) ? 0.8 : 1.0)}rem`, 
                  xl: `${5.5 * (['de', 'nl', 'es', 'pt', 'it'].includes(i18n.language) ? 0.8 : 1.0)}rem` 
                },
                lineHeight: 1.1,
                textShadow: '1px 1px 4px rgba(0,0,0,0.1)',
                mb: 0.5,
                whiteSpace: 'nowrap', // Keep on one line
              }}
            >
              <Box
                component="span"
                sx={{
                  color: (theme) => theme.palette?.brandColors?.purple || '#6741D9',
                  mr: { lg: 1, xl: 2 },
                }}
              >
                {t('guest.experience.tryItOut', 'Try it out.')}{' '}
              </Box>
              <Box
                component="span"
                sx={{
                  color: (theme) => theme.palette?.brandColors?.darkBlue || '#356AC3',
                }}
              >
                {t('guest.experience.noObligation', 'No obligation.')}
              </Box>
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { 
                  lg: `${1.8 * (['de', 'nl', 'es', 'pt', 'it'].includes(i18n.language) ? 0.8 : 1.0)}rem`, 
                  xl: `${2.4 * (['de', 'nl', 'es', 'pt', 'it'].includes(i18n.language) ? 0.8 : 1.0)}rem` 
                },
                color: (theme) => (theme.palette.brandColors?.darkBlue || '#356AC3'),
              }}
            >
              {t('guest.experience.subtitle', 'Just a smidgeon of what VirtualMD.app can do for you.')}
            </Typography>
          </Box>
        )}

        {isDesktop ? (
          <InfoGrid
            items={Object.entries(topics).map(([key, topic]) => ({
              id: `guest-${key}`,
              title: t(topic.title, { ns: 'landingPages' }),
              description: t(topic.subtitle, { ns: 'landingPages' }),
              icon: <img 
                src={typeof topic.iconImage === 'string' && topic.iconImage.endsWith('.png') && !topic.iconImage.startsWith('/') 
                  ? `/${topic.iconImage}` 
                  : topic.iconImage
                } 
                alt={t(topic.title, { ns: 'landingPages' })} 
                style={{ height: 36, width: 'auto' }} 
              />,
              color: topic.color,
              onClick: () => handleTransition('landing', 'specialists', { topic: key })
            }))}
          />
        ) : (
          <Grid container spacing={{ xs: 1, sm: 4, md: 4 }} justifyContent="center">
            {Object.entries(topics).map(([key, topic]) => (
              <Grid item xs={12} sm={12} md={4} lg={4} key={key}>
                <Card
                  elevation={4}
                  sx={{
                    width: '100%',
                    maxWidth: 'none',
                    height: { xs: 160, sm: 240 },
                    mx: 'auto',
                    borderRadius: '16px',
                    background: `linear-gradient(145deg, #6741D915 0%, #6741D905 100%)`,
                    border: `2px solid #6741D9`,
                    transition: 'box-shadow 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: theme.shadows[16],
                      background: `linear-gradient(145deg, #6741D925 0%, #6741D910 100%)`,
                    },
                  }}
                  onClick={() => handleTransition('landing', 'specialists', { topic: key })}
                >
                  <CardActionArea sx={{ height: '100%', overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center' }}>
                    <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 4 }, pt: { xs: 2, sm: 5 }, pb: { xs: 0.5, sm: 1 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%' }}>
                      <Box sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, borderRadius: '50%', bgcolor: '#6741D9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${alpha('#6741D9', 0.4)}`, color: 'white', width: { xs: 50, sm: 80 }, height: { xs: 50, sm: 80 } }}>
                        <img 
                          src={typeof topic.iconImage === 'string' && topic.iconImage.endsWith('.png') && !topic.iconImage.startsWith('/') 
                            ? `/${topic.iconImage}` 
                            : topic.iconImage
                          } 
                          alt={t(topic.title, { ns: 'landingPages' })} 
                          style={{ width: '30px', height: '30px', objectFit: 'contain' }} 
                        />
                      </Box>
                      <CardContent sx={{ p: 0, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', minHeight: { xs: 60, sm: 80 } }}>
                        <Typography variant="h4" sx={{ color: '#6741D9', fontWeight: 700, mb: { xs: 0.5, sm: 2 }, fontSize: { xs: '1.2rem', sm: '2rem', md: '2.125rem' } }}>
                          {t(topic.title, { ns: 'landingPages' })}
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#1976d2', whiteSpace: 'pre-line', maxWidth: '90%', mx: 'auto', lineHeight: { xs: 1.1, sm: 1.5 }, fontWeight: 600, fontSize: { xs: '0.7rem', sm: '1.1rem', md: '1.15rem' }, textAlign: 'center', px: 0.5 }}>
                          {t(topic.subtitle, { ns: 'landingPages' })}
                        </Typography>
                      </CardContent>
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );

  // Render specialist cards
  const renderSpecialistCards = () => {
    const topicData = topics[selectedTopic];
    const personas = topicData.personas.map(id => getPersonaInfo(id));

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ width: '100%' }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                textAlign: 'center',
                mb: 6,
                fontWeight: 700,
                background: topicData.bgGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Your VirtualMD {selectedTopic === 'child' ? 'Pediatric' : selectedTopic === 'sleep' ? 'Sleep' : 'Nutrition'} Team
            </Typography>
          </motion.div>

          <Grid container spacing={6} justifyContent="center">
            {personas.map((persona, index) => (
              <Grid item xs={12} md={4} key={persona.id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <Card
                    elevation={4}
                    sx={{
                      height: 380,
                      borderRadius: '16px',
                      background: `linear-gradient(145deg, ${persona.color}15 0%, ${persona.color}05 100%)`,
                      border: `2px solid ${persona.color}`,
                      transition: 'box-shadow 0.3s',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: theme.shadows[16],
                        background: `linear-gradient(145deg, ${persona.color}25 0%, ${persona.color}10 100%)`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Avatar
                        src={persona.image}
                        sx={{
                          width: 100,
                          height: 100,
                          mx: 'auto',
                          mb: 2,
                          border: `3px solid ${persona.color}`
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: persona.color, mb: 1 }}>
                        {persona.name}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                        {persona.title}
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {persona.bio?.substring(0, 150)}...
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ textAlign: 'center', marginTop: 48 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => handleTransition('specialists', 'chat')}
              disabled={isLoading}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: topicData.bgGradient,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              {isLoading ? 'Starting...' : 'Start Consultation'}
            </Button>
          </motion.div>
        </Container>
      </motion.div>
    );
  };


  return (
    <Box sx={{ 
      width: '100%',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'transparent',
      // Add background image
      backgroundImage: `url(${doctorOnComputerImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1
      }
    }}>
      

      {/* Main Content - scrollable area */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: currentState === 'chat' ? 'center' : 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        pt: 0, // Remove padding - header is fixed separately
        pb: currentState === 'chat' ? 0 : 0,
        zIndex: 2, // Above the background overlay
      }}>
        <AnimatePresence mode="wait">

          {currentState === 'landing' && (
            <motion.div
              key="landing"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ width: '100%' }}
            >
              {renderLandingCards()}
            </motion.div>
          )}

          {currentState === 'specialists' && (
            <motion.div
              key="specialists"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{ width: '100%' }}
            >
              {renderSpecialistCards()}
            </motion.div>
          )}

        </AnimatePresence>
      </Box>

      {/* Footer: desktop uses standard Footer; mobile keeps thin strip */}
      {isDesktop ? (
        <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
          <Footer />
        </Box>
      ) : (
        <Box sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: { xs: '28px', sm: '32px' },
          background: 'linear-gradient(90deg, #1976d2 0%, #6741D9 100%)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
        }}>
          <Typography component="a" href="#" onClick={(e) => { e.preventDefault(); setAdvisoryOpen(true); }} sx={{ color: 'white', textDecoration: 'none', fontSize: { xs: '0.7rem', sm: '0.8rem' }, fontWeight: 500, cursor: 'pointer', textAlign: 'center', '&:hover': { textDecoration: 'underline' } }}>
            ADVISORY TEST
          </Typography>
          <Box sx={{ width: '1px', height: '14px', bgcolor: 'rgba(255,255,255,0.5)' }} />
          <Typography component="a" href="#" onClick={(e) => { e.preventDefault(); setLegalOpen(true); }} sx={{ color: 'white', textDecoration: 'none', fontSize: { xs: '0.7rem', sm: '0.8rem' }, fontWeight: 500, cursor: 'pointer', textAlign: 'center', '&:hover': { textDecoration: 'underline' } }}>
            LEGAL NOTICE
          </Typography>
        </Box>
      )}

      {/* Advisory Dialog */}
      <Dialog
        open={advisoryOpen}
        onClose={() => setAdvisoryOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #1976d2 0%, #6741D9 100%)',
          color: 'white'
        }}>
          {t('common:footer.medicalAdvisory')}
          <IconButton
            onClick={() => setAdvisoryOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            <strong>IMPORTANT MEDICAL ADVISORY:</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            VirtualMD provides AI-powered health information and advisory services. Our AI advisors are not licensed medical professionals and cannot replace professional medical care.
          </Typography>
          <Typography variant="body2" paragraph>
            Always consult with qualified healthcare providers for medical diagnosis and treatment. In case of medical emergency, call emergency services immediately.
          </Typography>
          <Typography variant="body2">
            By using this service, you acknowledge that VirtualMD is an educational and informational tool only.
          </Typography>
        </DialogContent>
      </Dialog>

      {/* Legal Dialog */}
      <Dialog
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'linear-gradient(90deg, #1976d2 0%, #6741D9 100%)',
          color: 'white'
        }}>
          {t('common:footer.legal')}
          <IconButton
            onClick={() => setLegalOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" paragraph>
            © 2024 VirtualMD. All rights reserved.
          </Typography>
          <Typography variant="body2" paragraph>
            Use of this service is subject to our Terms of Service and Privacy Policy. Your health information is protected and handled in accordance with applicable privacy laws.
          </Typography>
          <Typography variant="body2">
            VirtualMD is a registered trademark. Unauthorized use is prohibited.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AnimatedGuestExperience;