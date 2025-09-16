import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, IconButton, useTheme, CircularProgress } from '@mui/material';
import guestUserImg from '../../../assets/images/guest-user_tiny.png';
import { useTranslation } from 'react-i18next';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { getPersonaImageUrl, PERSONA_IMAGE_SIZES } from '../../../utils/personaImageUtils';
import { textToSpeech, streamElevenLabsTTS, getPersonaDetails } from '../../../services/api';

// Local constants
const AILEENCAROL_ID = 'ai_persona_aileen_carol';
// Use tiny size for mobile (96x96) - fast loading on mobile
const AILEENCAROL_IMAGE = '/persona_images/aileen-carol_tiny.png';

function getUserInitials(profile, t) {
  if (!profile) return t('common.user.defaultInitial');
  if (profile.full_name) {
    const names = profile.full_name.trim().split(' ');
    return names.map(n=>n[0]).join('').substring(0,2).toUpperCase();
  }
  if (profile.display_name) return profile.display_name[0].toUpperCase();
  if (profile.email) return profile.email[0].toUpperCase();
  return t('common.user.defaultInitial');
}

// Global key for the one-and-only speech player on this page
const GLOBAL_TTS_KEY = '__globalTtsAudio';

// Languages that don't support TTS in ElevenLabs
const LANGUAGES_WITHOUT_TTS = ['am', 'mi', 'xh', 'yo', 'zu'];

// Placeholder stub for a single chat message item.
function MobileMessageItemComponent({ message, userProfile, currentUser, personas = [] }) {
  const { t, i18n } = useTranslation(['chat', 'common']);
  const theme = useTheme();
  
  if (!message) return null;
  const role  = message.role || message.sender || 'assistant';
  const isUser = role === 'user';
  let content = message.content || '';
  
  // Check if current language supports TTS
  const languageSupportsVoice = !LANGUAGES_WITHOUT_TTS.includes(i18n.language);

  // Apply translation logic for special message content (matching desktop implementation)
  if (content.startsWith("?Hello, I'm AI Health Expert Aileen Carol.")) {
    content = t('welcome.aileenCarolIntro');
  } else if (content.startsWith("Hello, I'm AI Health Expert Aileen Carol.")) {
    content = t('welcome.aileenCarolIntro');
  } else if (content === "persona_welcome_message") {
    content = t('welcome.persona_welcome_message');
  }

  // Get persona image URL based on persona_id
  // Use TINY size (96x96) for mobile for fast loading
  const personaImageUrl = message.persona_id ? 
    getPersonaImageUrl(message.persona_id, PERSONA_IMAGE_SIZES.TINY) : 
    AILEENCAROL_IMAGE;

  // Text-to-speech state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [personaVoice, setPersonaVoice] = useState(null);
  const savedAudioUrlRef = useRef(null);
  
  // Audio element ref for streaming
  const streamingAudioRef = useRef(null);

  // Fetch persona voice for TTS
  useEffect(() => {
    if (!isUser && message.persona_id) {
      getPersonaDetails(message.persona_id)
        .then(details => {
          setPersonaVoice(details?.voice);
        })
        .catch(err => {
          console.error('Failed to fetch persona voice:', err);
        });
    }
  }, [isUser, message.persona_id]);

  // Text-to-speech function
  const handlePlaySpeech = async () => {
    if (!languageSupportsVoice) return;
    
    try {
      // If THIS message is already playing -> stop & return (toggle behavior)
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

      // Somebody else is talking → stop them first
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
          console.log('📱🎵 Starting streaming for voice:', voiceToUse);
          
          let audioStarted = false;
          
          // Stream with authentication
          const { url, cleanup } = await streamElevenLabsTTS(
            content, 
            voiceToUse,
            (initialUrl) => {
              // This callback fires when we have enough audio to start playing
              console.log('📱🎵 First chunk ready, starting playback');
              if (!audioStarted) {
                audioStarted = true;
                // Could start playing initial audio here if we wanted
                // But we'll wait for complete audio for simplicity
              }
            }
          );
          
          console.log('📱🎵 Creating audio element with complete stream');
          
          // Create audio element with the complete streamed audio
          const audio = new Audio(url);
          audio.volume = 1.0;
          
          // Set up event handlers
          audio.oncanplay = () => {
            console.log('📱🎵 Audio can play');
            setIsLoadingTTS(false);
          };
          
          audio.onplay = () => {
            console.log('📱🎵 Audio started playing');
            setIsPlaying(true);
          };
          
          audio.onended = () => {
            console.log('📱🎵 Audio playback ended');
            setIsPlaying(false);
            setCurrentAudio(null);
            cleanup(); // Clean up blob URL
            if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
          };
          
          audio.onerror = (err) => {
            console.error('📱🎵 Audio playback error:', err);
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
          
          console.log('📱🎵 Starting playback...');
          // Start playing
          await audio.play();
          return; // Exit after successful streaming
          
        } catch (streamErr) {
          console.error('Mobile streaming failed:', streamErr);
          setIsLoadingTTS(false);
          // Fall through to regular TTS as fallback
        }
      }
      
      // Fallback to regular TTS if streaming fails or no voice specified
      if (!savedAudioUrlRef.current) {
        let audioBlob;
        try {
          audioBlob = await textToSpeech(content, voiceToUse);
        } catch (apiErr) {
          if (voiceToUse) {
            console.warn('TTS with custom voice failed, falling back to default:', apiErr);
            audioBlob = await textToSpeech(content);
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
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        if (window[GLOBAL_TTS_KEY] === audio) window[GLOBAL_TTS_KEY] = null;
      };
      
      setCurrentAudio(audio);
      window[GLOBAL_TTS_KEY] = audio;
      
      // Clear loading and start playing
      setIsLoadingTTS(false);
      setIsPlaying(true);
      
      await audio.play().catch(err => {
        if (err.name === 'AbortError') return;
        throw err;
      });
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Text-to-speech error:', error);
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: 1,
        my: 0.5,
      }}
    >
      {isUser ? (
        <Avatar
          sx={{ width: 32, height: 32 }}
          src={userProfile?.profile_picture || currentUser?.profile_picture || guestUserImg}
        >
          {getUserInitials(userProfile || currentUser, t)}
        </Avatar>
      ) : (
        <Avatar sx={{ width: 32, height: 32 }} src={personaImageUrl}>
          <MedicalServicesIcon fontSize="small" />
        </Avatar>
      )}
      <Box
        sx={{
          bgcolor: isPlaying ? '#1976d2' : (isUser ? 'primary.main' : 'grey.800'),
          color: 'white',
          px: 1.5,
          py: 1,
          borderRadius: 2,
          maxWidth: '70%',
          fontSize: '0.85rem',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: '0.8rem' }}>
          {content}
        </Typography>
        {/* Medical disclaimer for AI responses */}
        {!isUser && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.65rem',
              color: '#ce93d8',  // Light purple for better visibility on dark backgrounds
              fontStyle: 'italic',
              mt: 0.5,
            }}
          >
            {t('chat:disclaimer.notMedicalAdvice', 'Informational only. Always consult with a licensed medical professional.')}
          </Typography>
        )}
        {/* Timestamp and speaker button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          gap: 0.5,
          mt: 0.5 
        }}>
          {message.timestamp && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.65rem',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {new Date(message.timestamp).toLocaleString(i18n.language, { 
                month: 'short', 
                day: 'numeric',
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: !['de', 'fr', 'es', 'it', 'nl', 'pt', 'ru', 'uk'].includes(i18n.language)
              })}
            </Typography>
          )}
          {/* Speaker button for TTS */}
          {content && languageSupportsVoice && (
            <IconButton
              size="small"
              onClick={handlePlaySpeech}
              disabled={isLoadingTTS}
              sx={{
                padding: '2px',
                color: isPlaying ? '#ffffff' : 'rgba(255,255,255,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              {isLoadingTTS ? (
                <CircularProgress size={12} thickness={2} sx={{ color: 'rgba(255,255,255,0.7)' }} />
              ) : isPlaying ? (
                <VolumeOffIcon sx={{ fontSize: '14px' }} />
              ) : (
                <VolumeUpIcon sx={{ fontSize: '14px' }} />
              )}
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export const MobileMessageItem = MobileMessageItemComponent;
export default MobileMessageItemComponent; 