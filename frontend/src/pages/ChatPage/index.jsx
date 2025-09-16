import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, Button, Tooltip, Alert } from '@mui/material';
import { ThinkingIndicator } from '../../components/common/ThinkingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useGuestWebSocket } from '../../hooks/useGuestWebSocket';
import { startGuestSession } from '../../services/guestApi';
import { useThemeContext } from '../../contexts/ThemeContext';
import ChatPageUI from './ChatPageUI';
import { useChatPageInitializer } from './useChatPageInitializer';
import { useNewConversationManager } from './useNewConversationManager';
import { useUserProfile } from './useUserProfile';
import { useEncyclopediaAsync } from './useEncyclopediaAsync';
import { useMyAdvisers } from '../../contexts/MyAdvisersContext';
import { useImageManager } from './useImageManager';
import { useChatDialogs } from './useChatDialogs';
import { useChatActions } from './hooks/useChatActions';
import { ConversationPersistence } from '../../hooks/useConversationPersistence';
import {
  getConversation,
  updateConversationTitle,
  deleteConversationAPI,
  getConversationSummary,
  getAITeamRecommendation
} from '../../services/api';
import { getPersonaDetails, listPersonas } from '../../services/personaI18nService';

const triggerDownload = (content, filename, type = 'text/plain;charset=utf-8;') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ChatPage() {
  const { authToken, loading: authLoading, currentUser, logout, userProfile } = useAuth();
  const isAuthenticated = Boolean(authToken);
  const navigate = useNavigate();
  const location = useLocation();
  const themeContextValue = useThemeContext();
  const { mode, toggleColorMode } = themeContextValue || {};
  
  const { t, i18n } = useTranslation();
  const { conversationId: paramConversationId } = useParams();
  
  // Detect if this is a guest user based on route or session (moved up)
  const isGuestMode = location.pathname.startsWith('/guest-chat') || 
                      location.state?.isGuest;
  
  // Check for saved conversation in URL query params
  const urlParams = new URLSearchParams(location.search);
  const savedConversationId = urlParams.get('conversationId');
  
  // Check for persisted conversation in localStorage
  const persistedConversationId = ConversationPersistence.get();
  
  // Priority: URL param > route param > persisted
  const conversationId = savedConversationId || paramConversationId || persistedConversationId;
  
  // Save conversation to persistence whenever it changes
  useEffect(() => {
    if (conversationId && !isGuestMode) {
      ConversationPersistence.save(conversationId);
      console.log('💾 Saved conversation to persistence:', conversationId);
    }
  }, [conversationId, isGuestMode]);
  
  // Handle navigation to saved/persisted conversation
  useEffect(() => {
    const path = location.pathname;
    
    // Check if we're on the legacy /chat route (redirect to dashboard)
    if (path === '/chat') {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // Check if we're on a legacy /chat/* route and redirect to new structure
    if (path.startsWith('/chat/')) {
      const newPath = path
        .replace('/chat/dashboard', '/dashboard')
        .replace('/chat/consultations', '/consultations')
        .replace('/chat/team', '/team')
        .replace('/chat/encyclopedia', '/encyclopedia')
        .replace(/\/chat\/([a-f0-9-]+)/, '/conversation/$1');
      
      if (newPath !== path) {
        navigate(newPath, { replace: true });
        return;
      }
    }
    
    // No auto-redirect to conversation - let users stay where they navigate
    // Only exception: if they go to a conversation URL without an ID
    if (path === '/conversation' || path === '/conversation/') {
      const conversationToLoad = savedConversationId || persistedConversationId;
      if (conversationToLoad) {
        navigate(`/conversation/${conversationToLoad}`, { replace: true });
        console.log('🔄 Navigating to persisted conversation:', conversationToLoad);
      } else {
        // No conversation to load, go to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [savedConversationId, persistedConversationId, navigate, location.pathname]);
  
  const [guestSession, setGuestSession] = useState(location.state?.guestSession);
  const [guestSessionLoading, setGuestSessionLoading] = useState(false);
  const [guestSessionError, setGuestSessionError] = useState(null);
  const guestDetailsInitialized = useRef(false);
  
  // Redirect to landing page if accessing /guest-chat without proper state
  useEffect(() => {
    if (isGuestMode && !location.state?.selectedTopic && !location.state?.firstMessage && !guestSession) {
      // navigate('/guest-experience', { replace: true }); // LEGACY route commented out
      navigate('/', { replace: true }); // Redirect to landing page instead
    }
  }, [isGuestMode, location.state, guestSession, navigate]);
  
  const {
    profileData,
    profileLoading,
    profileError,
    handleUpdateProfile: managerHandleUpdateProfile,
    setProfileError: managerSetProfileError,
  } = useUserProfile(isGuestMode ? null : authToken);

  const [shouldRefreshConversation, setShouldRefreshConversation] = useState(false);
  
  const handlePersonaAdded = useCallback(() => {
    setShouldRefreshConversation(true);
  }, []);

  // Use appropriate WebSocket based on user type
  const {
    messages,
    isConnected,
    isConnecting,
    isThinking,
    sendMessage,
    error: webSocketConnectionError
  } = isGuestMode && guestSession
    ? useGuestWebSocket(guestSession, handlePersonaAdded, location.state?.firstMessage)
    : useWebSocket(conversationId, authToken, handlePersonaAdded);
    
  // For guest mode, use the guest conversation ID
  const effectiveConversationId = isGuestMode ? 
    (guestSession?.conversation_id || guestSession?.session_id || 'guest-temp') : conversationId;

  // Guest user profile for a 25-year-old woman with anemia and depression
  const guestProfileData = isGuestMode ? {
    email: t('common:guest.user.email'),
    display_name: t('common:guest.user.displayName'),
    full_name: t('common:guest.user.displayName'),
    profile_picture: null, // Will use guest-user_tiny.png
    age: t('common:guest.profile.age'),
    gender: t('common:guest.profile.gender'),
    blood_type: t('common:guest.profile.bloodType'),
    height: t('common:guest.profile.height'),
    weight: t('common:guest.profile.weight'),
    medical_conditions: t('common:guest.profile.conditions'),
    current_medications: t('common:guest.profile.medications'),
    allergies: t('common:guest.profile.allergies'),
    key_health_info: t('common:guest.profile.healthInfo'),
    emergency_contact: t('common:guest.profile.emergencyContact')
  } : profileData;

  const [wsError, setWsError] = useState('');
  // For guest mode with an active session, show activeChatView (participants panel)
  const [sidebarContentMode, setSidebarContentMode] = useState(
    isGuestMode || conversationId ? 'activeChatView' : 'personaList'
  );
  const [sidebarData, setSidebarData] = useState(null);
  const [sidebarIsLoading, setSidebarIsLoading] = useState(!isGuestMode); // Don't start loading for guest mode
  const [sidebarError, setSidebarError] = useState('');
  // Initialize conversation details for guest mode immediately
  const [conversationDetails, setConversationDetails] = useState(() => {
    if (isGuestMode) {
      // Get the consultation title based on the selected topic
      const selectedTopic = location.state?.selectedTopic;
      let consultationTitle = t('chat:guest.consultation', 'Guest Consultation');
      
      if (selectedTopic) {
        // Use the topic title from translations
        consultationTitle = t(`chat:guest.topics.${selectedTopic}.title`, consultationTitle);
      } else if (location.state?.firstMessage) {
        // Try to determine topic from first message
        const firstMsg = location.state.firstMessage;
        if (firstMsg.includes('child')) {
          consultationTitle = t('chat:guest.topics.child.title', 'My child is sick');
        } else if (firstMsg.includes('sleep')) {
          consultationTitle = t('chat:guest.topics.sleep.title', "I can't sleep");
        } else if (firstMsg.includes('nutrition')) {
          consultationTitle = t('chat:guest.topics.nutrition.title', 'Nutrition for vitality');
        }
      }
      
      return {
        id: 'guest-temp',
        title: consultationTitle,
        personas: (() => {
          // Get personas from location state (sleep topic has specific personas)
          const personaIds = location.state?.personas || ['ai_persona_aileen_carol'];
          const personaMap = {
            'ai_persona_aileen_carol': { 
              name: 'VirtualMD.app Clinical Advisor Aileen Carol', 
              specialty: 'Primary Care & Wellness',
              image: '/persona_images/aileen-carol_medium.png' // Medium for cards
            },
            'ai_persona_benjamin_stein': { 
              name: 'AI Psychiatry Specialist Benjamin Stein', 
              specialty: 'Psychiatry',
              image: '/persona_images/benjamin-stein_medium.png' // Medium for cards
            },
            'ai_persona_alice_chen': { 
              name: 'Virtual AI Neurology Advisor Alice Chen', 
              specialty: 'Neurology',
              image: '/persona_images/alice-chen_medium.png' // Medium for cards
            }
          };
          
          return personaIds.map(id => ({
            id,
            persona_id: id,
            name: personaMap[id]?.name || id,
            specialty: personaMap[id]?.specialty || '',
            image: personaMap[id]?.image || `/persona_images/${id.replace('ai_persona_', '').replace(/_/g, '-')}_medium.png`, // Default to medium
            public_bio: ''
          }));
        })(),
        created_at: new Date().toISOString()
      };
    }
    return null;
  });
  const [conversationsList, setConversationsList] = useState([]);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [allPersonas, setAllPersonas] = useState([]);
  const [lastAssistantId, setLastAssistantId] = useState(null);
  const [chatAreaContentMode, setChatAreaContentMode] = useState('activeChat');
  const [lastGeneratedSummary, setLastGeneratedSummary] = useState(null);
  const [summaryCache, setSummaryCache] = useState({});
  const [encyclopediaQuery, setEncyclopediaQuery] = useState('');
  const [userSelectedPersonaId, setUserSelectedPersonaId] = useState(null);

  // Add team recommendation state
  const [isGettingRecommendation, setIsGettingRecommendation] = useState(false);
  const [isApplyingRecommendation, setIsApplyingRecommendation] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);
  const [recommendationError, setRecommendationError] = useState(null);
  const [pendingExitAction, setPendingExitAction] = useState(false);

  // Reset chatAreaContentMode when there's no conversation (non-guest users only)
  useEffect(() => {
    if (!isGuestMode && !conversationId && chatAreaContentMode !== 'specialistsGrid') {
      setChatAreaContentMode('specialistsGrid');
    }
  }, [isGuestMode, conversationId, chatAreaContentMode]);

  // Always call the hook (React rule)
  const myAdvisersData = useMyAdvisers();
  
  // Use dummy data for guest mode
  const { 
    myAdvisers, 
    isLoadingMyAdvisers,
    addAdviserToUserTeam, 
    removeAdviserFromUserTeam,
    saveMyHealthAdvisers
  } = isGuestMode ? {
    myAdvisers: [],
    isLoadingMyAdvisers: false,
    addAdviserToUserTeam: () => {},
    removeAdviserFromUserTeam: () => {},
    saveMyHealthAdvisers: () => Promise.resolve()
  } : myAdvisersData;
  const {
    personaApiLoading,
    personaApiError,
    setPersonaApiError,
    availablePersonasForSelection,
    setAvailablePersonasForSelection,
    selectedPersonaIds,
    setSelectedPersonaIds,
    initialChoice,
    setInitialChoice,
    handleNewConversation: managerHandleNewConversation,
    handleConfirmInitialChoice: managerHandleConfirmInitialChoice,
    handleStartWithSelectedSpecialists: managerHandleStartWithSelectedSpecialists,
    handleStartAileenCarolConversation: managerHandleStartAileenCarolConversation,
    handleSelectSubsetConversation,
    handleSelectSingleSpecialistConversation,
    isSingleSpecialistModeActive,
    startConversationInternal,
    handleStartMyAdviserTeamConversation,
  } = useNewConversationManager({
    authToken,
    setSidebarError,
    setSidebarContentMode,
    setIsCreatingConversation,
    myAdvisers,
    isLoadingMyAdvisers,
  });
  // Using async version for long-running queries
  const {
    encyclopediaResponse,
    encyclopediaLoading,
    encyclopediaError,
    jobStatus,
    currentJobId,
    setEncyclopediaError: managerSetEncyclopediaError,
    handleEncyclopediaQuery: managerHandleEncyclopediaQuery,
    handleEncyclopediaReset: managerHandleEncyclopediaReset,
  } = useEncyclopediaAsync(conversationId);

  const handleSetSidebarMode = (mode) => {
    setSidebarContentMode(mode);
    setSidebarError('');
    if (typeof managerSetProfileError === 'function') managerSetProfileError('');
    if (mode === 'default' || mode === 'personaList') {
      setSidebarData(null);
    }
  };

  const {
    exitConfirmOpen,
    setExitConfirmOpen,
    isExiting,
    isSummarizing,
    moreInfoNeededDialogOpen,
    setMoreInfoNeededDialogOpen,
    logoutConfirmOpen,
    setLogoutConfirmOpen,
    isLoadingLogoutOperation, 
    showDeleteSuccessDialog,
    setShowDeleteSuccessDialog,
    summaryModalOpen,
    setSummaryModalOpen,
    shortConvEndDialogOpen,
    setShortConvEndDialogOpen,
    currentChatSummary,
    setCurrentChatSummary,
    handleLogout,
    handleLogoutAndDeleteConsult,
    handleLogoutAndSaveConsult,
    handleExitChat,
    handleConfirmExitAndSummarize,
    handleConfirmDeleteAndExit,
    handleLeaveWithoutSummarizing,
    handleDeleteConversation,
    willSummarizeOnExit,
  } = useChatDialogs({
    isAuthenticated,
    isGuestMode,
    conversationId,
    messages,
    conversationDetails, setConversationDetails,
    conversationsList, setConversationsList,
    logoutAPIFn: logout,
    deleteConversationAPIFn: deleteConversationAPI,
    getConversationSummaryAPIFn: getConversationSummary,
    updateConversationTitleAPIFn: updateConversationTitle,
    handleSetSidebarMode,
    setSidebarError
  });

  const {
    actionLoading,
    handleGetSummary,
    handleGetTranscript,
    handleGetDifferentialOpinion,
  } = useChatActions({
    messages,
    currentUser,
    profileData,
    conversationId,
    conversationDetails,
    allPersonas,
    lastGeneratedSummary,
    setSidebarError,
    setSidebarIsLoading,
    setSidebarData,
    setSidebarContentMode,
    setMoreInfoNeededDialogOpen,
    setLastGeneratedSummary,
    setSummaryCache,
    setConversationDetails,
    setConversationsList,
  });

  // Trigger exit action if pending
  useEffect(() => {
    if (pendingExitAction && conversationId) {
      setPendingExitAction(false);
      handleExitChat();
    }
  }, [pendingExitAction, conversationId, handleExitChat]);

  const refreshConversationDetails = useCallback(async () => {
    if (conversationId && authToken) {
      setSidebarIsLoading(true);
      try {
        const convData = await getConversation(conversationId);
        setConversationDetails(convData);
      } catch (err) {
        console.error('[ChatPage] Failed to refresh conversation details:', err);
        setSidebarError("Failed to refresh conversation details.");
      } finally {
        setSidebarIsLoading(false);
      }
    }
  }, [conversationId, authToken, setConversationDetails, setSidebarIsLoading, setSidebarError]);

  const handleUpdateTitle = async (id, title) => {
    if (!id || !title) return;
    try {
      const updatedConversation = await updateConversationTitle(id, title);
      setConversationDetails(updatedConversation);
      setConversationsList(prevList => prevList.map(c =>
        c.id === id ? { ...c, title: updatedConversation.title } : c
      ));
    } catch (err) {
      setSidebarError(`Failed to update title: ${err.message}`);
    }
  };

  const handleFetchBio = async (personaId) => {
    if (!personaId) return;
    setSidebarIsLoading(true);
    setSidebarError(''); 
    try {
      const details = await getPersonaDetails(personaId, i18n.language);
      setSidebarData(details);
      setLastAssistantId(personaId);
      // Only switch to bio mode for non-guest users
      if (!isGuestMode && (!conversationId || chatAreaContentMode === 'specialistsGrid') && sidebarContentMode !== 'bio') {
        setSidebarContentMode('bio');
      }
    } catch (err) {
      setSidebarError(`Failed to load details for ${personaId}.`);
      setSidebarData(null);
    } finally {
      setSidebarIsLoading(false);
    }
  };

  const handleReturnToActiveChat = () => {
    setChatAreaContentMode('activeChat');
    if (conversationId) {
      handleSetSidebarMode('activeChatView');
    } else {
      handleSetSidebarMode('default'); 
    }
  };

  const handleHeaderChatAction = useCallback((actionType, targetConversationId) => {
    if (actionType === 'START_NEW_FROM_HEADER') {
      handleStartMyAdviserTeamConversation(); 
    } else if (actionType === 'END_CONSULT_FROM_HEADER' || actionType === 'exit') {
      // If we're not on the conversation page but have a targetConversationId, navigate there first
      if (targetConversationId && !location.pathname.includes(targetConversationId)) {
        setPendingExitAction(true);
        navigate(`/chat/${targetConversationId}`);
      } else {
        handleExitChat(); 
      }
    } else if (actionType === 'RETURN_TO_CONSULT_FROM_HEADER') {
      handleReturnToActiveChat();
    } else if (actionType === 'START_NEW_FROM_SUMMARY_HEADER') {
      if (location.pathname !== '/chat') {
        navigate('/chat', { replace: true });
      }
    }
  }, [handleStartMyAdviserTeamConversation, handleExitChat, handleReturnToActiveChat, navigate, location.pathname]);

  const handleShowSpecialistsGrid = useCallback(() => {
    setChatAreaContentMode('specialistsGrid');
    handleSetSidebarMode('personaList');
  }, [handleSetSidebarMode]);

  // Function to show specialists grid without changing sidebar mode
  const handleShowSpecialistsGridOnly = useCallback(() => {
    setChatAreaContentMode('specialistsGrid');
  }, []);

  // Function to open AI Team Builder
  const handleAITeamBuilder = useCallback(() => {
    setSidebarContentMode('teamRecommendationQuestionnaire');
    setChatAreaContentMode('specialistsGrid');
  }, []);

  const onChatPage = location.pathname.startsWith('/chat');
  let chatActionText = "";
  let chatActionType = null;

  if (onChatPage) { 
    if (!conversationId) { 
      chatActionText = "Start Health Consult";
      chatActionType = 'START_NEW_FROM_HEADER';
    } else if (chatAreaContentMode === 'activeChat') { 
      chatActionText = t('header:endConsult', 'End Consult');
      chatActionType = 'END_CONSULT_FROM_HEADER';
    } else if (chatAreaContentMode === 'summaryView') {
      chatActionText = "Start Health Consult";
      chatActionType = 'START_NEW_FROM_SUMMARY_HEADER';
    } else {
      chatActionText = t('header:returnToConsult', 'Return to Consult');
      chatActionType = 'RETURN_TO_CONSULT_FROM_HEADER';
    }
  }

  // Only use initializer for authenticated users
  if (!isGuestMode) {
    useChatPageInitializer(
      conversationId,
      authToken,
      isAuthenticated,
      authLoading,
      {
        setSidebarIsLoading,
        setSidebarError,
        setSidebarData,
        setConversationDetails,
        setConversationsList,
        setAllPersonas,
        setSidebarContentMode,
        setLastAssistantId,
        setChatAreaContentMode,
        setCurrentChatSummary,
      }
    );
  }
  
  // Load all personas for guest mode
  useEffect(() => {
    if (isGuestMode) {
      const loadAllPersonas = async () => {
        try {
          const allAvailablePersonas = await listPersonas(i18n.language);
          console.log('[ChatPage] Loaded all personas for guest mode:', allAvailablePersonas.length);
          setAllPersonas(allAvailablePersonas);
        } catch (error) {
          console.error('[ChatPage] Failed to load all personas:', error);
        }
      };
      
      loadAllPersonas();
    }
  }, [isGuestMode, i18n.language]);
  
  // Update conversation ID when guest session is available
  useEffect(() => {
    if (isGuestMode && guestSession && conversationDetails && conversationDetails.id === 'guest-temp') {
      const newId = guestSession.conversation_id || guestSession.session_id;
      if (newId && newId !== 'guest-temp') {
        setConversationDetails(prev => ({
          ...prev,
          id: newId
        }));
      }
    }
  }, [isGuestMode, guestSession, conversationDetails?.id]);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if ((lastMessage.role === 'assistant' || lastMessage.sender_type === 'ASSISTANT') && lastMessage.persona_id) {
        const newAssistantId = lastMessage.persona_id;
        if (newAssistantId && newAssistantId !== lastAssistantId) {
            if (!userSelectedPersonaId || userSelectedPersonaId === newAssistantId) {
              setLastAssistantId(newAssistantId);
              // Don't automatically fetch bio for guest mode
              if (!isGuestMode) {
                handleFetchBio(newAssistantId);
              }
            } else {
              setLastAssistantId(newAssistantId);
            }
        }
      }
    }
  }, [messages, lastAssistantId, handleFetchBio, userSelectedPersonaId, isGuestMode]); 

  // Re-fetch bio when language changes
  useEffect(() => {
    if (sidebarContentMode === 'bio' && lastAssistantId) {
      handleFetchBio(lastAssistantId);
    }
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to refresh conversation details when persona is added
  useEffect(() => {
    if (shouldRefreshConversation) {
      refreshConversationDetails();
      setShouldRefreshConversation(false);
    }
  }, [shouldRefreshConversation, refreshConversationDetails]);

  const handleParticipantTileClick = useCallback((personaId) => {
    if (!personaId) return;
    setUserSelectedPersonaId(personaId); 
    handleFetchBio(personaId); 
  }, [handleFetchBio, setUserSelectedPersonaId]);

  // Add team recommendation handlers
  const handleSubmitQuestionnaire = useCallback(async (questionnaireData) => {
    setIsGettingRecommendation(true);
    setRecommendationError(null);
    
    try {
      const personas = await listPersonas(i18n.language);
      // Pass user profile data to AI for additional context
      const response = await getAITeamRecommendation(questionnaireData, personas, profileData);
      
      // Parse the AI response
      let parsedRecommendation;
      // Backend returns response in 'response' field, not 'content'
      const responseText = response.response || response.content;
      if (typeof responseText === 'string') {
        try {
          parsedRecommendation = JSON.parse(responseText);
        } catch (parseError) {
          // If JSON parsing fails, try to extract JSON from the response
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedRecommendation = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Invalid AI response format');
          }
        }
      } else {
        parsedRecommendation = responseText;
      }
      
      setRecommendationData(parsedRecommendation);
      setSidebarContentMode('teamRecommendationResults');
      // Keep showing specialists grid during recommendations
      setChatAreaContentMode('specialistsGrid');
    } catch (error) {
      console.error('Team recommendation error:', error);
      setRecommendationError(error.message || 'Failed to get team recommendations');
    } finally {
      setIsGettingRecommendation(false);
    }
  }, [setSidebarContentMode, profileData]);

  const handleAcceptTeamRecommendation = useCallback(async (teamIds) => {
    setIsApplyingRecommendation(true);
    setRecommendationError(null);
    
    
    // Get current team (excluding Health Expert Carol) for appending logic
    const currentTeamIds = myAdvisers
      .filter(advisor => advisor.id?.toLowerCase() !== 'ai_persona_aileen_carol')
      .map(advisor => advisor.id);
    
    // Combine existing team with new recommendations (append-only logic)
    const combinedTeamIds = [...new Set([...currentTeamIds, ...teamIds])]; // Use Set to avoid duplicates
    
    
    // Check team size limits (Health Expert Carol + specialists)
    const MAX_TEAM_SIZE = 5; // Health Expert Carol + 4 specialists
    const totalAfterCombination = 1 + combinedTeamIds.length; // Health Expert Carol + specialists
    
    if (totalAfterCombination > MAX_TEAM_SIZE) {
      const maxSpecialists = MAX_TEAM_SIZE - 1; // Subtract Health Expert Carol
      setRecommendationError(
        `Cannot add all recommendations. Combined team would have ${combinedTeamIds.length} specialists, but maximum is ${maxSpecialists}. ` +
        `Please remove some current team members first, or try getting fewer recommendations.`
      );
      setIsApplyingRecommendation(false);
      return;
    }
    
    try {
      // Set the combined team (existing + new recommendations)
      await saveMyHealthAdvisers(combinedTeamIds);
      // Navigate to the specialists grid to show the new current team
      setChatAreaContentMode('specialistsGrid');
      setSidebarContentMode('manageTeamView'); // Show current team management instead of recommendations
      setRecommendationData(null);
    } catch (error) {
      console.error('Apply team recommendation error:', error);
      // Handle specific team size errors from the backend
      if (error.message?.includes('Cannot add more than') || error.message?.includes('team is full')) {
        setRecommendationError(
          'Your team is full. Please remove some team members first, then try the AI recommendations again.'
        );
      } else {
        setRecommendationError(error.message || 'Failed to apply team recommendations');
      }
    } finally {
      setIsApplyingRecommendation(false);
    }
  }, [saveMyHealthAdvisers, setChatAreaContentMode, setSidebarContentMode, myAdvisers]);

  const handleSetSidebarModeForImageManager = useCallback((mode) => {
    setSidebarContentMode(mode);
  }, [setSidebarContentMode]);

  const {
    activeImageStack,
    uploadedImagePreviewUrl,
    isProcessingImageAction,
    handleFilesSelectedForContext,
    handlePromoteCropToStack,
    handleClearAllImagesInStack,
    handleToggleImageVisibilityInPanel,
    handleSetFocusedImage,
    handleDeleteImage,
  } = useImageManager(conversationId, sendMessage, setSidebarError, handleSetSidebarModeForImageManager);

  // Initialize guest session if needed
  useEffect(() => {
    if (isGuestMode && !guestSession && !guestSessionLoading) {
      setGuestSessionLoading(true);
      setGuestSessionError(null);
      
      // Use personas from navigation state or default to Health Expert Carol
      const personas = location.state?.personas || ['ai_persona_aileen_carol'];
      // Use translation for fallback message
      const firstMessage = location.state?.firstMessage || 
        t('chat:guest.defaultFirstMessage', "Hello! I'm Health Expert Aileen Carol, your VirtualMD.app Clinical Advisor. How can I help you today?");
      
      console.log('[ChatPage] Guest session init - firstMessage:', firstMessage);
      console.log('[ChatPage] Guest session init - location.state:', location.state);
      
      startGuestSession({
        persona_ids: personas,
        first_message: firstMessage
      })
        .then(response => {
          console.log('[ChatPage] Guest session started:', response);
          setGuestSession(response);
          setGuestSessionLoading(false);
        })
        .catch(err => {
          console.error('[ChatPage] Failed to start guest session:', err);
          setGuestSessionError('Unable to start guest session. Please try again.');
          setGuestSessionLoading(false);
        });
    }
  }, [isGuestMode, guestSession, guestSessionLoading, location.state]);

      // Show loading for auth or guest session initialization
    if ((!isGuestMode && authLoading) || (isGuestMode && guestSessionLoading)) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ThinkingIndicator />
            </Box>
        );
    }

  
  if (typeof ChatPageUI === 'function') {
    return (
      <ChatPageUI
        isAuthenticated={isAuthenticated && !isGuestMode}
        isGuestMode={isGuestMode}
        guestSession={guestSession}
        currentUser={currentUser}
        userProfile={userProfile}
        onLogout={handleLogout}
        navigate={navigate}
        mode={mode}
        toggleColorMode={toggleColorMode}
        messages={messages}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isThinking={isThinking}
        sendMessage={sendMessage}
        combinedWsError={wsError || webSocketConnectionError}
        sidebarError={sidebarError}
        profileError={profileError}
        conversationId={effectiveConversationId}
        conversationDetails={conversationDetails}
        conversationsList={conversationsList}
        sidebarContentMode={sidebarContentMode}
        sidebarData={sidebarData}
        sidebarIsLoading={sidebarIsLoading || isProcessingImageAction}
        onSetMode={handleSetSidebarMode}
        onFetchBio={handleFetchBio}
        onNewConversation={managerHandleNewConversation}
        profileData={guestProfileData}
        profileLoading={profileLoading}
        allPersonas={allPersonas}
        activePersonaId={lastAssistantId}
        actionLoading={actionLoading}
        onGetSummary={handleGetSummary}
        onGetTranscript={handleGetTranscript}
        onGetDifferentialOpinion={handleGetDifferentialOpinion}
        onExitChat={handleExitChat}
        chatAreaContentMode={chatAreaContentMode}
        currentChatSummary={currentChatSummary}
        isSummarizing={isSummarizing}
        encyclopediaQuery={encyclopediaQuery}
        encyclopediaLoading={encyclopediaLoading}
        encyclopediaResponse={encyclopediaResponse}
        encyclopediaError={encyclopediaError}
        onEncyclopediaQuery={managerHandleEncyclopediaQuery}
        onEncyclopediaReset={managerHandleEncyclopediaReset}
        isCreatingConversation={isCreatingConversation}
        personaApiLoading={personaApiLoading}
        personaApiError={personaApiError}
        availablePersonasForSelection={availablePersonasForSelection}
        selectedPersonaIds={selectedPersonaIds}
        initialChoice={initialChoice}
        exitConfirmOpen={exitConfirmOpen}
        setExitConfirmOpen={setExitConfirmOpen}
        isExiting={isExiting}
        willSummarizeOnExit={willSummarizeOnExit}
        moreInfoNeededDialogOpen={moreInfoNeededDialogOpen}
        setMoreInfoNeededDialogOpen={setMoreInfoNeededDialogOpen}
        logoutConfirmOpen={logoutConfirmOpen}
        setLogoutConfirmOpen={setLogoutConfirmOpen}
        isLoadingLogoutOperation={isLoadingLogoutOperation}
        onLogoutAndDeleteConsult={handleLogoutAndDeleteConsult}
        onLogoutAndSaveConsult={handleLogoutAndSaveConsult}
        showDeleteSuccessDialog={showDeleteSuccessDialog}
        setShowDeleteSuccessDialog={setShowDeleteSuccessDialog}
        summaryModalOpen={summaryModalOpen}
        setSummaryModalOpen={setSummaryModalOpen}
        modalSummaryText={currentChatSummary}
        setInitialChoice={setInitialChoice}
        setSelectedPersonaIds={setSelectedPersonaIds}
        setPersonaApiError={setPersonaApiError}
        setAvailablePersonasForSelection={setAvailablePersonasForSelection}
        setSidebarContentMode={setSidebarContentMode}
        setSidebarData={setSidebarData}
        setSidebarError={setSidebarError}
        setProfileError={managerSetProfileError}
        setEncyclopediaError={managerSetEncyclopediaError}
        onDeleteConversation={handleDeleteConversation}
        onConfirmExit={handleConfirmExitAndSummarize}
        onConfirmInitialChoice={managerHandleConfirmInitialChoice}
        onStartWithSelectedSpecialists={managerHandleStartWithSelectedSpecialists}
        onUpdateProfile={managerHandleUpdateProfile}
        onSelectPersona={handleFetchBio}
        onUpdateTitle={handleUpdateTitle}
        onRefreshConversation={refreshConversationDetails}
        handleStartTeamConversation={handleStartMyAdviserTeamConversation}
        handleStartAileenCarolConversation={managerHandleStartAileenCarolConversation}
        handleSelectSubsetConversation={handleSelectSubsetConversation}
        handleSelectSingleSpecialistConversation={handleSelectSingleSpecialistConversation}
        isSingleSpecialistModeActive={isSingleSpecialistModeActive}
        showChatControlButton={onChatPage}
        chatControlButtonText={chatActionText}
        onChatControlButtonClick={() => {
          if (chatActionType) {
            handleHeaderChatAction(chatActionType);
          }
        }}
        addAdviserToUserTeam={addAdviserToUserTeam}
        removeAdviserFromUserTeam={removeAdviserFromUserTeam}
        chatPageConversationId={conversationId}
        onChatPageAction={handleHeaderChatAction}
        onChatAreaStartTeamChat={handleStartMyAdviserTeamConversation}
        onChatAreaConfigureChat={() => handleSetSidebarMode('chatConfigurationView')}
        onChatAreaGoToEncyclopedia={() => handleSetSidebarMode('encyclopediaQuery')}
        onChatAreaGoToManageTeam={() => handleSetSidebarMode('manageTeamView')}
        onParticipantTileClick={handleParticipantTileClick}
        onShowSpecialistsGrid={handleShowSpecialistsGrid}
        onShowSpecialistsGridOnly={handleShowSpecialistsGridOnly}
        onAITeamBuilder={handleAITeamBuilder}
        onChatAreaShowSpecialistsGrid={handleShowSpecialistsGrid}
        onConfirmDeleteAndExit={handleConfirmDeleteAndExit}
        shortConvEndDialogOpen={shortConvEndDialogOpen}
        setShortConvEndDialogOpen={setShortConvEndDialogOpen}
        onLeaveWithoutSummarizing={handleLeaveWithoutSummarizing}
        activeImageStack={activeImageStack}
        uploadedImagePreviewUrl={uploadedImagePreviewUrl}
        onFilesSelectedForContext={handleFilesSelectedForContext}
        onPromoteCropToStack={handlePromoteCropToStack}
        onClearAllImages={handleClearAllImagesInStack}
        onToggleImageVisibility={handleToggleImageVisibilityInPanel}
        onDeleteImage={handleDeleteImage}
        onSetFocusedImage={handleSetFocusedImage}
        onSubmitQuestionnaire={handleSubmitQuestionnaire}
        onAcceptTeamRecommendation={handleAcceptTeamRecommendation}
        isGettingRecommendation={isGettingRecommendation}
        isApplyingRecommendation={isApplyingRecommendation}
        recommendationData={recommendationData}
        recommendationError={recommendationError}
      />
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <p>ChatPage (conversationId: {conversationId || 'None'}) - ChatPageUI not rendered</p>
      <p>Auth Token: {authToken ? 'Present' : 'Absent'}</p>
      <p>isAuthenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>WebSocket Connected: {isConnected ? 'Yes' : 'No'}</p>
      <p>Sidebar Loading: {sidebarIsLoading ? 'Yes' : 'No'}</p>
      <p>Profile Loading: {profileLoading ? 'Yes' : 'No'}</p>
      <p>Conversations Loaded: {conversationsList.length}</p>
      <p>All Personas Loaded: {allPersonas.length}</p>
      <p>Profile Email: {profileData?.email || 'Not loaded'}</p>
      <p>Current Sidebar Mode: {sidebarContentMode}</p>
      <p>Sidebar Data: {sidebarData ? `Persona ID: ${sidebarData.id || sidebarData.persona_id || 'N/A'}` : 'None'}</p>
      <p>Conversation Title: {conversationDetails?.title || 'N/A'}</p>
    </Box>
  );
}