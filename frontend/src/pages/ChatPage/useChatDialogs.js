import { useState, useCallback, useEffect } from 'react';
import { createSummaryJob, getSummaryJob } from '../../services/api';
import { ConversationPersistence } from '../../hooks/useConversationPersistence';
import { useLocation, useNavigate } from 'react-router-dom';

// Helper function (can be moved to a shared util if used elsewhere)
const getDisplayImageInsideHook = (personaImageProperty, themeMode = 'light') => {
  if (!personaImageProperty) return null;
  let imageUrl = null;
  if (typeof personaImageProperty === 'string') {
    if (personaImageProperty.startsWith('{') || personaImageProperty.startsWith('[')) {
      try {
        const imageData = JSON.parse(personaImageProperty);
        imageUrl = themeMode === 'dark' ? (imageData.dark || imageData.light) : (imageData.light || personaImageProperty);
      } catch (e) {
        imageUrl = personaImageProperty;
      }
    } else {
      imageUrl = personaImageProperty;
    }
  } else if (typeof personaImageProperty === 'object' && personaImageProperty !== null) {
    imageUrl = themeMode === 'dark' ? (personaImageProperty.dark || personaImageProperty.light) : personaImageProperty.light;
  }
  return imageUrl;
};

const WORD_COUNT_THRESHOLD = 50;

const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export const useChatDialogs = ({
  isAuthenticated,
  isGuestMode,
  conversationId, // Current conversation ID, used for summary on exit
  allPersonas,    // Full list of personas, used by handleCreateNewConversation
  mode,           // Theme mode, used by getDisplayImage
  createConversationAPIFn,
  listConversationsAPIFn, // For re-augmenting list after creation (though navigation might handle this)
  listPersonasAPIFn,
  getConversationSummaryAPIFn,
  setMainPanelDisplayMode, // To show summary in main panel
  setMainPanelSummary,     // To set summary content
  setGenericError, // A function to set a generic error message displayed elsewhere
  // --- New props for extended functionality ---
  messages, 
  conversationDetails, 
  setConversationDetails, 
  conversationsList, 
  setConversationsList, 
  logoutAPIFn, 
  deleteConversationAPIFn, 
  updateConversationTitleAPIFn, 
  handleSetSidebarMode, 
  setSidebarError,
  // --- End of new props ---
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [initialChoiceDialogOpen, setInitialChoiceDialogOpen] = useState(false);
  const [personaChoiceDialogOpen, setPersonaChoiceDialogOpen] = useState(false);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [initialChoice, setInitialChoice] = useState('1'); // '1' for default, '2' for specific
  const [availablePersonasForSelection, setAvailablePersonasForSelection] = useState([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState({});

  const [personaApiLoading, setPersonaApiLoading] = useState(false); // Loading for persona list fetch in dialogs
  const [personaApiError, setPersonaApiError] = useState(''); // Error specific to dialog API calls

  const [isExiting, setIsExiting] = useState(false); // Loading for summary generation on exit
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [willSummarizeOnExit, setWillSummarizeOnExit] = useState(true); // Added missing state

  // --- States moved from ChatPage/index.jsx ---
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [willSummarizeOnLogout, setWillSummarizeOnLogout] = useState(true);
  const [isLoadingLogoutOperation, setIsLoadingLogoutOperation] = useState(false);
  const [moreInfoNeededDialogOpen, setMoreInfoNeededDialogOpen] = useState(false);
  const [showDeleteSuccessDialog, setShowDeleteSuccessDialog] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [shortConvEndDialogOpen, setShortConvEndDialogOpen] = useState(false);
  const [currentChatSummary, setCurrentChatSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false); // Moved from ChatPage/index.jsx
  // --- End of states moved from ChatPage/index.jsx ---

  // --- Logout Logic (Moved from ChatPage/index.jsx) ---
  const _performLogout = useCallback(async () => {
    console.log('useChatDialogs: _performLogout called, logoutAPIFn:', logoutAPIFn);
    setIsLoadingLogoutOperation(true);
    try {
      if (logoutAPIFn) {
        console.log('useChatDialogs: Calling logoutAPIFn...');
        await logoutAPIFn();
        console.log('useChatDialogs: logoutAPIFn completed successfully');
      } else {
        console.log('useChatDialogs: No logoutAPIFn provided');
      }
      console.log('useChatDialogs: Navigating to home page...');
      navigate('/');
    } catch (e) {
      console.error('useChatDialogs: Logout error:', e);
      if (setSidebarError) setSidebarError("Logout failed. Please try again.");
    } finally {
      setIsLoadingLogoutOperation(false);
      console.log('useChatDialogs: _performLogout completed');
    }
  }, [logoutAPIFn, navigate, setIsLoadingLogoutOperation, setSidebarError]);

  const handleLogout = useCallback(async () => {
    console.log('useChatDialogs: handleLogout called, conversationId:', conversationId);
    if (conversationId) {
      console.log('useChatDialogs: Setting up logout confirmation dialog...');
      setWillSummarizeOnLogout(true); 
      setLogoutConfirmOpen(true);
      console.log('useChatDialogs: Logout confirmation dialog should be opening');
    } else {
      console.log('useChatDialogs: No conversationId, performing direct logout...');
      await _performLogout();
    }
  }, [conversationId, _performLogout, setLogoutConfirmOpen, setWillSummarizeOnLogout]);

  const handleLogoutAndDeleteConsult = useCallback(async () => {
    setLogoutConfirmOpen(false);
    if (!conversationId) {
      await _performLogout();
      return;
    }
    setIsLoadingLogoutOperation(true);
    try {
      if (deleteConversationAPIFn) await deleteConversationAPIFn(conversationId);
    } catch (err) {
      if (setSidebarError) setSidebarError("Failed to delete consultation. Please try again before logging out, or logout directly.");
    }
    await _performLogout();
  }, [conversationId, _performLogout, deleteConversationAPIFn, setIsLoadingLogoutOperation, setLogoutConfirmOpen, setSidebarError]);

  const handleLogoutAndSaveConsult = useCallback(async () => {
    setLogoutConfirmOpen(false);
    if (!conversationId) {
      await _performLogout();
      return;
    }
    setIsLoadingLogoutOperation(true);
    try {
      // Use async summary job + polling to avoid long-running sync calls that can 504 in production
      const { job_id } = await createSummaryJob(conversationId);
      let delayMs = 1500;
      const maxDelay = 10000;
      const maxTimeMs = 10 * 60 * 1000; // 10 minutes
      const start = Date.now();
      while (true) {
        const job = await getSummaryJob(job_id);
        if (job.status === 'completed') {
          break;
        }
        if (job.status === 'failed') {
          throw new Error(job.error_message || 'Summary generation failed');
        }
        if (Date.now() - start > maxTimeMs) {
          throw new Error('Summary is taking longer than expected. Please try again later.');
        }
        await new Promise(r => setTimeout(r, delayMs));
        delayMs = Math.min(maxDelay, Math.round(delayMs * 1.4));
      }
    } catch (err) {
      if (setSidebarError) setSidebarError("Summary could not be generated. Logging out anyway.");
    }
    await _performLogout();
  }, [conversationId, _performLogout, getConversationSummaryAPIFn, setIsLoadingLogoutOperation, setLogoutConfirmOpen, setSidebarError]);
  // --- End of Logout Logic ---

  // --- Delete Conversation Logic (Moved from ChatPage/index.jsx, needed by exit flows) ---
  const handleDeleteConversation = useCallback(async (idToDelete) => {
    // This function assumes 'conversationId' prop might be different from 'idToDelete'
    // if called from a list, but for exit flows, idToDelete will be the current conversationId.
    if (!idToDelete) return;
    try {
      if (deleteConversationAPIFn) await deleteConversationAPIFn(idToDelete);
      if (setConversationsList) {
        setConversationsList(prevList => prevList.filter(c => c.id !== idToDelete));
      }
      // Navigation after delete is tricky: if deleting current, navigate away.
      // If deleting from a list, stay put. This hook might not be the best place for all nav logic
      // unless it's specifically for exit scenarios.
      if (location.pathname.includes(idToDelete)) { // If current active chat is deleted
        navigate('/chat', { replace: true });
      }
      setShowDeleteSuccessDialog(true); // Show success, even if navigating
    } catch (err) {
      if (setSidebarError) setSidebarError(`Failed to delete conversation: ${err.message || 'Unknown error'}`);
      throw err; // Re-throw for the caller to potentially handle finally blocks
    }
  }, [deleteConversationAPIFn, setConversationsList, navigate, location, setSidebarError, setShowDeleteSuccessDialog]);
  // --- End of Delete Conversation Logic ---

  // --- Exit Logic (Moved and adapted from ChatPage/index.jsx) ---
  const handleExitChat = useCallback(async () => {
    console.log('[useChatDialogs] handleExitChat called with conversationId:', conversationId, 'isGuestMode:', isGuestMode);
    
    // For guest mode, navigate to landing page immediately
    if (isGuestMode) {
      console.log('[useChatDialogs] Guest mode detected - navigating to landing page');
      navigate('/', { replace: true });
      return;
    }
    
    if (!conversationId) {
      console.log('[useChatDialogs] handleExitChat early return - no conversationId');
      return;
    }

    // Compute total user words in the conversation
    let totalUserWords = 0;
    if (Array.isArray(messages) && messages.length > 0) {
      totalUserWords = messages
        .filter(m => (m.role === 'user' || m.sender_type === 'USER'))
        .reduce((acc, msg) => acc + countWords(msg.content), 0);
    }

    // 1) SPECIAL CASE: brand-new, UNSAVED conversation that is tiny – delete silently
    if (!conversationDetails && totalUserWords < WORD_COUNT_THRESHOLD) {
      try {
        if (deleteConversationAPIFn) await deleteConversationAPIFn(conversationId);
        if (setConversationsList) {
          setConversationsList(prevList => prevList.filter(c => c.id !== conversationId));
        }
      } catch (err) {
        if (setSidebarError) setSidebarError('Failed to delete short new conversation on exit.');
      }
      if (isGuestMode) {
        navigate('/', { replace: true });
      } else {
        // Clear the active conversation from localStorage and persistence for short conversations
        localStorage.removeItem('activeConversationId');
        ConversationPersistence.clear();
        navigate('/chat', { state: { showShortEndDialog: true }, replace: true });
      }
      return;
    }

    // 2) For every other case, decide which dialog variant to show based on word count
    const isShortConversation = totalUserWords < WORD_COUNT_THRESHOLD;
    setWillSummarizeOnExit(!isShortConversation); // false => short dialog, true => full dialog
    console.log('[useChatDialogs] willSummarizeOnExit set to', !isShortConversation);
    setIsExiting(false);
    setExitConfirmOpen(true);
  }, [
    conversationId,
    isGuestMode,
    conversationDetails,
    messages,
    deleteConversationAPIFn,
    setConversationsList,
    navigate,
    setSidebarError,
    setWillSummarizeOnExit,
    setExitConfirmOpen,
    setIsExiting,
  ]);

  // This replaces/merges the original handleConfirmExit and ChatPage/index.jsx's handleConfirmExitAndSummarize
  const handleConfirmExitAndSummarize = useCallback(async () => {
    if (!exitConfirmOpen || !conversationId) {
      setExitConfirmOpen(false); // Ensure dialog is closed if somehow called inappropriately
      return;
    }

    if (willSummarizeOnExit) {
      const totalUserWords = messages
        .filter(m => (m.role === 'user' || m.sender_type === 'USER'))
        .reduce((acc, msg) => acc + countWords(msg.content), 0);
      if (totalUserWords < WORD_COUNT_THRESHOLD && !conversationDetails?.summary_text) { // Also check if a summary already exists
        setExitConfirmOpen(false);
        setMoreInfoNeededDialogOpen(true);
        return;
      }

      setIsSummarizing(true);
      let summarySuccessfullyFetched = false;
      let fetchedSummaryText = null;

      try {
        // Use async job + polling to avoid long-running synchronous requests that can 504
        const { job_id } = await createSummaryJob(conversationId);
        let delayMs = 1500;
        const maxDelay = 10000;
        const maxTimeMs = 10 * 60 * 1000; // 10 minutes
        const start = Date.now();
        let finalTitle = conversationDetails?.title;
        while (true) {
          const job = await getSummaryJob(job_id);
          if (job.status === 'completed') {
            fetchedSummaryText = job.summary_text;
            finalTitle = job.final_title || finalTitle;
            summarySuccessfullyFetched = true;
            break;
          }
          if (job.status === 'failed') {
            throw new Error(job.error_message || 'Summary generation failed');
          }
          if (Date.now() - start > maxTimeMs) {
            throw new Error('Summary is taking longer than expected. Please try again later.');
          }
          await new Promise(r => setTimeout(r, delayMs));
          delayMs = Math.min(maxDelay, Math.round(delayMs * 1.4));
        }

        if (fetchedSummaryText) {
          setCurrentChatSummary(fetchedSummaryText); // For the modal
          if (finalTitle && conversationDetails?.title !== finalTitle) {
            if (setConversationDetails) {
              setConversationDetails(prev => prev ? { ...prev, title: finalTitle } : null);
            }
            if (setConversationsList) {
              setConversationsList(prevList => prevList.map(c =>
                c.id === conversationId ? { ...c, title: finalTitle } : c
              ));
            }
          }
        } else {
          fetchedSummaryText = 'Summary could not be generated for this conversation.';
          setCurrentChatSummary(fetchedSummaryText);
          if (setSidebarError) setSidebarError('Summary could not be generated.');
        }
      } catch (err) {
        fetchedSummaryText = `Failed to generate summary: ${err.message}`;
        setCurrentChatSummary(fetchedSummaryText);
        if (setSidebarError) setSidebarError(`Failed to generate summary: ${err.message}`);
      } finally {
        setIsSummarizing(false);
        setExitConfirmOpen(false);
      }

      if (summarySuccessfullyFetched) {
        // For guest mode, go to landing page instead of chat page
        if (isGuestMode) {
          navigate('/', { replace: true });
        } else {
          // Clear the active conversation from localStorage and persistence when exiting
          localStorage.removeItem('activeConversationId');
          ConversationPersistence.clear();
          navigate('/chat', { state: { pendingModalSummary: fetchedSummaryText, openSummaryModal: true, source: 'summaryExit' }, replace: true });
        }
      } else {
        // If summary failed but we were supposed to summarize, what to do? Navigate appropriately.
        if (isGuestMode) {
          navigate('/', { replace: true });
        } else {
          if (handleSetSidebarMode) handleSetSidebarMode('personaList');
          if (location.pathname !== '/chat') {
              navigate('/chat', { replace: true });
          }
        }
      }
    } else {
      // This case implies willSummarizeOnExit was false (e.g., user chose "Exit Without Summary")
      setExitConfirmOpen(false);
      setIsExiting(true); // Indicate an exit operation is in progress
      try {
        if (isGuestMode) {
          navigate('/', { replace: true });
        } else {
          if (handleSetSidebarMode) handleSetSidebarMode('personaList');
          // Clear the active conversation from localStorage and persistence when exiting
          localStorage.removeItem('activeConversationId');
          ConversationPersistence.clear();
          if (location.pathname.includes(conversationId || '---')) { 
            navigate('/chat', { replace: true });
          } else if (location.pathname !== '/chat') { 
            navigate('/chat', { replace: true });
          }
        }
      } catch (err) {
        if (setSidebarError) setSidebarError("Failed to leave conversation. Please try again.");
      } finally {
        setIsExiting(false);
      }
    }
  }, [
    exitConfirmOpen, 
    conversationId, 
    willSummarizeOnExit, 
    messages, 
    conversationDetails,
    getConversationSummaryAPIFn, 
    setCurrentChatSummary, 
    setConversationDetails, 
    setConversationsList, 
    updateConversationTitleAPIFn, 
    setSidebarError, 
    navigate, 
    setIsSummarizing, 
    setExitConfirmOpen, 
    setMoreInfoNeededDialogOpen, 
    handleSetSidebarMode, 
    location.pathname,
    isGuestMode
  ]);

  const handleConfirmDeleteAndExit = useCallback(async () => {
    if (!conversationId) return;
    setExitConfirmOpen(false);
    setIsExiting(true); // Use general isExiting, or a specific one like isDeleting
    try {
      await handleDeleteConversation(conversationId);
      // handleDeleteConversation now handles navigation to /chat if current conv is deleted
      // and sets setShowDeleteSuccessDialog
    } catch (err) {
      // Error is already set by handleDeleteConversation, or we can set a more generic one here
      if (setSidebarError) setSidebarError("Failed to delete conversation on exit. Please try again.");
    } finally {
      setIsExiting(false);
    }
  }, [conversationId, handleDeleteConversation, setExitConfirmOpen, setIsExiting, setSidebarError]);

  const handleLeaveWithoutSummarizing = useCallback(async () => {
    setExitConfirmOpen(false);
    setIsExiting(true);
    try {
      if (handleSetSidebarMode) handleSetSidebarMode('personaList');
      // Clear the active conversation from localStorage and persistence when leaving without summary
      localStorage.removeItem('activeConversationId');
      ConversationPersistence.clear();
      if (location.pathname.includes(conversationId || '---')) { // if on an active chat page
        navigate('/chat', { replace: true });
      } else if (location.pathname !== '/chat') { // if on some other page but not /chat already
        navigate('/chat', { replace: true });
      } // else already on /chat, no navigation needed
    } catch (err) {
      if (setSidebarError) setSidebarError("Failed to leave conversation. Please try again.");
    } finally {
      setIsExiting(false);
    }
  }, [conversationId, location.pathname, navigate, handleSetSidebarMode, setExitConfirmOpen, setIsExiting, setSidebarError]);
  // --- End of Exit Logic ---

  // --- useEffects for Dialog Management (Moved from ChatPage/index.jsx) ---
  useEffect(() => {
    if (location.pathname === '/chat' && location.state?.openSummaryModal && location.state?.pendingModalSummary) {
      const summaryTextFromNavState = location.state.pendingModalSummary;
      setCurrentChatSummary(summaryTextFromNavState);
      const timerId = setTimeout(() => {
        setSummaryModalOpen(true);
        navigate(location.pathname, { replace: true, state: {} });
      }, 0);
      return () => clearTimeout(timerId);
    } else {
      if (location.state?.openSummaryModal && !location.state?.pendingModalSummary && summaryModalOpen) {
        setSummaryModalOpen(false);
      }
    }

    if (location.pathname === '/chat' && location.state?.showShortEndDialog) {
      setShortConvEndDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate, summaryModalOpen, setCurrentChatSummary, setSummaryModalOpen, setShortConvEndDialogOpen]); // Added summaryModalOpen and setters to dep array

  useEffect(() => {
    if (!shortConvEndDialogOpen) return;
    const timer = setTimeout(() => {
      setShortConvEndDialogOpen(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [shortConvEndDialogOpen]);

  useEffect(() => {
    if (location.pathname !== '/chat' && showDeleteSuccessDialog) {
      setShowDeleteSuccessDialog(false);
    }
  }, [location.pathname, showDeleteSuccessDialog]);
  // --- End of useEffects for Dialog Management ---

  const handleCreateNewConversationInternal = useCallback(async (selectedPersonaIdsArray = ['ai_persona_aileen_carol']) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }
    setIsCreatingConversation(true);
    setPersonaApiError('');
    try {
      const newConv = await createConversationAPIFn(
        `New Conversation - ${new Date().toLocaleTimeString()}`,
        selectedPersonaIdsArray
      );
      // The ChatPage/index.jsx useEffect for conversationId change should handle fetching
      // and updating conversation list and details. We just navigate.
      navigate(`/chat/${newConv.id}`);
      return newConv;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      setPersonaApiError('Failed to start new conversation.');
      if (setGenericError) setGenericError('Failed to start new conversation.');
      return null;
    } finally {
      setIsCreatingConversation(false);
      setPersonaChoiceDialogOpen(false); // Close dialog if open
      setInitialChoiceDialogOpen(false); // Close dialog if open
    }
  }, [isAuthenticated, navigate, createConversationAPIFn, setGenericError]);

  const handleInitialChoiceSubmit = useCallback(async () => {
    setInitialChoiceDialogOpen(false); // Close this dialog first
    if (initialChoice === '1') {
      await handleCreateNewConversationInternal(['ai_persona_aileen_carol']);
    } else if (initialChoice === '2') {
      setPersonaApiLoading(true);
      setPersonaApiError('');
      try {
        const personas = await listPersonasAPIFn(true); // Fetch visible personas
        setAvailablePersonasForSelection(personas || []);
        setSelectedPersonaIds({}); // Reset selections
        setPersonaChoiceDialogOpen(true); // Open the next dialog
      } catch (err) {
        const errorMsg = 'Could not load AI specialist list for selection.';
        setPersonaApiError(errorMsg);
        if (setGenericError) setGenericError(errorMsg);
      } finally {
        setPersonaApiLoading(false);
      }
    }
  }, [initialChoice, handleCreateNewConversationInternal, listPersonasAPIFn, setGenericError]);

  const handlePersonaSelectionChange = useCallback((personaId) => {
    setSelectedPersonaIds(prev => ({
      ...prev,
      [personaId]: !prev[personaId]
    }));
  }, []);

  const handleStartWithSelectedSpecialists = useCallback(async () => {
    const finalSelectedIds = Object.entries(selectedPersonaIds)
      .filter(([, isSelected]) => isSelected)
      .map(([id]) => id);

    if (finalSelectedIds.length > 0) {
      await handleCreateNewConversationInternal(finalSelectedIds);
    }
    // Dialogs are closed by handleCreateNewConversationInternal
  }, [selectedPersonaIds, handleCreateNewConversationInternal]);

  const handleNewConversationRequest = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setInitialChoice('1'); // Reset to default
    setPersonaApiError(''); // Clear previous dialog errors
    setSelectedPersonaIds({});
    setAvailablePersonasForSelection([]);
    setInitialChoiceDialogOpen(true);
  }, [isAuthenticated, navigate]);

  return {
    // Initial Choice Dialog
    initialChoiceDialogOpen,
    onCloseInitialChoiceDialog: () => setInitialChoiceDialogOpen(false),
    initialChoice,
    onInitialChoiceChange: (event) => setInitialChoice(event.target.value),
    onConfirmInitialChoice: handleInitialChoiceSubmit,
    
    // Persona Selection Dialog
    personaChoiceDialogOpen,
    onClosePersonaChoiceDialog: () => setPersonaChoiceDialogOpen(false), // For cancel
    availablePersonasForSelection,
    selectedPersonaIds,
    onPersonaSelectionChange: handlePersonaSelectionChange,
    onPersonaSelectionSubmit: handleStartWithSelectedSpecialists,
    onPersonaSelectionCancel: () => setPersonaChoiceDialogOpen(false),


    // Exit Confirmation Dialog
    exitConfirmOpen,
    onCloseExitConfirm: () => setExitConfirmOpen(false),
    isExiting,
    onConfirmExit: handleConfirmExitAndSummarize,

    // Shared states for dialogs
    personaApiLoading, // Loading for listPersonas call
    personaApiError,   // Error from listPersonas call or createConversation

    // Function to trigger new conversation flow
    requestNewConversation: handleNewConversationRequest,
    isCreatingConversation, // Loading state for the actual conversation creation API call

    // --- States and setters moved from ChatPage/index.jsx ---
    logoutConfirmOpen,
    setLogoutConfirmOpen,
    willSummarizeOnLogout,
    willSummarizeOnExit,
    setWillSummarizeOnExit,
    setWillSummarizeOnLogout,
    isLoadingLogoutOperation,
    setIsLoadingLogoutOperation,
    moreInfoNeededDialogOpen,
    setMoreInfoNeededDialogOpen,
    showDeleteSuccessDialog,
    setShowDeleteSuccessDialog,
    summaryModalOpen,
    setSummaryModalOpen,
    shortConvEndDialogOpen,
    setShortConvEndDialogOpen,
    currentChatSummary,
    setCurrentChatSummary,
    isSummarizing, // Added state
    // --- Logout Handlers ---
    handleLogout,
    handleLogoutAndDeleteConsult,
    handleLogoutAndSaveConsult,
    // --- Exit Handlers ---
    handleExitChat, // Replaces original simple version
    handleConfirmExitAndSummarize, // Replaces original handleConfirmExit
    handleConfirmDeleteAndExit,
    handleLeaveWithoutSummarizing,
    handleDeleteConversation, // Also exposed if needed directly, though mainly internal to exit flows
    setExitConfirmOpen,
  };
};
