import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  CircularProgress,
  useTheme,
  Avatar,
  IconButton,
  Alert,
  Tooltip,
  Button,
  Fade,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import StopIcon from '@mui/icons-material/Stop';
// New icons for improved UX
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import MailIcon from '@mui/icons-material/Mail';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { uploadFile, getPersonaDetails, speechToText } from '../../../services/api';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import MessageItem from './MessageItem';
import WelcomeScreen from './WelcomeScreen';
import ChatAreaUI from './ChatAreaUI';
import { useTtsQueue } from '../../../hooks/useTtsQueue';
import { useAutoRecord } from '../../../hooks/useAutoRecord';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ChatArea({
  messages = [],
  sendMessage,
  isConnected,
  isConnecting,
  isThinking,
  conversationId,
  currentUser,
  userProfile,
  isGuestMode = false,
  onStartTeamChat,
  onGoToEncyclopedia,
  onGoToManageTeam,
  onShowSpecialistsGrid,
  onGoToSavedConsultations,
  onFilesSelected,
  allPersonas = [],
}) {
  const theme = useTheme();
  const { t } = useTranslation(['chat', 'common']);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showTextPrompt, setShowTextPrompt] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const thinkingIndicatorRef = useRef(null);
  const panelGroupRef = useRef(null);
  const previousConversationId = useRef(conversationId);
  const inputMessageRef = useRef(null);
  const [autoPlayAiAudio, setAutoPlayAiAudio] = useState(false);
  const [longRecBlob, setLongRecBlob] = useState(null);
  const [showLongRecDlg, setShowLongRecDlg] = useState(false);

  // Ref to suppress "No speech detected" errors when turning off auto-listening
  const suppressSilenceErrorRef = useRef(false);

  /* Auto-record + pending-send state now lives in a dedicated hook */
  const {
    autoRecord, setAutoRecord, autoRecordRef,
    pendingSend, setPendingSend, pendingSendRef
  } = useAutoRecord(isThinking, isConnected, /* isListening will be set later */ false, inputMessage);

  const {
    isListening, setIsListening,
    isTranscribing, setIsTranscribing,
    recordingError, setRecordingError,
    startRecording, stopRecording,
  } = useVoiceRecorder({
    setInputMessage,
    currentText: inputMessage,
    suppressSilenceErrorRef,
    onTranscriptionDone: (finalText) => {
      // Handle pending send first
      if (pendingSendRef.current) {
        setPendingSend(false);
        // Combine typed text with transcribed text
        const typedText = inputMessage.trim();
        const combinedText = typedText && finalText 
          ? typedText + ' ' + finalText
          : typedText || finalText || '';
        
        if (combinedText) {
          sendMessage(combinedText, []);
          setInputMessage('');
          setUploadError('');
        }
      }
      // ── Always restore focus after transcription (append or send) ──
      setTimeout(focusInputEnd, 0);
      /* auto-restart mic logic stays unchanged */
    },
    onLongRecording: (blob) => {
      setLongRecBlob(blob);
      setShowLongRecDlg(true);
    },
  });

  // Update inputDisabled to only disable on transcribing, not listening
  const inputDisabled = isTranscribing;

  const [aileenCarolImage, setAileenCarolImage] = useState(null);
  const [aileenCarolPersona, setAileenCarolPersona] = useState(null);
  
  const showWelcomeMessage = !conversationId;
  
  const profileFirstName = userProfile?.display_name?.trim()
    ? userProfile.display_name.trim().split(' ')[0]
    : (userProfile?.full_name?.trim() ? userProfile.full_name.trim().split(' ')[0] : null);

  const authFirstName = currentUser?.full_name?.trim()
    ? currentUser.full_name.trim().split(' ')[0]
    : null;

  const username =
    profileFirstName ||
    authFirstName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    t('common:user.defaultName');

  useEffect(() => {
    if (showWelcomeMessage) {
      // First try to find Aileen Carol in allPersonas
      const aileenFromAllPersonas = allPersonas.find(p => p.id === 'ai_persona_aileen_carol');
      if (aileenFromAllPersonas) {
        setAileenCarolPersona(aileenFromAllPersonas);
        // Extract image from persona
        if (aileenFromAllPersonas.image) {
          let validImageSrc = null;
          if (typeof aileenFromAllPersonas.image === 'string' && aileenFromAllPersonas.image.trim().startsWith('{')) {
            try {
              const imageData = JSON.parse(aileenFromAllPersonas.image);
              if (imageData.light && typeof imageData.light === 'string' && imageData.light.trim() !== '') {
                validImageSrc = imageData.light;
              }
            } catch (e) {
            }
          } else if (typeof aileenFromAllPersonas.image === 'string' && aileenFromAllPersonas.image.trim() !== '') {
            validImageSrc = aileenFromAllPersonas.image;
          }
          setAileenCarolImage(validImageSrc);
        }
      } else {
        // Fallback to API call if not found in allPersonas
        getPersonaDetails('ai_persona_aileen_carol')
          .then(details => {
            setAileenCarolPersona(details);
            if (details?.image) {
              let validImageSrc = null;
              if (typeof details.image === 'string' && details.image.trim().startsWith('{')) {
                try {
                  const imageData = JSON.parse(details.image);
                  if (imageData.light && typeof imageData.light === 'string' && imageData.light.trim() !== '') {
                    validImageSrc = imageData.light;
                  }
                } catch (e) {
                }
              } else if (typeof details.image === 'string' && details.image.trim() !== '') {
                validImageSrc = details.image;
              }
              setAileenCarolImage(validImageSrc); // Set to null if no valid src found, so onError fallback engages
            }
          });
      }
    }
  }, [showWelcomeMessage, allPersonas]);

  useEffect(() => {
    if (isThinking && thinkingIndicatorRef.current) {
      thinkingIndicatorRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  useEffect(() => {
    const panelGroup = panelGroupRef.current;
    if (panelGroup && !showWelcomeMessage) {
      const timerId = setTimeout(() => {
         /* Start 2 % higher ⇒ bottom panel ~35 % */
         panelGroup.setLayout([72, 28]);
      }, 0);
      
      return () => clearTimeout(timerId);
    }
  }, [showWelcomeMessage]);

  useEffect(() => {
    if (conversationId && !previousConversationId.current) {
      setShowTextPrompt(true);
    }
    previousConversationId.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    if (inputMessage.trim()) {
      setShowTextPrompt(false);
    }
  }, [inputMessage]);

  const handleInputChange = e => {
    console.log('[ChatArea] handleInputChange:', e.target.value);
    setInputMessage(e.target.value);
  };
  
  /* ---------- Drag & Drop Support (files anywhere on the bottom panel) ---------- */
  const dropZoneRef = useRef(null);

  useEffect(() => {
    const dz = dropZoneRef.current;
    if (!dz) return;

    const onDragOver = (e) => {
      e.preventDefault();
      dz.style.opacity = 0.8;
    };
    const onDragLeave = () => {
      dz.style.opacity = 1;
    };
    const onDrop = (e) => {
      e.preventDefault();
      dz.style.opacity = 1;
      if (e.dataTransfer?.files?.length && onFilesSelected) {
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    };

    dz.addEventListener('dragover', onDragOver);
    dz.addEventListener('dragleave', onDragLeave);
    dz.addEventListener('drop', onDrop);
    return () => {
      dz.removeEventListener('dragover', onDragOver);
      dz.removeEventListener('dragleave', onDragLeave);
      dz.removeEventListener('drop', onDrop);
    };
  }, [onFilesSelected]);
  
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleMicClick();
    }
  };
  const handleUploadClick = () => fileInputRef.current?.click();
  
  const handleCameraClick = async () => {
    try {
      // Use MediaDevices API for both desktop and mobile
      // This provides a consistent experience across all devices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setUploadError(t('chat:camera.notSupported'));
        return;
      }
      
      // Check if we're on a mobile device to determine which camera to use
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Request camera permission and open camera capture dialog
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isMobile ? { facingMode: 'environment' } : true  // Use back camera on mobile
      });
      
      // Create a video element to show the camera feed
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // Create a canvas to capture the image
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Create a modal/dialog to show the camera feed
      const modal = document.createElement('div');
      modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
      `;
      
      const videoContainer = document.createElement('div');
      videoContainer.style.cssText = `
          position: relative;
          max-width: 90%;
          max-height: 70%;
      `;
      videoContainer.appendChild(video);
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 20px;
      `;
      
      const captureButton = document.createElement('button');
      captureButton.textContent = t('chat:camera.capturePhoto');
      captureButton.style.cssText = `
        padding: 10px 20px;
        font-size: 16px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
      
      const cancelButton = document.createElement('button');
      cancelButton.textContent = t('common:cancel');
      cancelButton.style.cssText = `
        padding: 10px 20px;
        font-size: 16px;
        background: #666;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;
      
      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      
      modal.appendChild(videoContainer);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);
      
      // Handle capture
      captureButton.onclick = () => {
        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to canvas
        context.drawImage(video, 0, 0);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          // Create a File object from the blob
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Send the file
          if (onFilesSelected) {
            onFilesSelected([file]);
          }
          
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        }, 'image/jpeg', 0.95);
      };
      
      // Handle cancel
      cancelButton.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      // Also close on clicking outside
      modal.onclick = (e) => {
        if (e.target === modal) {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        }
      };
    } catch (error) {
      console.error('Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        setUploadError(t('chat:camera.accessDenied'));
      } else {
        setUploadError(t('chat:camera.accessFailed') + ': ' + error.message);
      }
    }
  };
  
  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    if (onFilesSelected) {
      onFilesSelected(Array.from(files)); // Pass the array of files to the parent (ChatPage via useImageManager)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleSend = () => {
    if (!isConnected) return;
    if (inputMessage.trim()) { 
      sendMessage(inputMessage, []); 
      setInputMessage('');
      setUploadError('');
      focusInputEnd();              // ready for next message
    }
  };

  const chatMessagesContainerRef = useRef(null);

  const handleTextFieldFocus = () => {};

  useEffect(() => {

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && chatMessagesContainerRef.current) {
      if (document.activeElement !== fileInputRef.current && /* not focused on text input */ document.activeElement?.tagName !== 'TEXTAREA' ) {
           chatMessagesContainerRef.current.setAttribute('tabindex', '-1'); // Make it focusable
      }
    }
  }, [messages, isThinking]); // Add other relevant dependencies if needed

  /* -------- GLOBAL Drag & Drop (catch anywhere in window) -------- */
  useEffect(() => {
    const onDragOverWindow = (e) => {
      e.preventDefault(); // Prevent browser from opening file
    };
    const onDropWindow = (e) => {
      e.preventDefault();
      if (e.dataTransfer?.files?.length && onFilesSelected) {
        onFilesSelected(Array.from(e.dataTransfer.files));
      }
    };
    window.addEventListener('dragover', onDragOverWindow);
    window.addEventListener('drop', onDropWindow);
    return () => {
      window.removeEventListener('dragover', onDragOverWindow);
      window.removeEventListener('drop', onDropWindow);
    };
  }, [onFilesSelected]);

  /* ---------- Speech auto-play queue ---------- */
  const { speakQueue, setSpeakQueue, clearQueue } = useTtsQueue(
    messages,
    autoPlayAiAudio,
    isThinking
  );

  /* ======================================================================
     RESTORED HANDLERS + AUTO-RECORD SIDE-EFFECTS  (insert right here)
     ==================================================================== */

  /* ---- Mic / Send button handlers ---- */
  const handleMicClick = () => {
    if (isListening) {
      // When manually pausing, turn off auto-listening
      if (autoRecord) {
        setAutoRecord(false);
      }
      setIsListening(false);
      stopRecording();
    } else {
      setIsListening(true);
      startRecording();
    }
  };

  const handleSendClick = () => {
    /* ---------------  CASE 1  — mic ON ---------------- */
    if (isListening) {
      /* Always stop recording and transcribe first, then send combined message */
      setPendingSend(true);     // send after STT
      setIsListening(false);
      stopRecording();
      return;
    }

    /* ---------------  CASE 2  — mic OFF ---------------- */
    clearQueue();               // reset any pending auto-play
    handleSend();               // normal text-only send
  };

  /* ---- Auto-record: start when toggle ON ---- */
  useEffect(() => {
    if (
      autoRecord &&
      !isListening &&
      !isThinking &&
      isConnected &&
      inputMessage.trim() === ''
    ) {
      const t = setTimeout(() => {
        if (autoRecordRef.current) {
          setIsListening(true);
          startRecording();          // start mic, no transcription yet
        }
      }, 100);
      return () => clearTimeout(t);
    }
  }, [autoRecord, isListening, isThinking, isConnected, inputMessage]);

  /* ---- Auto-record: restart after AI finishes speaking ---- */
  useEffect(() => {
    if (
      autoRecord &&
      speakQueue.length === 0 &&
      autoPlayAiAudio &&
      messages.length > 0 &&
      (messages[messages.length - 1]?.sender_type === 'ASSISTANT' ||
       messages[messages.length - 1]?.role === 'assistant') &&
      !isListening &&
      !isThinking &&
      isConnected &&
      inputMessage.trim() === ''
    ) {
      const t = setTimeout(() => {
        if (autoRecordRef.current) {
          handleMicClick();
        }
      }, 500);
      return () => clearTimeout(t);
    }
  }, [
    autoRecord,
    speakQueue.length,
    autoPlayAiAudio,
    messages,
    isListening,
    isThinking,
    isConnected,
    inputMessage,
  ]);

  /* ==================================================================== */

  /* ========== SAFE LOCATION: handlers already exist ========== */
  const audioProps = {
    autoPlayAiAudio,    setAutoPlayAiAudio,
    autoRecord,         setAutoRecord,
    isListening,        setIsListening,
    isTranscribing,     startRecording,   stopRecording,
    speakQueue,         setSpeakQueue,
    handleMicClick,     handleSendClick,
    suppressSilenceErrorRef,
  };

  const uiProps = {
    showTextPrompt,     setShowTextPrompt,
    inputMessage,       handleInputChange,
  };
  /* ============================================================ */

  /* ---------------- Global Enter-to-Send ---------------- */
  const location = useLocation();                   // track current route
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't interfere if user is outside /chat
        if (location.pathname.startsWith('/chat')) {
          // Prevent duplicate send if textarea captured it
          if (e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            handleSendClick();
          }
        }
      } else if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        handleMicClick();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [location.pathname, handleSendClick]);

  /* Pause auto-listen / auto-speak when the tab is hidden */
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        setAutoRecord(false);
        setAutoPlayAiAudio(false);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  /* ---------- helper: focus textarea & place caret at end ---------- */
  const focusInputEnd = () => {
    const el = inputMessageRef.current;
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len); // move caret to end
    }
  };

  const handleLongRecChoice = async (choice) => {
    setShowLongRecDlg(false);
    if (!longRecBlob) return;

    if (choice === 'cancel') {
      setLongRecBlob(null);
      return;
    }

    try {
      setIsTranscribing(true);
      const stt = await speechToText(longRecBlob, 'long_recording.webm');
      if (!stt?.text) return;

      if (choice === 'send') {
        const full = (inputMessage.trim() ? inputMessage.trim() + ' ' : '') + stt.text;
        sendMessage(full, []);
        setInputMessage('');
      } else {                     // 'text' → append only
        setInputMessage(prev => (prev.trim() ? prev + ' ' + stt.text : stt.text));
      }
    } finally {
      setIsTranscribing(false);
      setLongRecBlob(null);
      inputMessageRef.current?.focus();
    }
  };

  return (
    <>
      <ChatAreaUI
        audioProps={audioProps}
        uiProps={uiProps}
        sendMessage={sendMessage}
        panelGroupRef={panelGroupRef}
        showWelcomeMessage={showWelcomeMessage}
        chatMessagesContainerRef={chatMessagesContainerRef}
        username={username}
        aileenCarolImage={aileenCarolImage}
        aileenCarolPersona={aileenCarolPersona}
        onStartTeamChat={onStartTeamChat}
        onGoToEncyclopedia={onGoToEncyclopedia}
        onGoToManageTeam={onGoToManageTeam}
        onShowSpecialistsGrid={onShowSpecialistsGrid}
        onGoToSavedConsultations={onGoToSavedConsultations}
        messages={messages}
        userProfile={userProfile}
        currentUser={currentUser}
        isGuestMode={isGuestMode}
        thinkingIndicatorRef={thinkingIndicatorRef}
        isThinking={isThinking}
        messagesEndRef={messagesEndRef}
        isUploading={isUploading}
        recordingError={recordingError}
        setRecordingError={setRecordingError}
        uploadError={uploadError}
        setUploadError={setUploadError}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        isConnected={isConnected}
        isConnecting={isConnecting}
        handleUploadClick={handleUploadClick}
        handleCameraClick={handleCameraClick}
        inputMessageRef={inputMessageRef}
        handleTextFieldFocus={handleTextFieldFocus}
        inputMessage={inputMessage}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        inputDisabled={inputDisabled}
        handleSendClick={handleSendClick}
        handleMicClick={handleMicClick}
      />
      
      {/* ---------- 30-sec recording dialog ---------- */}
      <Dialog open={showLongRecDlg}>
        <DialogTitle>{t('dialogs.longRecording.title')}</DialogTitle>
        <DialogContent>
          {t('dialogs.longRecording.message')}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleLongRecChoice('cancel')}>{t('dialogs.longRecording.delete')}</Button>
          <Button onClick={() => handleLongRecChoice('text')}>{t('dialogs.longRecording.transcribeToText')}</Button>
          <Button variant="contained" onClick={() => handleLongRecChoice('send')}>
            {t('dialogs.longRecording.transcribeAndSend')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}