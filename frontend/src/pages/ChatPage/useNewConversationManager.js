import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createConversation,
  listPersonas,
} from '../../services/api'; // Assuming API is correctly pathed

export const useNewConversationManager = ({
  authToken,
  // Setters from the main ChatPage component
  setSidebarError,
  setSidebarContentMode,
  setIsCreatingConversation, // For overall loading state if needed by ChatPage
  // Newly added data from ChatPage (for MyAdvisers team conversation)
  myAdvisers = [],
  isLoadingMyAdvisers = false,
}) => {
  const navigate = useNavigate();

  const [personaApiLoading, setPersonaApiLoading] = useState(false);
  const [personaApiError, setPersonaApiError] = useState('');
  const [availablePersonasForSelection, setAvailablePersonasForSelection] = useState([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState({});
  const [initialChoice, setInitialChoice] = useState('1'); // Default to option 1
  const [isSingleSpecialistModeActive, setIsSingleSpecialistModeActive] = useState(false); // Added state

  const startConversationInternal = useCallback(async (personaIds) => {
    if (!authToken) {
      setSidebarError("Please log in to start a new conversation.");
      return null;
    }
    if (!personaIds || personaIds.length === 0) {
      const errorMsg = 'No personas selected to start the conversation.';
      setSidebarError(errorMsg);
      setPersonaApiError(errorMsg);
      return null;
    }
    setIsCreatingConversation(true);
    setSidebarError('');
    setPersonaApiError('');
    try {
      const newConversation = await createConversation({ persona_ids: personaIds });
      if (newConversation?.id) {
        navigate(`/chat/${newConversation.id}`);
        setSidebarContentMode('activeChatView');
        setIsSingleSpecialistModeActive(false); // Reset on successful conversation start
        return newConversation;
      } else {
        throw new Error('Failed to create conversation or missing ID.');
      }
    } catch (err) {
      console.error('Failed to create new conversation:', err);
      const errorMsg = err.message || 'Could not start a new conversation.';
      setSidebarError(errorMsg);
      setPersonaApiError(errorMsg);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [authToken, navigate, setIsCreatingConversation, setSidebarError, setPersonaApiError, setSidebarContentMode, setIsSingleSpecialistModeActive]);

  const handleNewConversation = useCallback(() => {
    if (!authToken) {
      setSidebarError("Please log in to start a new conversation.");
      return;
    }
    setInitialChoice('1');
    setPersonaApiError('');
    setSelectedPersonaIds({});
    setAvailablePersonasForSelection([]);
    setSidebarError(''); 
    setIsSingleSpecialistModeActive(false); // Reset when starting a new general conversation flow
    setSidebarContentMode('newConversationSetup');
  }, [authToken, setSidebarError, setSidebarContentMode, setInitialChoice, setPersonaApiError, setSelectedPersonaIds, setAvailablePersonasForSelection, setIsSingleSpecialistModeActive]);

  const handleStartTeamConversation = useCallback(async () => {
    if (!authToken) {
      setSidebarError("Please log in to start a new conversation.");
      return;
    }
    setPersonaApiLoading(true);
    setPersonaApiError('');
    setSidebarError('');
    setIsCreatingConversation(true);
    try {
      const personas = await listPersonas(true);
      const allAdviserIds = personas
        .filter(p => p.id !== 'meeting_coordinator' && p.id !== 'note_taker')
        .map(p => p.id);
      if (allAdviserIds.length === 0) {
        await startConversationInternal(['ai_persona_aileen_carol']);
      } else {
        await startConversationInternal(allAdviserIds);
      }
    } catch (err) {
      console.error('useNewConversationManager: Failed to start team conversation:', err);
      const errorMsg = err.message || 'Could not start team conversation.';
      setSidebarError(errorMsg);
      setPersonaApiError(errorMsg);
    } finally {
      setPersonaApiLoading(false);
      setIsCreatingConversation(false);
      setIsSingleSpecialistModeActive(false); // Reset on team conversation attempt
    }
  }, [authToken, startConversationInternal, setPersonaApiLoading, setPersonaApiError, setSidebarError, setIsCreatingConversation, setIsSingleSpecialistModeActive]);

  // New: start a team conversation composed of the user's saved advisers
  const handleStartMyAdviserTeamConversation = useCallback(async () => {
    if (!authToken) {
      setSidebarError("Please log in to start a new conversation.");
      return;
    }
    if (isLoadingMyAdvisers) {
      setSidebarError("Loading your adviser list, please wait...");
      return;
    }

    let personaIdsToStart = [];
    if (Array.isArray(myAdvisers) && myAdvisers.length > 0) {
      const adviserIds = myAdvisers.map((adv) => adv.id);
      personaIdsToStart = Array.from(new Set(['ai_persona_aileen_carol', ...adviserIds]));
    } else {
      personaIdsToStart = ['ai_persona_aileen_carol'];
    }

    if (startConversationInternal) {
      setIsCreatingConversation(true);
      setSidebarError('');
      await startConversationInternal(personaIdsToStart);
    } else {
      setSidebarError("Could not start team chat due to an internal error.");
    }
  }, [authToken, isLoadingMyAdvisers, myAdvisers, startConversationInternal, setIsCreatingConversation, setSidebarError]);

  const handleStartAileenCarolConversation = useCallback(async () => {
    setIsSingleSpecialistModeActive(false); // Reset for Health Expert Carol conversation
    await startConversationInternal(['ai_persona_aileen_carol']);
  }, [startConversationInternal, setIsSingleSpecialistModeActive]);

  const handleSelectSubsetConversation = useCallback(async () => {
    if (!authToken) {
      setSidebarError("Please log in.");
      return;
    }
    setPersonaApiLoading(true);
    setPersonaApiError('');
    setAvailablePersonasForSelection([]);
    setSelectedPersonaIds({});
    setSidebarError('');
    try {
      const personas = await listPersonas(true);
      const specialists = personas.filter(p => p.id !== 'ai_persona_aileen_carol' && p.id !== 'meeting_coordinator' && p.id !== 'note_taker');
      setAvailablePersonasForSelection(specialists);
      if (specialists.length === 0) {
        await startConversationInternal(['ai_persona_aileen_carol']);
        setIsSingleSpecialistModeActive(false); // No specialists, so not in this mode
      } else {
        setSidebarContentMode('selectSpecialists');
        setIsSingleSpecialistModeActive(false); // This is for subset (team), not single specialist
      }
    } catch (err) {
      console.error('Failed to fetch personas for subset selection:', err);
      const errorMsg = err.message || 'Could not fetch specialist list.';
      setSidebarError(errorMsg);
      setPersonaApiError(errorMsg);
    } finally {
      setPersonaApiLoading(false);
    }
  }, [authToken, setPersonaApiLoading, setPersonaApiError, setAvailablePersonasForSelection, setSelectedPersonaIds, setSidebarContentMode, startConversationInternal, setSidebarError, setIsSingleSpecialistModeActive]);

  const handleSelectSingleSpecialistConversation = useCallback(async () => {
    if (!authToken) {
      setSidebarError("Please log in.");
      return;
    }
    setPersonaApiLoading(true);
    setPersonaApiError('');
    setAvailablePersonasForSelection([]);
    setSelectedPersonaIds({}); 
    setSidebarError('');
    try {
      const personas = await listPersonas(true);
      const specialists = personas.filter(p => p.id !== 'ai_persona_aileen_carol' && p.id !== 'meeting_coordinator' && p.id !== 'note_taker');
      setAvailablePersonasForSelection(specialists);
      if (specialists.length === 0) {
        setPersonaApiError('No AI specialists available for a private consult.');
        setSidebarError('No AI specialists available for a private consult. You can talk to AI Health Expert Carol.');
        setIsSingleSpecialistModeActive(false); // No specialists, mode cannot be active
      } else {
        setSidebarContentMode('selectSpecialists'); 
        setIsSingleSpecialistModeActive(true); // Entering single specialist selection mode
      }
    } catch (err) {
      console.error('Failed to fetch personas for single specialist selection:', err);
      const errorMsg = err.message || 'Could not fetch specialist list.';
      setSidebarError(errorMsg);
      setPersonaApiError(errorMsg);
    } finally {
      setPersonaApiLoading(false);
    }
  }, [authToken, setPersonaApiLoading, setPersonaApiError, setAvailablePersonasForSelection, setSelectedPersonaIds, setSidebarContentMode, setSidebarError, setIsSingleSpecialistModeActive]);

  const handleConfirmInitialChoice = useCallback(async () => {
    if (initialChoice === '1') {
      setIsSingleSpecialistModeActive(false);
      await startConversationInternal(['ai_persona_aileen_carol']);
    } else if (initialChoice === '2') {
      setPersonaApiLoading(true);
      setPersonaApiError('');
      setIsSingleSpecialistModeActive(false); // Team conversation, not single specialist
      try {
        const personas = await listPersonas(true);
        const allIds = personas
          .filter(p => p.id !== 'meeting_coordinator' && p.id !== 'note_taker')
          .map(p => p.id);
        if (allIds.length === 0) {
          await startConversationInternal(['ai_persona_aileen_carol']);
        } else {
          await startConversationInternal(allIds);
        }
      } catch (err) {
        console.error('useNewConversationManager: Failed to fetch personas for Choice 2:', err);
        const errorMsg = err.message || 'Could not fetch the list of available personas.';
        setPersonaApiError(errorMsg);
      } finally {
        setPersonaApiLoading(false);
      }
    } else if (initialChoice === '3') {
      await handleSelectSubsetConversation();
    } else if (initialChoice === '4') {
      await handleSelectSingleSpecialistConversation();
    }
  }, [initialChoice, startConversationInternal, setSidebarContentMode, setPersonaApiLoading, setPersonaApiError, setAvailablePersonasForSelection, setSelectedPersonaIds, authToken, handleSelectSubsetConversation, handleSelectSingleSpecialistConversation, setIsSingleSpecialistModeActive]);

  const handleStartWithSelectedSpecialists = useCallback(async () => {
    const selectedIdsArray = Object.keys(selectedPersonaIds).filter(id => selectedPersonaIds[id]);
    if (selectedIdsArray.length === 0) {
        setPersonaApiError("Please select at least one specialist.");
        return;
    }
    let personaIdsToStart = selectedIdsArray; // For single specialist, it's just them
    // If the intention is single specialist + Dr Carol, logic needs adjustment
    // For strict single specialist mode, it would be: await startConversationInternal(selectedIdsArray);
    // Assuming for now, if specialists are selected, it includes Dr Carol implicitly or by design elsewhere.
    // The current behavior in ChatPage seems to be adding Dr Carol if MyAdvisers are involved.
    // This function might need to be clearer on whether it's *only* selected or *plus Dr Carol*.
    // For now, let's assume it starts with the selected, and Dr Carol might be added by higher-level logic if needed.
    // Update: The original code was `['ai_persona_aileen_carol', ...selectedIdsArray]`
    // We need to decide if 'selectSpecialists' mode implies ONLY specialists or specialists + Dr Carol.
    // If it means ONLY the selected specialists for a truly private consult:
    // await startConversationInternal(selectedIdsArray);
    // If it means selected specialists JOINING Dr Carol:
    await startConversationInternal(['ai_persona_aileen_carol', ...selectedIdsArray]);
    
    setSelectedPersonaIds({});
    setIsSingleSpecialistModeActive(false); // Exiting specialist selection mode
  }, [selectedPersonaIds, startConversationInternal, setSelectedPersonaIds, setPersonaApiError, setIsSingleSpecialistModeActive]); // Removed setSidebarContentMode

  return {
    personaApiLoading,
    personaApiError,
    availablePersonasForSelection,
    selectedPersonaIds,
    initialChoice,
    handleNewConversation,
    handleConfirmInitialChoice,
    handleStartWithSelectedSpecialists,
    handleStartTeamConversation,
    handleStartAileenCarolConversation,
    handleSelectSubsetConversation,
    handleSelectSingleSpecialistConversation,
    setInitialChoice,
    setSelectedPersonaIds,
    setPersonaApiError,
    setAvailablePersonasForSelection,
    setSidebarContentMode,
    startConversationInternal,
    isSingleSpecialistModeActive, // Added to return
    handleStartMyAdviserTeamConversation,
  };
}; 