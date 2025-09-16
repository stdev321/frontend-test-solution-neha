import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  CircularProgress,
  InputAdornment,
  Alert,
  Button,
  Link,
  Collapse,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import PauseIcon from '@mui/icons-material/Pause';
import CloseIcon from '@mui/icons-material/Close';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { CompactThinkingIndicator } from '../../../components/common/ThinkingIndicator';

// Languages that don't support TTS in ElevenLabs
const LANGUAGES_WITHOUT_TTS = ['am', 'mi', 'xh', 'yo', 'zu'];

// Languages that don't support STT (Speech-to-Text)
const LANGUAGES_WITHOUT_STT = ['mi', 'yo'];

function MobileMessageInputComponent({
  value = '',
  onChange,
  onSend,
  isConnected = true,
  isThinking = false,
  onFileUpload,
  onImageUpload,
  voiceRecorderProps = {},
  isGuestMode = false,
}) {
  const {
    isListening = false,
    isTranscribing = false,
    recordingError = '',
    toggleListening = () => {},
    clearError = () => {}
  } = voiceRecorderProps || {};

  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar' || i18n.language === 'he' || i18n.language === 'fa';
  const [showError, setShowError] = useState(false);
  
  // Check if current language supports TTS
  const languageSupportsVoice = !LANGUAGES_WITHOUT_TTS.includes(i18n.language);
  
  // Check if current language supports STT
  const languageSupportsSpeechToText = !LANGUAGES_WITHOUT_STT.includes(i18n.language);

  React.useEffect(() => {
    if (recordingError) {
      setShowError(true);
    }
  }, [recordingError]);

  const handleClearError = () => {
    setShowError(false);
    clearError();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isListening) {
      toggleListening();
    } else {
      const text = value?.trim();
      if (!text) return;
      onSend?.(text);
    }
  };

  const handleMicClick = () => {
    toggleListening();
  };

  const disabled = !isConnected || isThinking || isTranscribing;
  const hasText = value?.trim().length > 0;
  const isMagicSend = isListening || isTranscribing;

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <Collapse in={showError && recordingError}>
        <Alert 
          severity="error" 
          sx={{ 
            m: 1, 
            borderRadius: 2,
            '& .MuiAlert-message': { 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
              width: '100%'
            }
          }}
          action={
            <IconButton size="small" onClick={handleClearError}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Box sx={{ fontSize: '0.9rem' }}>{recordingError}</Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Button size="small" variant="outlined" onClick={handleClearError}>
              {t('mobileInput.clear')}
            </Button>
            <Link 
              href="/help/microphone" 
              target="_blank" 
              rel="noopener noreferrer"
              underline="none"
            >
              <Button size="small" variant="text">
                {t('mobileInput.needHelp')}
              </Button>
            </Link>
          </Box>
        </Alert>
      </Collapse>

      <Box sx={{
        display: 'flex',
        alignItems: 'flex-end',
        p: 0.75,
        gap: 0.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={6}
          minRows={2}
          placeholder={isListening ? t('mobileInput.listeningPlaceholder') : t('mobileInput.typePlaceholder')}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: isTranscribing ? (
              <InputAdornment position="start" sx={{ mr: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CompactThinkingIndicator sx={{ opacity: 0.7 }} />
                  <CircularProgress size={16} thickness={5} />
                </Box>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: 'background.default',
              minHeight: '56px',
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '1rem',
              py: 1.125,
              px: 1.25
            }
          }}
        />
        
        {/* Button container with camera/mic on top row, send centered below */}
        <Box sx={{
          position: 'relative',
          width: '100px',
          height: '80px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5
        }}>
          {/* Top row: Camera and Microphone */}
          <Box sx={{
            display: 'flex',
            gap: 0.5,
            justifyContent: 'center',
            width: '100%'
          }}>
            {/* Camera button */}
            <Tooltip 
              title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : t('mobileInput.takePhoto', 'Take photo')}
              placement="top"
              arrow={false}
            >
              <span>
                <IconButton
                  size="medium" 
                  onClick={() => onImageUpload?.()} 
                  disabled={isGuestMode || !isConnected || isThinking || !onImageUpload}
                  sx={{ 
                    color: isGuestMode ? 'grey.500' : 'primary.main',
                    opacity: isGuestMode || !onImageUpload ? 0.5 : 1,
                    cursor: isGuestMode || !onImageUpload ? 'not-allowed' : 'pointer',
                    '&:disabled': { color: 'action.disabled' },
                    p: 0.5,
                    minWidth: 36,
                    minHeight: 36,
                    backgroundColor: 'transparent',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: '1.3rem' }} />
                </IconButton>
              </span>
            </Tooltip>

            {/* Microphone button - hidden for languages without TTS or STT */}
            {languageSupportsVoice && languageSupportsSpeechToText && (
              <Tooltip 
                title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : ''}
                placement="top"
                arrow={false}
              >
                <span>
                  <IconButton
                    size="medium" 
                    onClick={handleMicClick} 
                    disabled={isGuestMode || !isConnected || isThinking}
                    sx={{ 
                      color: isGuestMode ? 'grey.500' : 'primary.main',
                      opacity: isGuestMode ? 0.5 : 1,
                      cursor: isGuestMode ? 'not-allowed' : 'pointer',
                      '&:disabled': { color: 'action.disabled' },
                      p: 0.5,
                      minWidth: 36,
                      minHeight: 36,
                      backgroundColor: 'transparent',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    {isListening ? (
                      <PauseIcon sx={{ fontSize: '1.3rem' }} />
                    ) : (
                      <MicIcon sx={{ fontSize: '1.3rem' }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Box>

          {/* Send button - centered below */}
          <IconButton
            size="medium" 
            onClick={handleSend} 
            disabled={disabled || (!hasText && !isListening)} 
            sx={{ 
              minWidth: 40,
              minHeight: 40,
              p: 0.5,
              color: isMagicSend
                ? '#ba68c8'                // magic-send purple arrow
                : hasText
                ? 'primary.main'           // blue arrow when text present
                : 'action.disabled',       // grey when disabled
              backgroundColor: hasText || isMagicSend ? 'action.hover' : 'transparent',
              '&:hover': {
                backgroundColor: hasText || isMagicSend ? 'action.selected' : 'action.hover'
              }
            }}
          >
            {isMagicSend ? (
              <Box sx={{ position: 'relative' }}>
                <SendIcon sx={{ 
                  fontSize: '1.5rem',
                  transform: isRTL ? 'scaleX(-1)' : 'none'
                }} />
                <AutoFixHighIcon 
                  sx={{ 
                    position: 'absolute', 
                    top: -3, 
                    right: -3, 
                    fontSize: '0.8rem',
                    animation: 'sparkle 1s infinite'
                  }} 
                />
                <style>
                  {`
                    @keyframes sparkle {
                      0%, 100% { opacity: 1; transform: scale(1); }
                      50% { opacity: 0.7; transform: scale(1.2); }
                    }
                  `}
                </style>
              </Box>
            ) : (
              <SendIcon sx={{ 
                fontSize: '1.5rem',
                transform: isRTL ? 'scaleX(-1)' : 'none'
              }} />
            )}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

export const MobileMessageInput = MobileMessageInputComponent;
export default MobileMessageInputComponent;