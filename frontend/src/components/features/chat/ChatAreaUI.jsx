import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  useTheme,
  Avatar,
  IconButton,
  Chip,
  Alert,
  Tooltip,
  Button,
  Fade,
  InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PauseIcon from '@mui/icons-material/Pause';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HearingIcon from '@mui/icons-material/Hearing';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import GroupIcon from '@mui/icons-material/Group';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { uploadFile, getPersonaDetails } from '../../../services/api';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useTranslation } from 'react-i18next';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';
import TextEntryPrompt from './TextEntryPrompt';
import { pauseCurrentAudio } from '../../../utils/globalAudio';
import { CompactThinkingIndicator, ThinkingIndicator } from '../../common/ThinkingIndicator';

// Simple pause icon component for when recording
const PauseIcon_Recording = ({ sx, ...props }) => (
  <PauseIcon sx={{ fontSize: 22, ...sx }} {...props} />
);

// Languages that don't support TTS in ElevenLabs
const LANGUAGES_WITHOUT_TTS = ['am', 'mi', 'xh', 'yo', 'zu'];

// Languages that don't support STT (Speech-to-Text)
const LANGUAGES_WITHOUT_STT = ['mi', 'yo'];

export default function ChatAreaUI({
  /* grouped prop objects */
  audioProps = {},
  uiProps    = {},

  // non-audio props that are still passed individually
  sendMessage,
  panelGroupRef,
  showWelcomeMessage,
  chatMessagesContainerRef,
  username,
  aileenCarolImage,
  aileenCarolPersona,
  onStartTeamChat,
  onGoToEncyclopedia,
  onGoToManageTeam,
  onShowSpecialistsGrid,
  onGoToSavedConsultations,
  messages,
  userProfile,
  currentUser,
  thinkingIndicatorRef,
  isThinking,
  messagesEndRef,
  isUploading,
  recordingError,
  uploadError,
  setRecordingError,
  setUploadError,
  fileInputRef,
  handleFileChange,
  isConnected,
  isConnecting,
  handleUploadClick,
  handleCameraClick,
  inputMessageRef,
  handleTextFieldFocus,
  conversationId,
  isGuestMode = false,
}) {
  // Combine grouped props into a single object for convenient destructuring
  const merged = { ...audioProps, ...uiProps };

  const {
    autoPlayAiAudio: mergedAutoPlayAiAudio,
    setAutoPlayAiAudio: mergedSetAutoPlayAiAudio,
    autoRecord: mergedAutoRecord,
    setAutoRecord: mergedSetAutoRecord,
    isListening: mergedIsListening,
    setIsListening: mergedSetIsListening,
    isTranscribing: mergedIsTranscribing,
    startRecording: mergedStartRecording,
    stopRecording: mergedStopRecording,
    speakQueue: mergedSpeakQueue,
    setSpeakQueue: mergedSetSpeakQueue,
    handleMicClick: mergedHandleMicClick,
    handleSendClick: mergedHandleSendClick,
    showTextPrompt: mergedShowTextPrompt,
    setShowTextPrompt: mergedSetShowTextPrompt,
    inputMessage: mergedInputMessage,
    handleInputChange: mergedHandleInputChange,
    handleKeyPress: mergedHandleKeyPress,
    suppressSilenceErrorRef: mergedSuppressSilenceErrorRef,
  } = merged;
  /* Audio group */
  const autoPlayAiAudioLocal      = mergedAutoPlayAiAudio;
  const setAutoPlayAiAudioLocal   = mergedSetAutoPlayAiAudio;
  const autoRecordLocal           = mergedAutoRecord;
  const setAutoRecordLocal        = mergedSetAutoRecord;
  const isListeningLocal          = mergedIsListening;
  const setIsListeningLocal       = mergedSetIsListening;
  const isTranscribingLocal       = mergedIsTranscribing;
  const startRecordingLocal       = mergedStartRecording;
  const stopRecordingLocal        = mergedStopRecording;
  const speakQueueLocal           = mergedSpeakQueue;
  const setSpeakQueueLocal        = mergedSetSpeakQueue;
  const handleMicClickLocal       = mergedHandleMicClick;
  const handleSendClickLocal      = mergedHandleSendClick;
  const handleKeyPressLocal =
    mergedHandleKeyPress ||
    ((e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleMicClickLocal();    // mimic Mic / Pen
        } else {
          handleSendClickLocal();   // existing Send behaviour
        }
      }
    });

  /* UI group */
  const showTextPromptLocal       = mergedShowTextPrompt;
  const setShowTextPromptLocal    = mergedSetShowTextPrompt;
  const inputMessageLocal         = mergedInputMessage;
  const handleInputChangeLocal    = mergedHandleInputChange;

  // ====== End of alias block ======

  const theme = useTheme();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar' || i18n.language === 'he' || i18n.language === 'fa';
  const { t: tCommon } = useTranslation('common');
  
  // Check if current language supports TTS
  const languageSupportsVoice = !LANGUAGES_WITHOUT_TTS.includes(i18n.language);
  
  // Check if current language supports STT
  const languageSupportsSpeechToText = !LANGUAGES_WITHOUT_STT.includes(i18n.language);
  
  // Turn off auto-play when switching to a language that doesn't support TTS
  React.useEffect(() => {
    if (!languageSupportsVoice && autoPlayAiAudioLocal) {
      setAutoPlayAiAudioLocal(false);
      pauseCurrentAudio();
    }
  }, [languageSupportsVoice, autoPlayAiAudioLocal, setAutoPlayAiAudioLocal]);
  
  /* help pop-up */
  const [helpOpen, setHelpOpen] = useState(false);
  const [hideHelpButton, setHideHelpButton] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  /* Health Expert Carol "no speech detected" popup */
  const [noSpeechDialogOpen, setNoSpeechDialogOpen] = useState(false);
  /* Upload features dialog for guest users */
  const [uploadFeaturesDialogOpen, setUploadFeaturesDialogOpen] = useState(false);

  // Reset help button visibility when conversation changes
  React.useEffect(() => {
    // If this is a different conversation (including new conversation), reset help button
    if (currentConversationId !== conversationId) {
      setHideHelpButton(false);
      setCurrentConversationId(conversationId);
      // Clear the localStorage when starting a new conversation
      localStorage.removeItem('aileenCarolHelpDialog_dontShowAgain');
    }
  }, [conversationId, currentConversationId]);

  // Check if recordingError contains "No speech detected" and show popup accordingly
  React.useEffect(() => {
    if (recordingError && recordingError.toLowerCase().includes('no speech detected')) {
      // Check if user has chosen not to show this popup again
      // Disabled popup - always act as if "don't show again" was selected
      const dontShowAgain = true; // Changed to always true to disable popup
      if (!dontShowAgain) {
        setNoSpeechDialogOpen(true);
      }
      // Clear the recording error so it doesn't show as an Alert
      setRecordingError('');
    }
  }, [recordingError, setRecordingError]);

  // Helper function to check if error should show as popup instead of alert
  const shouldShowAsAlert = (error) => {
    if (!error) return false;
    return !error.toLowerCase().includes('no speech detected');
  };

  // Handle "don't show me again" button for no speech popup
  const handleDontShowAgain = () => {
    localStorage.setItem('aileenCarolNoSpeechPopup_dontShowAgain', 'true');
    setNoSpeechDialogOpen(false);
  };

  // Handle "Got it" button for no speech popup
  const handleGotIt = () => {
    setNoSpeechDialogOpen(false);
  };

  // Handle help dialog
  const handleShowHelp = () => {
    console.log('ChatAreaUI: handleShowHelp clicked! setHelpOpen function:', setHelpOpen);
    console.log('ChatAreaUI: About to call setHelpOpen(true)');
    // Since we reset the preference per conversation, just show the dialog
    setHelpOpen(true);
    console.log('ChatAreaUI: setHelpOpen(true) completed');
  };

  const handleHelpDontShowAgain = () => {
    localStorage.setItem('aileenCarolHelpDialog_dontShowAgain', 'true');
    setHideHelpButton(true);
    setHelpOpen(false);
  };

  const handleHelpOk = () => {
    setHelpOpen(false);
  };

  return (
    <PanelGroup
      direction="vertical"
      style={{ height: '100%', width: '100%' }}
      ref={panelGroupRef}
    >
      <Panel
        minSize={25}
        defaultSize={60}
        collapsible={!showWelcomeMessage}
        collapsedSize={0}
      >
        <Box
          ref={chatMessagesContainerRef}
          sx={{
            p: 2,
            height: '100%',
            overflowY: 'auto',
            bgcolor:
              theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : theme.palette.grey[100],
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            // Keep content aligned to top to avoid large empty space above welcome image
            justifyContent: 'flex-start',
            alignItems: showWelcomeMessage ? 'center' : 'stretch',
            position: 'relative',
          }}
        >
          {!showWelcomeMessage && languageSupportsVoice && (
            <Tooltip
              title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : (autoPlayAiAudioLocal ? '' : t('audio.aiMuted'))}
              placement="left"
              arrow={false}
            >
              <span>
                <IconButton
                  size="medium"
                  sx={{
                    position: 'sticky',
                    top: 0,
                    right: 0,
                    alignSelf: 'flex-end',
                    p: '6px',
                    zIndex: 5,
                    opacity: isGuestMode ? 0.5 : 1,
                    cursor: isGuestMode ? 'not-allowed' : 'pointer',
                  }}
                  disabled={isGuestMode}
                  onClick={e => {
                    if (!isGuestMode) {
                      setAutoPlayAiAudioLocal(prev => {
                        const newVal = !prev;
                        if (prev && !newVal) {
                          pauseCurrentAudio();
                        }
                        return newVal;
                      });
                      e.currentTarget.blur();
                    }
                  }}
                >
                  {autoPlayAiAudioLocal
                    ? <VolumeUpIcon fontSize="medium" sx={{ color: isGuestMode ? 'grey.500' : 'success.main' }} />
                    : <VolumeOffIcon fontSize="medium" sx={{ color: 'grey.500' }} />}
                </IconButton>
              </span>
            </Tooltip>
          )}
          {showWelcomeMessage ? (
            <WelcomeScreen
              username={username}
              currentUser={currentUser}
              userProfile={userProfile}
              aileenCarolImage={aileenCarolImage}
              persona={aileenCarolPersona}
              onStartTeamChat={onStartTeamChat}
              onGoToEncyclopedia={onGoToEncyclopedia}
              onGoToManageTeam={onGoToManageTeam}
              onShowSpecialistsGrid={onShowSpecialistsGrid}
              onGoToSavedConsultations={onGoToSavedConsultations}
            />
          ) : (
            <List disablePadding>
              {messages.map((m, i) => {
                const shouldPlay = speakQueueLocal.length > 0 && speakQueueLocal[0] === i;
                return (
                  <MessageItem
                    key={m.id || i}
                    message={m}
                    userProfile={userProfile}
                    currentUser={currentUser}
                    isGuestMode={isGuestMode}
                    shouldAutoPlay={shouldPlay}
                    onSpoken={() => setSpeakQueueLocal(q => q.slice(1))}
                  />
                );
              })}
              {isThinking && (
                 <ListItem ref={thinkingIndicatorRef} sx={{ display: 'flex', px: 1, py: 0.5, justifyContent: 'flex-start' }}>
                    <Paper
                       elevation={0}
                       sx={{
                          p: 1,
                          borderRadius: '12px',
                          bgcolor: 'transparent', // Transparent background for both modes
                          border: 'none', // No border needed with transparent background
                       }}
                    >
                       <ThinkingIndicator />
                    </Paper>
                 </ListItem>
              )}
              {!isThinking && <div ref={messagesEndRef} />}
            </List>
          )}
          
          <TextEntryPrompt 
            show={mergedShowTextPrompt} 
            onDismiss={() => mergedSetShowTextPrompt(false)} 
          />
        </Box>
      </Panel>

      {!showWelcomeMessage && (
        <>
          <PanelResizeHandle 
            style={{
              height: '12px',
              cursor: 'ns-resize',
              background: theme.palette.background.paper,
              borderTop: `2px solid ${theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.primary.light}`,
            }}
          > 
          </PanelResizeHandle>
          
          <Panel 
            minSize={15} 
            maxSize={40}
            defaultSize={40} 
            style={{ overflow: 'visible', height: '100%' }}
           > 
            <Box
              sx={{
                p: 2,
                pb: 1,  // Reduced bottom padding
                bgcolor: 'background.paper',
                boxShadow: '0 -2px 5px rgba(0,0,0,0.05)',
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',  // Push content to bottom
                position: 'relative'
              }}
            >
              {/* Auto-listening toggle and Enhanced microphone/pen button – repositioned */}
              <Box sx={{ position: 'absolute', top: 1, right: 8, display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', zIndex: 5 }}>
                {/* Auto-listening ear button - moved closer to mic/pen */}
                <Tooltip 
                  title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : (autoRecordLocal ? t('autoListening.turnOff') : t('autoListening.turnOn'))}
                  placement="top"
                  arrow={false}
                >
                  <span>
                    <IconButton
                      size="medium"
                      sx={{ 
                        p: '6px',
                        color: isGuestMode ? 'grey.500' : (autoRecordLocal ? 'secondary.main' : 'primary.main'),
                        display: 'none',
                        opacity: isGuestMode ? 0.5 : 1,
                        cursor: isGuestMode ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isGuestMode || isTranscribingLocal}
                      onClick={() => {
                      if (autoRecordLocal) {
                        // Set flag to suppress "No speech detected" errors when turning off auto-listening
                        if (mergedSuppressSilenceErrorRef) {
                          mergedSuppressSilenceErrorRef.current = true;
                          // Reset the flag after a short delay
                          setTimeout(() => {
                            if (mergedSuppressSilenceErrorRef) {
                              mergedSuppressSilenceErrorRef.current = false;
                            }
                          }, 1000);
                        }
                        if (isListeningLocal) {
                          handleMicClickLocal();
                        }
                        setAutoRecordLocal(false);
                      } else {
                        setAutoRecordLocal(true);
                        if (!isListeningLocal && !isThinking && isConnected) {
                          setTimeout(() => handleMicClickLocal(), 100);
                        }
                      }
                      }}
                    >
                      <HearingIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Enhanced microphone/pause button - hidden for languages without TTS or STT */}
                {languageSupportsVoice && languageSupportsSpeechToText && (
                  <Tooltip 
                    title={
                      isGuestMode ? t('guest.registrationRequired', 'Registration required') :
                      (isTranscribingLocal ? t('speech.processing') :
                      (isListeningLocal ? t('speech.pauseListening') : t('speech.turnOnListening')))
                    }
                    placement="top"
                    arrow={false}
                  >
                    <span>
                      <IconButton
                        size="medium"
                        sx={{ 
                          p: '6px',
                          position: 'relative',
                          color: isGuestMode ? 'grey.500' : (isTranscribingLocal ? 'grey.500' :
                                (autoRecordLocal ? 
                                  (isListeningLocal ? 'primary.main' : 'grey.500') :
                                  'primary.main')),
                          opacity: isGuestMode ? 0.5 : 1,
                          cursor: isGuestMode ? 'not-allowed' : 'pointer',
                          ...(isTranscribingLocal && {
                            animation: 'pulse 1.5s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%': { opacity: 0.6 },
                              '50%': { opacity: 1 },
                              '100%': { opacity: 0.6 },
                            },
                          }),
                        }}
                        disabled={isGuestMode || isUploading || isTranscribingLocal}
                        onClick={handleMicClickLocal}
                      >
                        {autoRecordLocal ? (
                          <PauseIcon_Recording />
                        ) : (
                          isListeningLocal ? <PauseIcon_Recording /> : <MicIcon sx={{ fontSize: 22 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}

                {/* info button - hidden for languages without STT */}
                {!hideHelpButton && languageSupportsSpeechToText && (
                  <Tooltip title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : t('help.howDoesThisWork')}>
                    <span>
                      <IconButton
                        size="medium"
                        sx={{ 
                          p: '6px', 
                          color: isGuestMode ? 'grey.500' : 'text.secondary',
                          opacity: isGuestMode ? 0.5 : 1,
                          cursor: isGuestMode ? 'not-allowed' : 'pointer',
                        }}
                        disabled={isGuestMode}
                        onClick={(e) => {
                          console.log('ChatAreaUI: Help button click event triggered!', e);
                          handleShowHelp();
                        }}
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>

              {isUploading && (
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CompactThinkingIndicator />
                    <Typography variant="caption">{t('upload.uploading')}</Typography>
                 </Box>
              )}
              {shouldShowAsAlert(recordingError) && (
                 <Alert severity="error" sx={{ mb: 1 }} onClose={() => setRecordingError('')}>
                    {recordingError}
                 </Alert>
              )}
              {uploadError && (
                 <Alert severity="error" sx={{ mb: 1 }} onClose={() => setUploadError('')}>
                    {uploadError}
                 </Alert>
              )}
              
              {/* Quick Action Buttons - Desktop Only */}
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                justifyContent: 'center',
                gap: 1, 
                mb: 0.5,  // Reduced from 1 to 0.5 to cling closer
                px: 0.5
              }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const message = t('quickActions.whatShouldIDo', 'Based on everything we\'ve discussed, what should I do now? Please provide clear, actionable recommendations.');
                    // Send the message directly
                    if (sendMessage) {
                      sendMessage(message, []);
                    }
                  }}
                  disabled={!isConnected || isConnecting || isThinking}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  {t('quickActions.whatToDoButton', 'What should I do?')}
                </Button>
                
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const message = t('quickActions.requestSummary', 'Please provide a comprehensive summary of our conversation so far, including key points discussed, recommendations made, and next steps.');
                    // Send the message directly
                    if (sendMessage) {
                      sendMessage(message, []);
                    }
                  }}
                  disabled={!isConnected || isConnecting || isThinking}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '12px',
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                >
                  {t('quickActions.summaryButton', 'Summary')}
                </Button>
              </Box>
              
              {/* input row */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.5,
                  position: 'relative',
                  mt: 0,  // Removed the 15px margin to cling to bottom
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  multiple
                />
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : t('fileUpload.clickToUpload')}>
                    <span>
                    <IconButton
                      color="primary" 
                      onClick={isGuestMode ? () => setUploadFeaturesDialogOpen(true) : handleUploadClick} 
                      disabled={!isGuestMode && (!isConnected || isConnecting)}
                      size="medium"
                      sx={{
                        p: '6px',
                        opacity: isGuestMode ? 1 : 1,
                        cursor: isGuestMode ? 'pointer' : 'pointer',
                      }} 
                    >
                      <AttachFileIcon fontSize="medium" /> 
                    </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={isGuestMode ? t('guest.registrationRequired', 'Registration required') : t('fileUpload.takePhoto', 'Take Photo')}>
                    <span>
                    <IconButton
                      color="primary" 
                      onClick={isGuestMode ? () => setUploadFeaturesDialogOpen(true) : handleCameraClick} 
                      disabled={!isGuestMode && (!isConnected || isConnecting)}
                      size="medium"
                      sx={{
                        p: '6px',
                        opacity: isGuestMode ? 1 : 1,
                        cursor: isGuestMode ? 'pointer' : 'pointer',
                      }} 
                    >
                      <CameraAltIcon fontSize="medium" /> 
                    </IconButton>
                    </span>
                  </Tooltip>
                </Box>
                 
                <TextField
                  inputRef={inputMessageRef}
                  fullWidth 
                  variant="outlined"
                  size="small" 
                  onFocus={handleTextFieldFocus}
                  placeholder={
                    isListeningLocal && inputMessageLocal.trim() === ''
                      ? t('input.typeOrSpeakPlaceholder')
                      : t('input.typePlaceholder')
                  }
                  value={mergedInputMessage}
                  onChange={mergedHandleInputChange}
                  onKeyPress={handleKeyPressLocal}
                  disabled={!isConnected || isConnecting || isTranscribingLocal}
                  multiline minRows={3} maxRows={10}
                  sx={{
                    flexGrow: 1, 
                    minWidth: 0,  
                    fontSize: '1.35rem', 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px', 
                      padding: '10px 14px', 
                      fontSize: '1.35rem', 
                      bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[50],
                      border: isListeningLocal 
                                ? `2px solid ${theme.palette.primary.main}` 
                                : `1px solid ${theme.palette.divider}`, 
                      position: 'relative',
                      animation: isListeningLocal ? 'pulseBorder 1.8s ease-in-out infinite' : 'none',
                      '@keyframes pulseBorder': {
                        '0%':   { borderColor: theme.palette.primary.main },
                        '50%':  { borderColor: '#9c27b0' },
                        '100%': { borderColor: theme.palette.primary.main },
                      },
                      '&.Mui-focused': {
                        borderWidth: '2px', 
                        borderColor: isListeningLocal ? theme.palette.primary.main : theme.palette.primary.main,
                        boxShadow: isListeningLocal ? `0 0 6px ${theme.palette.primary.light}` : `0 0 0 1px ${theme.palette.primary.main}40`,
                      },
                      '&:hover': {
                        borderColor: isListeningLocal ? theme.palette.primary.main : theme.palette.text.secondary, 
                      },
                      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, 
                    '& .MuiInputBase-inputMultiline': {
                      fontSize: '1.35rem',
                      lineHeight: '1.4',
                    }
                  }}
                  InputProps={{
                    startAdornment: isTranscribingLocal ? (
                      <InputAdornment 
                        position="start" 
                        sx={{ 
                          position: 'absolute', 
                          bottom: '8px', 
                          left: '14px',  
                          zIndex: 1,      
                          pointerEvents: 'none' 
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CompactThinkingIndicator sx={{opacity: 0.7}} />
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', opacity: 0.7 }}>
                            {t('input.transcribing')}
                          </Typography>
                        </Box>
                      </InputAdornment>
                    ) : null,
                  }}
                />
                
                <Tooltip title={isListeningLocal ? t('send.transcribeAndSend') : t('send.sendMessage')}>
                  <span>
                  <IconButton 
                    color={isListeningLocal ? "secondary" : "primary"}
                    onClick={mergedHandleSendClick}
                    disabled={!isConnected || isConnecting || isTranscribingLocal} 
                    size="medium" 
                    sx={{
                      p: '6px',
                      position: 'relative',
                      ...(isListeningLocal && {
                        color: '#9c27b0',
                        '&:hover': {
                          bgcolor: 'rgba(156, 39, 176, 0.1)',
                        }
                      })
                    }}
                  >
                    {isListeningLocal ? (
                      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SendIcon fontSize="large" sx={{ 
                          color: '#9c27b0',
                          transform: isRTL ? 'scaleX(-1)' : 'none'
                        }} />
                        <AutoAwesomeIcon 
                          fontSize="small" 
                          sx={{ 
                            position: 'absolute',
                            top: '-8px',
                            color: theme.palette.mode === 'dark' ? '#ffd700' : 'primary.main',
                            fontSize: '14px'
                          }} 
                        />
                      </Box>
                    ) : (
                      <SendIcon fontSize="large" sx={{ 
                        transform: isRTL ? 'scaleX(-1)' : 'none'
                      }}/>
                    )}
                  </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Panel>
        </>
      )}

      {/* help dialog  --------------------------------------------------- */}
      <Dialog 
        open={helpOpen} 
        onClose={handleHelpOk}
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
        PaperProps={{
          sx: {
            overflow: 'hidden',
            height: '240px',
            display: 'flex',
            flexDirection: 'row',
            padding: 0,
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          }
        }}
      >
        {/* Health Expert Carol's Image - Full Bleed Left Side */}
        <Box
          sx={{
            width: '35%',
            height: '100%',
            backgroundImage: 'url(/persona_images/aileen-carol_high.png)', // Use high quality for background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            flexShrink: 0
          }}
        />
        
        {/* Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}>
          <DialogContent sx={{ 
            p: 3,
            pb: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 'medium', 
              fontSize: '1.2rem',
              mb: 2
            }}>
              {t('help.chatControls')}
            </Typography>
            
            <Box sx={{ fontSize: '0.95rem', lineHeight: 1.4 }}>
              <ul style={{ paddingLeft: 20, margin: 0, listStyle: 'disc' }}>
                <li style={{ marginBottom: '8px' }}>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {t('help.enterToSend')}
                  </Box>
                </li>
                <li>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                    {t('help.shiftEnterToSpeak')}
                  </Box>
                </li>
              </ul>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ 
            justifyContent: 'space-between', 
            p: 3,
            pt: 1
          }}>
            <Button 
              onClick={handleHelpDontShowAgain} 
              variant="text"
              size="small"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem'
              }}
            >
              {tCommon('chat.dontShowAgain')}
            </Button>
            <Button 
              onClick={handleHelpOk} 
              variant="contained"
              size="small"
              sx={{ px: 4 }}
            >
              {tCommon('common.ok')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Health Expert Carol "no speech detected" dialog --------------------------------------------------- */}
      <Dialog 
        open={noSpeechDialogOpen} 
        onClose={handleGotIt}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            overflow: 'hidden',
            height: '300px',
            display: 'flex',
            flexDirection: 'row',
            padding: 0
          }
        }}
      >
        {/* Health Expert Carol's Image - Full Bleed Left Side */}
        <Box
          sx={{
            width: '40%',
            height: '100%',
            backgroundImage: 'url(/persona_images/aileen-carol_high.png)', // Use high quality for background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            flexShrink: 0
          }}
        />
        
        {/* Content Area */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%'
        }}>
          <DialogContent sx={{ 
            textAlign: 'left', 
            p: 3,
            pb: 1,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" sx={{ 
              color: 'primary.main', 
              fontWeight: 'medium', 
              fontSize: '1.2rem',
              mb: 2
            }}>
              {tCommon('chat.noSpeechDetected')}
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: 'text.secondary', 
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}>
              {tCommon('chat.noSpeechMessage')}
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ 
            justifyContent: 'space-between', 
            p: 3,
            pt: 1
          }}>
            <Button 
              onClick={handleDontShowAgain} 
              variant="text"
              size="small"
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.8rem'
              }}
            >
              {tCommon('chat.dontShowAgain')}
            </Button>
            <Button 
              onClick={handleGotIt} 
              variant="contained"
              size="small"
              sx={{ px: 4 }}
            >
              {tCommon('chat.gotIt')}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Upload Features Dialog for Guest Users */}
      <Dialog
        open={uploadFeaturesDialogOpen}
        onClose={() => setUploadFeaturesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('guest.uploadFeatures.title', 'Document & Image Upload Features')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {t('guest.uploadFeatures.description', 'Our platform offers powerful document and image analysis capabilities where you can:')}
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              {t('guest.uploadFeatures.benefit1', 'Upload medical documents, lab reports, and images')}
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              {t('guest.uploadFeatures.benefit2', 'Zoom in on specific areas for detailed analysis')}
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              {t('guest.uploadFeatures.benefit3', 'Have our AI health advisors evaluate and discuss your documents')}
            </Typography>
            <Typography component="li" variant="body2">
              {t('guest.uploadFeatures.benefit4', 'Take photos directly from your camera for immediate consultation')}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {t('guest.uploadFeatures.registeredOnly', 'These special features are available to registered users.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadFeaturesDialogOpen(false)}>
            {t('common:guest.registration.buttons.maybeLater')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/register')}
          >
            {t('common:guest.registration.buttons.registerNow')}
          </Button>
        </DialogActions>
      </Dialog>
    </PanelGroup>
  );
}
