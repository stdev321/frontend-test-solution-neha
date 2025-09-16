import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNewConversationDialogManager = ({
  isAuthenticated,
  createConversationAPIFn, // API function to create a conversation
  listPersonasAPIFn,       // API function to list personas for selection
  setGenericError,         // Optional generic error setter for parent component
}) => {
  const navigate = useNavigate();

  const [initialChoiceDialogOpen, setInitialChoiceDialogOpen] = useState(false);
  const [personaChoiceDialogOpen, setPersonaChoiceDialogOpen] = useState(false);

  const [initialChoice, setInitialChoice] = useState('1'); // '1' for default, '2' for specific
  const [availablePersonasForSelection, setAvailablePersonasForSelection] = useState([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState({});

  const [personaApiLoading, setPersonaApiLoading] = useState(false); // Loading for persona list fetch
  const [personaApiError, setPersonaApiError] = useState('');       // Error for persona list fetch
  const [isCreatingConversation, setIsCreatingConversation] = useState(false); // Loading for conversation creation

  const handleCreateNewConversationInternal = useCallback(async (selectedPersonaIdsArray = ['ai_persona_aileen_carol']) => {
    if (!isAuthenticated) {
      navigate('/login');
      return null;
    }
    setIsCreatingConversation(true);
    setPersonaApiError('');
    try {
      if (!createConversationAPIFn) {
        throw new Error("createConversationAPIFn is not provided");
      }
      const newConv = await createConversationAPIFn(
        `New Conversation - ${new Date().toLocaleTimeString()}`,
        selectedPersonaIdsArray
      );
      navigate(`/chat/${newConv.id}`);
      return newConv;
    } catch (error) {
      console.error("Error creating new conversation:", error);
      const errMsg = 'Failed to start new conversation.';
      setPersonaApiError(errMsg);
      if (setGenericError) setGenericError(errMsg);
      return null;
    } finally {
      setIsCreatingConversation(false);
      setPersonaChoiceDialogOpen(false); 
      setInitialChoiceDialogOpen(false);
    }
  }, [isAuthenticated, navigate, createConversationAPIFn, setGenericError]);

  const handleInitialChoiceSubmit = useCallback(async () => {
    setInitialChoiceDialogOpen(false);
    if (initialChoice === '1') {
      await handleCreateNewConversationInternal(['ai_persona_aileen_carol']);
    } else if (initialChoice === '2') {
      setPersonaApiLoading(true);
      setPersonaApiError('');
      try {
        if (!listPersonasAPIFn) {
          throw new Error("listPersonasAPIFn is not provided");
        }
        const personas = await listPersonasAPIFn(true); // Fetch visible personas
        setAvailablePersonasForSelection(personas || []);
        setSelectedPersonaIds({});
        setPersonaChoiceDialogOpen(true);
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

  const requestNewConversation = useCallback(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setInitialChoice('1'); 
    setPersonaApiError(''); 
    setSelectedPersonaIds({});
    setAvailablePersonasForSelection([]);
    setInitialChoiceDialogOpen(true);
  }, [isAuthenticated, navigate]);

  return {
    // Initial Choice Dialog
    initialChoiceDialogOpen,
    setInitialChoiceDialogOpen, // Exposing setter for direct control if needed
    onCloseInitialChoiceDialog: () => setInitialChoiceDialogOpen(false),
    initialChoice,
    onInitialChoiceChange: (event) => setInitialChoice(event.target.value),
    onConfirmInitialChoice: handleInitialChoiceSubmit,
    
    // Persona Selection Dialog
    personaChoiceDialogOpen,
    setPersonaChoiceDialogOpen, // Exposing setter
    onClosePersonaChoiceDialog: () => setPersonaChoiceDialogOpen(false),
    availablePersonasForSelection,
    selectedPersonaIds,
    onPersonaSelectionChange: handlePersonaSelectionChange,
    onPersonaSelectionSubmit: handleStartWithSelectedSpecialists,
    onPersonaSelectionCancel: () => setPersonaChoiceDialogOpen(false),

    // Shared states for these dialogs
    personaApiLoading,
    personaApiError,  
    isCreatingConversation,

    // Main function to trigger this flow
    requestNewConversation,
  };
}; 