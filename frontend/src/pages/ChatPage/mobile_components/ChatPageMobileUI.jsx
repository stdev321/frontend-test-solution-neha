// frontend/src/pages/ChatPage/mobile_components/ChatPageMobileUI.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  useTheme,
  Alert,
  Paper,
  Button,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  Fab,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Checkbox,
  Tooltip
} from '@mui/material';
import { ThinkingIndicator } from '../../../components/common/ThinkingIndicator';
import { ProcessingNotification, CompletionDialog, useLongOperation } from '../../../components/common/LongOperationNotification';
import Header from '../../../components/layout/Header';
import ChatSidebar from '../../../components/features/chat/sidebar';
import SpecialistsGrid from '../../../components/features/specialists/SpecialistsGrid';
import ChatPageDialogs from '../ChatPageDialogs';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { useMyAdvisers } from '../../../contexts/MyAdvisersContext';
import { useConversationPersistence } from '../../../hooks/useConversationPersistence';
import { speechToText } from '../../../services/api';
import ConversationCache from '../../../utils/conversationCache';
import CachedDataDialog from '../../../components/dialogs/CachedDataDialog';

// Import our extracted components
import { MobileMessageItem } from './MobileMessageItem';
import { MobileMessageInput } from './MobileMessageInput';
import MobileProfilePage from './MobileProfilePage';
import MobileAIHelpsBuildTeam from './MobileAIHelpsBuildTeam';
import MobileChatWelcomeScreen from './MobileChatWelcomeScreen';
import MobileConsultationsList from './MobileConsultationsList';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import MobileChatInterface from './MobileChatInterface';
import MobileContentRouter from './MobileContentRouter';
import MobileBottomNavigation from './MobileBottomNavigation';

// Icons - Fix the imports
import ChatIcon from '@mui/icons-material/Chat';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description'; // Use this for transcript
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EncyclopediaPanel from '../../../components/features/chat/sidebar/EncyclopediaPanel';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Clock icon
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Magic diamonds
import ScheduleIcon from '@mui/icons-material/Schedule'; // Round timepiece

export default function ChatPageMobileUI(props) {
  const {
    // Core props - keeping all the important ones
    isAuthenticated,
    currentUser,
    userProfile,
    navigate,
    mode,
    toggleColorMode,
    messages,
    sendMessage,
    isConnected,
    isThinking,
    conversationId,
    conversationDetails,
    conversationsList,
    sidebarContentMode,
    sidebarData,
    sidebarIsLoading,
    sidebarError,
    profileData,
    allPersonas,
    chatAreaContentMode,
    currentChatSummary,
    isSummarizing,
    onLogout,
    onExitChat,
    onGetSummary,
    onGetDifferentialOpinion,
    onGetTranscript,
    onEncyclopediaQuery,
    onEncyclopediaReset,
    encyclopediaResponse,
    encyclopediaLoading,
    onSetMode,
    chatPageConversationId,
    onChatPageAction,
    activeImageStack,
    onSetFocusedImage,
    uploadedImagePreviewUrl,
    onChatAreaStartTeamChat,
    combinedWsError,
    encyclopediaError,
    personaApiError,
    onSelectPersona,
    isGuestMode,
    ...restProps
  } = props;

  const theme = useTheme();
  const { myAdvisers = [] } = useMyAdvisers();
  const fileInputRef = useRef(null);
  
  // conversationsList available here with items
  
  // Use conversation persistence hook
  const { clearSavedConversation } = useConversationPersistence(conversationId);
  
  // Get current view from URL path with new structure
  const location = useLocation();
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/consultations' || path.includes('/consultations')) return 'consultations';
    if (path === '/team' || path.includes('/team')) return 'team';
    if (path === '/encyclopedia' || path.includes('/encyclopedia')) return 'encyclopedia';
    if (path.includes('/transcript')) return 'transcript';
    if (path.includes('/summary')) return 'summary';
    if (path.includes('/differential-opinion')) return 'differentialOpinion';
    if (path.startsWith('/conversation/')) return 'chat';
    // Legacy support
    if (path.startsWith('/chat/')) return 'chat';
    return 'chat';
  };
  
  const currentMobileView = getCurrentView();
  
  // Mobile state - simplified!
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileInputMessage, setMobileInputMessage] = useState('');
  const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
  const [showCacheDialog, setShowCacheDialog] = useState({
    open: false,
    type: null,
    timestamp: null,
    cachedData: null
  });
  
  // Log navigation handler mount
  useEffect(() => {
    console.log('🔧 [MOUNT] ChatPageMobileUI mounted');
    console.log('🔧 [MOUNT] navigate function available:', typeof navigate);
    console.log('🔧 [MOUNT] Current URL:', window.location.pathname);
    return () => {
      console.log('🔧 [UNMOUNT] ChatPageMobileUI unmounting');
    };
  }, []);
  
  // Long operation management for Summary/Differential Opinion
  const {
    operation: longOperation,
    startOperation,
    completeOperation,
    failOperation,
    resetOperation
  } = useLongOperation();

  // State changes tracked
  
  // Watch for Summary/Differential Opinion completion
  useEffect(() => {
    // Check if we're waiting for a summary and it has arrived
    if (longOperation.status === 'processing' && longOperation.type === 'summary') {
      if (sidebarContentMode === 'summary' && sidebarData && !sidebarIsLoading) {
        // Summary is ready
        completeOperation(sidebarData);
      } else if (sidebarError) {
        // Error occurred
        failOperation(sidebarError);
      }
    }
    
    // Check if we're waiting for a differential opinion and it has arrived
    if (longOperation.status === 'processing' && longOperation.type === 'differentialOpinion') {
      if (sidebarContentMode === 'differentialOpinion' && sidebarData && !sidebarIsLoading) {
        // Differential opinion is ready
        completeOperation(sidebarData);
      } else if (sidebarError) {
        // Error occurred
        failOperation(sidebarError);
      }
    }
  }, [sidebarContentMode, sidebarData, sidebarIsLoading, sidebarError, longOperation.status, longOperation.type, completeOperation, failOperation]);

  // Routing logic handled by MobileContentRouter

  // Removed problematic auto-reset to chat mode - was preventing navigation

  // Voice recording with real transcription functionality
  const {
    isListening,
    isTranscribing,
    recordingError,
    toggleListening: originalToggleListening
  } = useVoiceRecorder({
    setInputMessage: setMobileInputMessage,
    currentText: mobileInputMessage,
    onTranscriptionDone: (transcribedText) => {
      console.log('Transcription completed:', transcribedText);
    },
    onLongRecording: (audioBlob) => {
      console.log('Long recording detected, handling separately');
    },
    suppressSilenceErrorRef: useRef(false)
  });

  // Handlers
  const handleMobileSendMessage = (immediateMessage = null) => {
    if (isListening) {
      // Magic send - stop recording and send directly
      originalToggleListening();
    } else {
      // Use immediate message if provided, otherwise use input state
      const messageToSend = immediateMessage || mobileInputMessage.trim();
      if (messageToSend) {
        sendMessage(messageToSend);
        setMobileInputMessage('');
      }
    }
  };

  const handleMobileBottomNavChange = (event, newValue) => {
    // Handle bottom nav changes with URL navigation
    handleNavigateToView(newValue);
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerEnabled(!isSpeakerEnabled);
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    console.log('Mobile camera file selected:', files);
    if (files.length > 0 && props.onFilesSelectedForContext) {
      console.log('Sending files to chat:', files);
      props.onFilesSelectedForContext(files);
    } else if (!props.onFilesSelectedForContext) {
      console.error('onFilesSelectedForContext not provided in props');
    }
    setMobileDrawerOpen(false);
  };

  // Unified navigation handler - all URL-based now!
  const handleNavigateToView = (viewMode) => {
    console.log('🚀 [NAV HANDLER] handleNavigateToView called with:', viewMode);
    console.log('🚀 [NAV HANDLER] Current URL:', window.location.pathname);
    console.log('🚀 [NAV HANDLER] navigate function type:', typeof navigate);
    console.log('🚀 [NAV HANDLER] Is navigate defined?', navigate !== undefined);
    
    // Force close drawer immediately
    setMobileDrawerOpen(false);
    
    // External routes
    const externalRoutes = {
      'profile': '/profile', 
      'health-advisory': '/health-advisory',
      'about-us': '/about-us',
      'founders-note': '/founders-note',
      'faq': '/faq',
      'contact': '/contact',
      'legal': '/legal',
      'data-privacy': '/data-privacy-whitepaper',
      'research': '/research',
      'ai-accuracy': '/research/ai-accuracy',
      'encyclopedia-about': '/about-VirtualMD-health-encyclopedia'
    };
    
    if (externalRoutes[viewMode]) {
      const targetRoute = externalRoutes[viewMode];
      
      console.log('🚀 [NAV HANDLER] External route detected, navigating to:', targetRoute);
      console.log('🚀 [NAV HANDLER] About to call navigate with:', targetRoute);
      
      // For health-advisory, use hard navigation to ensure clean transition
      if (viewMode === 'health-advisory') {
        console.log('🚀 [NAV HANDLER] Using hard navigation for health-advisory');
        window.location.href = targetRoute;
        return;
      }
      
      try {
        navigate(targetRoute);
        console.log('✅ [NAV HANDLER] navigate() called successfully');
      } catch (error) {
        console.error('❌ [NAV HANDLER] navigate() threw error:', error);
      }
      
      // Check after a short delay if navigation happened
      setTimeout(() => {
        const newPath = window.location.pathname;
        if (newPath === targetRoute) {
          console.log('✅ [NAV HANDLER] Navigation successful! Now at:', newPath);
        } else {
          console.log('❌ [NAV HANDLER] Navigation FAILED! Still at:', newPath);
          console.log('❌ [NAV HANDLER] Expected to be at:', targetRoute);
        }
      }, 100);
      
      return;
    }
    
    // Handle navigation with new clean routes
    switch (viewMode) {
      case 'dashboard':
        console.log('🚀 [NAV HANDLER] Dashboard clicked - going to /dashboard');
        navigate('/dashboard');
        break;
        
      case 'chat':
        // Return to active chat
        navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard');
        onSetMode('activeChatView');
        break;
        
      case 'consultations':
        navigate('/consultations');
        break;
        
      case 'team':
        navigate('/team');
        onSetMode('activeChatView');
        break;
        
      case 'encyclopedia':
        navigate('/encyclopedia');
        onSetMode('encyclopediaQuery');
        break;
        
      case 'transcript':
        if (conversationId) {
          navigate(`/conversation/${conversationId}/transcript`);
          
          // Check cache first
          const cachedTranscript = ConversationCache.get(conversationId, 'transcript');
          if (cachedTranscript) {
            // Transcript is instant, just use cached version
            props.setSidebarData(cachedTranscript.content);
            props.setSidebarContentMode('transcript');
          } else if (onGetTranscript) {
            onGetTranscript();
          }
        }
        break;
        
      case 'summary':
        if (conversationId) {
          navigate(`/conversation/${conversationId}/summary`);
          
          // Check cache first
          const cachedSummary = ConversationCache.get(conversationId, 'summary');
          if (cachedSummary) {
            setShowCacheDialog({
              open: true,
              type: 'summary',
              timestamp: cachedSummary.timestamp,
              cachedData: cachedSummary.content
            });
          } else {
            // No cache, generate new
            startOperation('summary');
            onGetSummary();
          }
        }
        break;
        
      case 'differentialOpinion':
        if (conversationId) {
          navigate(`/conversation/${conversationId}/differential-opinion`);
          
          // Check cache first
          const cachedDifferentialOpinion = ConversationCache.get(conversationId, 'differentialOpinion');
          if (cachedDifferentialOpinion) {
            setShowCacheDialog({
              open: true,
              type: 'differentialOpinion',
              timestamp: cachedDifferentialOpinion.timestamp,
              cachedData: cachedDifferentialOpinion.content
            });
          } else {
            // No cache, generate new
            startOperation('differentialOpinion');
            onGetDifferentialOpinion();
          }
        }
        break;
        
      default:
        navigate('/dashboard');
    }
  };

  const handleReturnToChat = () => {
    navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard');
    onSetMode('activeChatView');
  };

  // Handle dialog choices for cached data
  const handleViewCached = () => {
    const { type, cachedData } = showCacheDialog;
    
    // Handle different data formats based on type
    if (type === 'summary') {
      // Summary expects a string
      const summaryData = typeof cachedData === 'string' ? cachedData : cachedData?.summary || cachedData;
      props.setSidebarData(summaryData);
    } else if (type === 'differentialOpinion') {
      // Differential opinion expects an object with content property
      const differentialOpinionData = cachedData?.content ? cachedData : { type: 'differentialOpinion', content: cachedData };
      props.setSidebarData(differentialOpinionData);
    } else {
      props.setSidebarData(cachedData);
    }
    
    props.setSidebarContentMode(type);
    setShowCacheDialog({ open: false, type: null, timestamp: null, cachedData: null });
  };

  const handleGenerateNew = () => {
    const { type } = showCacheDialog;
    if (type === 'summary') {
      startOperation('summary');
      onGetSummary();
    } else if (type === 'differentialOpinion') {
      startOperation('differentialOpinion');
      onGetDifferentialOpinion();
    }
    setShowCacheDialog({ open: false, type: null, timestamp: null, cachedData: null });
  };

  // Mobile content renderer - simplified
  const renderMobileMainContent = () => (
    <MobileContentRouter
      conversationId={conversationId}
      conversationDetails={conversationDetails}
      conversationsList={conversationsList}
      messages={messages}
      isThinking={isThinking}
      sidebarIsLoading={sidebarIsLoading}
      sidebarError={sidebarError}
      chatAreaContentMode={chatAreaContentMode}
      currentChatSummary={currentChatSummary}
      isSummarizing={isSummarizing}
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      profileData={profileData}
      navigate={navigate}
      onLogout={onLogout}
      sidebarContentMode={sidebarContentMode}
      sidebarData={sidebarData}
      allPersonas={allPersonas}
      myAdvisers={myAdvisers}
      onChatAreaStartTeamChat={onChatAreaStartTeamChat}
      onExitChat={() => {
        navigate('/dashboard');  // Navigate to dashboard
        clearSavedConversation();  // Clear the saved conversation when user explicitly exits
        onExitChat();  // Call the original exit function
      }}
      onNavigateToView={handleNavigateToView}
      onSetMode={onSetMode}
      sendMessage={sendMessage}
      onSelectPersona={onSelectPersona}
      onGetSummary={onGetSummary}
      onGetTranscript={onGetTranscript}
      mobileInputMessage={mobileInputMessage}
      setMobileInputMessage={setMobileInputMessage}
      onSendMessage={handleMobileSendMessage}
      isSpeakerEnabled={isSpeakerEnabled}
      onDrawerToggle={handleMobileDrawerToggle}
      props={props}
      restProps={restProps}
      activeImageStack={activeImageStack}
      handleReturnToChat={handleReturnToChat}
      onEncyclopediaQuery={onEncyclopediaQuery}
      encyclopediaError={encyclopediaError}
      encyclopediaResponse={encyclopediaResponse}
      encyclopediaLoading={encyclopediaLoading}
      onEncyclopediaReset={onEncyclopediaReset}
      isGuestMode={isGuestMode}
    />
  );

  // Enhanced drawer with simplified navigation
  const renderMobileDrawer = () => {
    console.log('🎨 [RENDER] Rendering MobileNavigationDrawer');
    console.log('🎨 [RENDER] Passing handleNavigateToView:', typeof handleNavigateToView);
    return (
      <MobileNavigationDrawer
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        onOpen={handleMobileDrawerToggle}
        conversationId={conversationId}
        onExitChat={onExitChat}
        onNavigateToView={handleNavigateToView}
        isSpeakerEnabled={isSpeakerEnabled}
        onSpeakerToggle={handleSpeakerToggle}
        onCameraClick={handleCameraClick}
        sidebarProps={restProps}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        userProfile={userProfile}
        onLogout={onLogout}
        mode={mode}
        toggleColorMode={toggleColorMode}
        currentMobileView={currentMobileView}
      />
    );
  };

  // Error handling
  const snackbarError = combinedWsError || sidebarError || props.profileError || encyclopediaError || personaApiError;
  const showSnackbar = Boolean(snackbarError);
  const handleCloseSnackbar = () => {
    // Error handling logic
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />
      {/* Header with slide animation */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          transform: mobileDrawerOpen ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 1300, // Higher than drawer
        }}
      >
        <Header
          isAuthenticated={isAuthenticated}
          user={currentUser}
          onLogout={onLogout}
          showLandingButtons={false}
          mode={mode}
          toggleColorMode={toggleColorMode}
          chatPageConversationId={chatPageConversationId}
          onChatPageAction={onChatPageAction}
          activeImageStack={activeImageStack}
          onSelectImageThumbnail={onSetFocusedImage}
          uploadedImagePreviewUrl={uploadedImagePreviewUrl}
          isMobile={true}
          onMobileDrawerToggle={!isGuestMode ? handleMobileDrawerToggle : null}
        />
      </Box>
      
      {/* Removed floating guest close button; the X in the fixed title bar is the single close control on mobile */}
      
      {/* Mobile main content area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        // Header is fixed; reserve its space with paddingTop instead of subtracting from height
        // Height adapts to browser chrome/keyboard with 100dvh fallback
        height: conversationId
          ? 'calc(100vh - env(safe-area-inset-bottom))'
          : 'calc(100vh - 56px - env(safe-area-inset-bottom))', // reserve for bottom nav on non-conversation screens
        '@supports (height: 100dvh)': {
          height: conversationId
            ? 'calc(100dvh - env(safe-area-inset-bottom))'
            : 'calc(100dvh - 56px - env(safe-area-inset-bottom))',
        },
        // Push content below the fixed header (64px) + safe-area-top
        pt: 'calc(64px + env(safe-area-inset-top))',
        position: 'relative'
      }}>
        {renderMobileMainContent()}
      </Box>

      {/* Enhanced mobile message input - only show during chat */}
      {conversationId && currentMobileView === 'chat' && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1200,
            borderRadius: 0,
            pb: 'max(env(safe-area-inset-bottom), 0px)', // keep above iOS home indicator
          }}
        >
          <MobileMessageInput
            value={mobileInputMessage}
            onChange={(e) => setMobileInputMessage(e.target.value)}
            onSend={handleMobileSendMessage}
            isConnected={isConnected}
            isThinking={isThinking}
            isGuestMode={isGuestMode}
            onFileUpload={() => console.log('File upload')}
            onImageUpload={handleCameraClick}
            voiceRecorderProps={{
              isListening,
              isTranscribing,
              recordingError,
              toggleListening: originalToggleListening
            }}
          />
        </Paper>
      )}

      {/* Mobile bottom navigation */}
      <MobileBottomNavigation
        conversationId={conversationId}
        onChange={handleMobileBottomNavChange}
        onChatAreaStartTeamChat={onChatAreaStartTeamChat}
      />

      {/* Enhanced mobile drawer with navigation */}
      {!isGuestMode && renderMobileDrawer()}

      {/* Dialogs - with better mobile positioning */}
      <ChatPageDialogs
        {...restProps}
        moreInfoNeededDialogOpen={false} // Suppress on mobile
        summaryModalOpen={false} // Suppress on mobile  
        snackbarError={snackbarError}
        showSnackbar={showSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        // Add mobile-specific dialog positioning
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: '80vh',
            maxWidth: '90vw',
            width: 'auto'
          }
        }}
      />
      
      {/* Long Operation Notifications (Summary/Differential Opinion) */}
      <ProcessingNotification
        type={longOperation.type}
        open={longOperation.status === 'processing'}
        onClose={null} // Don't allow manual closing during processing
      />
      
      <CompletionDialog
        type={longOperation.type}
        open={longOperation.status === 'complete' || longOperation.status === 'error'}
        error={longOperation.status === 'error' ? longOperation.error : null}
        onViewNow={() => {
          // Navigate to the appropriate view
          const viewPath = longOperation.type === 'differentialOpinion' ? 'differential-opinion' : longOperation.type;
          navigate(conversationId ? `/conversation/${conversationId}/${viewPath}` : `/dashboard`);
          resetOperation();
        }}
        onContinue={() => {
          // Stay in chat
          resetOperation();
          // Optionally show a badge or indicator that results are available
        }}
      />

      {/* Cache Dialog for Summary/Differential Opinion */}
      <CachedDataDialog
        open={showCacheDialog.open}
        onClose={() => setShowCacheDialog({ open: false, type: null, timestamp: null, cachedData: null })}
        type={showCacheDialog.type}
        timestamp={showCacheDialog.timestamp}
        onViewCached={handleViewCached}
        onGenerateNew={handleGenerateNew}
      />
    </Box>
  );
}