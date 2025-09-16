import React, { useState, useEffect, useRef } from 'react';
import { Box, Avatar, Paper, ListItem, ListItemText, Typography, useTheme, IconButton, Tooltip, useMediaQuery, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { getPersonaDetails, textToSpeech, streamElevenLabsTTS, API_BASE_URL } from '../../../services/api';
import translationService from '../../../services/translationService';
import { getPersonaImageUrl, PERSONA_IMAGE_SIZES, determineImageSize } from '../../../utils/personaImageUtils';

// Global key for the one-and-only speech player on this page
const GLOBAL_TTS_KEY = '__globalTtsAudio';

// Languages that don't support TTS in ElevenLabs
const LANGUAGES_WITHOUT_TTS = ['am', 'mi', 'xh', 'yo', 'zu'];

// Construct the full URL for Health Expert Carol's image using the correct path with tier system
// Use tiny for chat avatars (96x96) - perfect for the 48x48 display size
const femaleDoctorImage = `/persona_images/aileen-carol_tiny.png`;

// Import guest user image
import guestUserImage from '../../../assets/images/guest-user_tiny.png';

// Helper to convert relative persona image path to backend URL (from your branch)
const constructFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;

  let filename = imagePath.trim();
  if (filename.startsWith('/persona_images/')) filename = filename.substring('/persona_images/'.length);
  else if (filename.startsWith('persona_images/')) filename = filename.substring('persona_images/'.length);
  else if (filename.startsWith('/')) filename = filename.substring(1);

  if (filename.trim() === '') return null;
  return `${API_BASE_URL}/persona_images/${filename}`;
};

// Extracted MessageItem component to keep ChatArea under 500 lines
export default function MessageItem({ message, userProfile, currentUser, isGuestMode = false, shouldAutoPlay = false, onSpoken }) {
  const theme = useTheme();
  const { t, i18n } = useTranslation(['chat', 'common']);
  const navigate = useNavigate();
  const isUser = message.role === 'user';
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userBg = isDark ? theme.palette.primary.dark : '#DCF8C6';
  const asstBg = isDark ? theme.palette.grey[800] : theme.palette.grey[200];
  const userText = isDark ? theme.palette.common.white : theme.palette.getContrastText(userBg);
  const asstText = theme.palette.getContrastText(asstBg);
  
  // Check if current language supports TTS
  const languageSupportsVoice = !LANGUAGES_WITHOUT_TTS.includes(i18n.language);

  const [personaName, setPersonaName] = useState(null);
  const [translatedPersonaName, setTranslatedPersonaName] = useState(null);
  const [nameLoading, setNameLoading] = useState(false);
  const [personaImage, setPersonaImage] = useState(null);
  const [personaVoice, setPersonaVoice] = useState(null);

  // Text-to-speech state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [currentAudio, setCurrentAudio] = useState(null);
  const savedAudioUrlRef = useRef(null); // cache to avoid refetching
  // Track whether this assistant message has already been auto-spoken
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  
  // Audio element ref for streaming
  const streamingAudioRef = useRef(null);

  const [waitFired, setWaitFired] = useState(false);

  // Removed grace-period timer due to queue implementation

  // Fetch persona details for assistant messages
  useEffect(() => {
    if (!isUser && message.persona_id && !personaName && !nameLoading) {
      setNameLoading(true);
      getPersonaDetails(message.persona_id)
        .then(details => {
          setPersonaName(details?.name || message.persona_id);
          setPersonaVoice(details?.voice);
          
          // Use smart image sizing based on context
          // For chat messages, use tiny size (96x96) on desktop, medium on mobile for retina
          const imageSize = isMobile ? PERSONA_IMAGE_SIZES.MEDIUM : PERSONA_IMAGE_SIZES.TINY;
          const smartImageUrl = getPersonaImageUrl(message.persona_id, imageSize);
          
          // Fallback to API-provided image if smart sizing fails
          if (details?.image) {
            let validImageSrc = null;
            if (typeof details.image === 'string' && details.image.trim().startsWith('{')) {
              try {
                const imgData = JSON.parse(details.image);
                if (typeof imgData.light === 'string' && imgData.light.trim()) {
                  validImageSrc = imgData.light;
                }
              } catch (e) {
                console.error('Failed to parse persona image JSON in MessageItem:', e);
              }
            } else if (typeof details.image === 'string' && details.image.trim()) {
              validImageSrc = details.image;
            }
            // Try smart sized image first, fallback to API image
            setPersonaImage(smartImageUrl || constructFullImageUrl(validImageSrc));
          } else {
            // No API image, use smart sizing
            setPersonaImage(smartImageUrl);
          }
        })
        .catch(err => {
          console.error('Persona fetch err:', err);
          setPersonaName(message.persona_id);
          setPersonaVoice(null);
          // Even on error, try to use smart image sizing
          const imageSize = isMobile ? PERSONA_IMAGE_SIZES.MEDIUM : PERSONA_IMAGE_SIZES.TINY;
          setPersonaImage(getPersonaImageUrl(message.persona_id, imageSize));
        })
        .finally(() => setNameLoading(false));
    }
  }, [isUser, message.persona_id, personaName, nameLoading, isMobile]);

  // Translate persona name when language changes
  useEffect(() => {
    const translatePersonaName = async () => {
      if (!personaName || i18n.language === 'en') {
        setTranslatedPersonaName(personaName);
        return;
      }

      try {
        const targetLanguage = i18n.language;
        
        if (personaName.startsWith('AI ')) {
          const nameWithoutAI = personaName.substring(3); // Remove "AI " prefix
          const result = await translationService.translateText(nameWithoutAI, targetLanguage);
          if (result.success) {
            setTranslatedPersonaName(`AI ${result.data.translated_text}`);
          } else {
            setTranslatedPersonaName(personaName); // Fallback to original
          }
        } else {
          const result = await translationService.translateText(personaName, targetLanguage);
          if (result.success) {
            setTranslatedPersonaName(result.data.translated_text);
          } else {
            setTranslatedPersonaName(personaName); // Fallback to original
          }
        }
      } catch (error) {
        console.error('Error translating persona name:', error);
        setTranslatedPersonaName(personaName); // Fallback to original
      }
    };

    if (personaName) {
      translatePersonaName();
    }
  }, [personaName, i18n.language]);

  // Auto-play only after persona details are loaded (nameLoading false) so we pick the correct voice
  useEffect(() => {
    if (!shouldAutoPlay || hasAutoPlayed || isUser || !message.content || !languageSupportsVoice) return;

    if (personaVoice || waitFired) {
      handlePlaySpeech();
      return;
    }

    // Wait up to 700 ms for personaVoice to arrive
    const t = setTimeout(() => setWaitFired(true), 700);
    return () => clearTimeout(t);
  }, [shouldAutoPlay, hasAutoPlayed, isUser, message.content, personaVoice, waitFired, languageSupportsVoice]);

  // Text-to-speech functions
  const handlePlaySpeech = async () => {
    // Don't allow playing speech for languages without TTS support
    if (!languageSupportsVoice) return;
    
    try {
      setAudioError('');
      
      /* 1.  If THIS message is already playing -> stop & return (toggle behaviour) */
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (window[GLOBAL_TTS_KEY] === currentAudio) {
          window[GLOBAL_TTS_KEY] = null;
        }
        // Clean up blob URL if exists
        if (currentAudio.src && currentAudio.src.startsWith('blob:')) {
          URL.revokeObjectURL(currentAudio.src);
        }
        setCurrentAudio(null);
        setIsPlaying(false);
        return;
      }

      /* 2.  Somebody else is talking → stop them first */
      if (window[GLOBAL_TTS_KEY]) {
        window[GLOBAL_TTS_KEY].pause();
        window[GLOBAL_TTS_KEY].currentTime = 0;
        // Clean up blob URL if exists
        if (window[GLOBAL_TTS_KEY].src && window[GLOBAL_TTS_KEY].src.startsWith('blob:')) {
          URL.revokeObjectURL(window[GLOBAL_TTS_KEY].src);
        }
        window[GLOBAL_TTS_KEY] = null;
      }

      // Show loading state IMMEDIATELY
      setIsLoadingTTS(true);
      setIsPlaying(false); // Not playing yet
      
      // Determine voice to use
      const voiceToUse = !isUser && personaVoice ? personaVoice : undefined;
      
      // For ElevenLabs voices, use streaming with proper auth
      if (voiceToUse) {
        try {
          console.log('🎵 Starting streaming for voice:', voiceToUse);
          
          let audioStarted = false;
          
          // Stream with authentication
          const { url, cleanup } = await streamElevenLabsTTS(
            message.content, 
            voiceToUse,
            (initialUrl) => {
              // This callback fires when we have enough audio to start playing
              console.log('🎵 First chunk ready, starting playback');
              if (!audioStarted) {
                audioStarted = true;
                // Could start playing initial audio here if we wanted
                // But we'll wait for complete audio for simplicity
              }
            }
          );
          
          console.log('🎵 Creating audio element with complete stream');
          
          // Create audio element with the complete streamed audio
          const audio = new Audio(url);
          audio.volume = 1.0;
          
          // Set up event handlers
          audio.oncanplay = () => {
            console.log('🎵 Audio can play');
            setIsLoadingTTS(false);
          };
          
          audio.onplay = () => {
            console.log('🎵 Audio started playing');
            setIsPlaying(true);
            setHasAutoPlayed(true);
          };
          
          audio.onended = () => {
            console.log('🎵 Audio playback ended');
            setIsPlaying(false);
            setCurrentAudio(null);
            cleanup(); // Clean up blob URL
            onSpoken && onSpoken();
            if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
          };
          
          audio.onerror = (err) => {
            console.error('🎵 Audio playback error:', err);
            setIsPlaying(false);
            setIsLoadingTTS(false);
            setCurrentAudio(null);
            cleanup(); // Clean up blob URL
            if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
          };
          
          // Store references
          setCurrentAudio(audio);
          streamingAudioRef.current = audio;
          window[GLOBAL_TTS_KEY] = audio;
          
          console.log('🎵 Starting playback...');
          // Start playing
          await audio.play();
          return; // Exit after successful streaming
          
        } catch (streamErr) {
          console.error('Streaming failed:', streamErr);
          setIsLoadingTTS(false);
          // Fall through to regular TTS as fallback
        }
      }
      
      // Fallback to regular TTS if streaming fails or no voice specified
      if (!savedAudioUrlRef.current) {
        let audioBlob;
        try {
          audioBlob = await textToSpeech(message.content, voiceToUse);
        } catch (apiErr) {
          if (voiceToUse) {
            console.warn('TTS with custom voice failed, falling back to default:', apiErr);
            audioBlob = await textToSpeech(message.content);
          } else {
            throw apiErr;
          }
        }
        savedAudioUrlRef.current = URL.createObjectURL(audioBlob);
      }

      // Create audio element and play
      const audioUrl = savedAudioUrlRef.current;
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
        setHasAutoPlayed(true);
        onSpoken && onSpoken();
        // Keep the cached URL for future replay; do not revoke here
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingTTS(false);
        setCurrentAudio(null);
        setAudioError(t('chat:audio.playbackFailed'));
        if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
        setHasAutoPlayed(true);
        onSpoken && onSpoken();
        // Keep cached URL
      };
      
      // If some external code pauses this audio (e.g., global toggle), reset flags
      audio.onpause = () => {
        if (audio.currentTime !== 0 && !audio.ended) return; // ignore mid-pause
        setIsPlaying(false);
        setCurrentAudio(null);
        if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
        setHasAutoPlayed(true);
        onSpoken && onSpoken();
        // do not revoke cached url
      };
      
      setCurrentAudio(audio);
      window[GLOBAL_TTS_KEY] = audio;   //  <- remember who's talking now
      
      // Clear loading state and start playing
      setIsLoadingTTS(false);
      setIsPlaying(true);
      
      await audio.play().catch(err => {
        if (err.name === 'AbortError') return;
        throw err;
      });
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Text-to-speech error:', error);
        setAudioError(t('chat:audio.generationFailed'));
      }
      setIsPlaying(false);
      setIsLoadingTTS(false);
      setCurrentAudio(null);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        if (window[GLOBAL_TTS_KEY] === currentAudio) {
          window[GLOBAL_TTS_KEY] = null;
        }
        URL.revokeObjectURL(currentAudio.src);
      }
    };
  }, [currentAudio]);

  // Determine fallback initials for user avatar
  let userInitials = '?';
  let displayName = '';
  
  if (isGuestMode) {
    userInitials = 'G';
    displayName = t('common:guest.userObject.displayName');
  } else {
    const profileSrc = userProfile || currentUser;
    if (isUser && profileSrc) {
      if (profileSrc.full_name) {
        const names = profileSrc.full_name.trim().split(' ');
        userInitials = names[0][0].toUpperCase();
        if (names.length > 1) userInitials += names[names.length - 1][0].toUpperCase();
        displayName = profileSrc.full_name;
      } else if (profileSrc.display_name) {
        userInitials = profileSrc.display_name[0].toUpperCase();
        displayName = profileSrc.display_name;
      } else if (profileSrc.email) {
        userInitials = profileSrc.email[0].toUpperCase();
        displayName = profileSrc.email;
      }
    }
  }

  let displayContent = message.content;
  if (displayContent.startsWith("?Hello, I'm AI Health Expert Aileen Carol.")) {
      displayContent = t('welcome.aileenCarolIntro');
  } else if (displayContent.startsWith("Hello, I'm AI Health Expert Aileen Carol.")) {
      displayContent = t('welcome.aileenCarolIntro');
  } else if (displayContent === "persona_welcome_message") {
      displayContent = t('welcome.persona_welcome_message');
  } else if (displayContent.startsWith('chat:guest.topics.')) {
      // Handle guest topic-specific welcome messages
      displayContent = t(displayContent);
  }

  return (
    <ListItem sx={{ display: 'flex', px: 1, py: 0.5 }}>
      <Box sx={{ display: 'flex', gap: 0.5, width: '100%', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        {!isUser && (
          <Avatar sx={{ width: 48, height: 48, bgcolor: 'transparent', alignSelf: 'flex-end', position: 'relative', bottom: '-36px' }}>
            {personaImage ? (
              <img
                src={personaImage}
                alt={t('common:alt.aiAssistant')}
                width="100%"
                height="100%"
                style={{
                  objectFit: message.persona_id === 'ai_persona_aileen_carol' ? 'contain' : 'cover',
                  objectPosition: message.persona_id === 'ai_persona_aileen_carol' ? 'center top' : 'center',
                  borderRadius: '50%'
                }}
                onError={e => {
                  e.target.onerror = null;
                  setPersonaImage(message.persona_id === 'ai_persona_aileen_carol' ? femaleDoctorImage : null);
                }}
              />
            ) : message.persona_id === 'ai_persona_aileen_carol' ? (
              <img src={femaleDoctorImage} alt={t('common:alt.aiAssistant')} width="100%" height="100%" style={{ objectFit: 'contain', objectPosition: 'center top', borderRadius: '50%' }} />
            ) : (
              <MedicalServicesIcon />
            )}
          </Avatar>
        )}

        <Paper
          elevation={1}
          sx={{
            p: '10px 14px',
            maxWidth: '75%',
            bgcolor: isPlaying ? (isDark ? '#1565c0' : '#42a5f5') : (isUser ? userBg : asstBg),
            color: isPlaying ? '#ffffff' : (isUser ? userText : asstText),
            borderRadius: isUser ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
            wordWrap: 'break-word',
            minWidth: '80px',
            position: 'relative',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <ListItemText
                primary={displayContent}
                primaryTypographyProps={{ 
                  sx: { 
                    whiteSpace: 'pre-wrap', 
                    fontSize: '1.15rem',
                    lineHeight: '1.35',
                  } 
                }}
                secondaryTypographyProps={{ component: 'div' }}
                secondary={
                  <>
                    {/* Registration button for special registration prompt messages */}
                    {message.isRegistrationPrompt && (
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => navigate('/register')}
                          sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 'bold',
                            px: 3,
                            py: 1,
                          }}
                        >
                          {t('chat:register.createAccount', 'Create Account')}
                        </Button>
                      </Box>
                    )}
                    <br />
                    {!isUser && (
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{ fontWeight: 'bold', color: isDark ? theme.palette.primary.light : theme.palette.primary.main, fontSize: '1.0rem' }}
                      >
                        {nameLoading ? t('common:loading.dots') : (() => {
                          const aiPrefix = t('common:aiPrefix', 'AI');
                          const name = translatedPersonaName || message.persona_id;
                          if (name?.toLowerCase().startsWith('ai ') || name?.toLowerCase().startsWith('ia ')) {
                            return name;
                          }
                          return `${aiPrefix} ${name}`;
                        })()}
                      </Typography>
                    )}
                    {/* Medical disclaimer for AI responses */}
                    {!isUser && (
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          display: 'block',
                          fontSize: '0.7rem',
                          color: theme.palette.secondary.main || '#9c27b0',
                          fontStyle: 'italic',
                          mt: 1,
                          mb: 0.5,
                        }}
                      >
                        {t('chat:disclaimer.notMedicalAdvice', 'Informational only. Always consult with a licensed medical professional.')}
                      </Typography>
                    )}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      gap: 0.5,
                      mt: 0.5 
                    }}>
                      <Typography
                        variant="caption"
                        component="div"
                        sx={{
                          fontSize: '0.75rem',
                          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                        }}
                      >
                        {message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.language, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric', 
                          minute: '2-digit', 
                          hour12: !['de', 'fr', 'es', 'it', 'nl', 'pt', 'ru', 'uk'].includes(i18n.language) // 24-hour format for these languages
                        }) : ''}
                      </Typography>
                      {/* Speaker button for TTS */}
                      {message.content && languageSupportsVoice && (
                        <Tooltip title={
                          isLoadingTTS ? t('chat:audio.generating', 'Generating speech...') :
                          isPlaying ? t('chat:audio.stopSpeaking', 'Stop speaking') : 
                          t('chat:audio.speakMessage', 'Speak message')
                        }>
                          <IconButton
                            size="small"
                            onClick={handlePlaySpeech}
                            disabled={isLoadingTTS}
                            sx={{
                              padding: '2px',
                              color: isPlaying ? theme.palette.primary.main : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                              '&:hover': {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              }
                            }}
                          >
                            {isLoadingTTS ? (
                              <CircularProgress size={14} thickness={2} />
                            ) : isPlaying ? (
                              <VolumeOffIcon sx={{ fontSize: '16px' }} />
                            ) : (
                              <VolumeUpIcon sx={{ fontSize: '16px' }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </>
                }
              />
            </Box>
          </Box>
          
          {/* Error message for audio playback */}
          {audioError && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'error.main',
                fontSize: '0.8rem',
                mt: 0.5,
              }}
            >
              {audioError}
            </Typography>
          )}
        </Paper>

        {isUser && (
          <Avatar
            sx={{ width: 48, height: 48, bgcolor: 'secondary.main', alignSelf: 'flex-end', position: 'relative', bottom: '-36px' }}
            src={isGuestMode ? guestUserImage : (userProfile?.profile_picture || undefined)}
          >
            {!isGuestMode && !userProfile?.profile_picture ? userInitials : null}
          </Avatar>
        )}
      </Box>
    </ListItem>
  );
} 