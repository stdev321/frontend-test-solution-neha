import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getConversation,
  listConversations,
} from '../../services/api'; // Assuming API is correctly pathed from here
import {
  listPersonas as listPersonasI18n,
  getPersonaDetails as getPersonaDetailsI18n,
} from '../../services/personaI18nService';

export const useChatPageInitializer = (
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
) => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    // console.log(
    //   `useChatPageInitializer useEffect: Firing. ConvID: ${conversationId}, AuthToken: ${Boolean(
    //     authToken
    //   )}, IsAuth: ${isAuthenticated}, AuthLoading: ${authLoading}`
    // );

    // Reset main panel display when conversation changes or on initial load
    if (isMounted) {
      setChatAreaContentMode('activeChat');
      if (location.state?.source !== 'summaryExit') {
        setCurrentChatSummary(null);
      }
    }

    const fetchInitialData = async () => {
      if (!isMounted) return;
      // console.log('useChatPageInitializer: fetchInitialData started.');
      setSidebarIsLoading(true);
      setSidebarError('');
      setConversationDetails(null);
      setConversationsList([]);
      setAllPersonas([]);

      if (!authToken || !isAuthenticated) {
        if (isMounted) {
          setSidebarIsLoading(false);
          // If not authenticated, show default sidebar view (e.g., empty or login prompt)
          setSidebarContentMode('default'); 
          setSidebarData(null);
        }
        return;
      }

      try {
        // console.log(
        //   'useChatPageInitializer: Fetching core data (convList, initialBio, allPersonas).'
        // );
        const [convList, initialBioData, fetchedPersonas] =
          await Promise.all([
            listConversations().catch((err) => {
              console.error(
                'useChatPageInitializer: Conv list fetch failed:',
                err
              );
              // Don't set error during initial loading - just return empty array
              return [];
            }),
            getPersonaDetailsI18n('ai_persona_aileen_carol', i18n.language).catch((err) => {
              console.error(
                'useChatPageInitializer: AI Aileen Carol bio fetch failed:',
                err
              );
              // Don't set error during initial loading - just return null
              return null;
            }),
            listPersonasI18n(i18n.language).catch((err) => {
              // Fetch ALL personas
              console.error(
                'useChatPageInitializer: All personas fetch failed:',
                err
              );
              // Don't set error during initial loading - just return empty array
              return [];
            }),
          ]);

        if (!isMounted) return;

        setConversationsList(convList || []);
        setAllPersonas(fetchedPersonas || []);

        if (conversationId) {
          // Active conversation present
          setSidebarContentMode('activeChatView'); // SET TO activeChatView FIRST
          try {
            const convData = await getConversation(conversationId);
            if (isMounted) {
              setConversationDetails(convData);
              const lastSpeakerFromConv = convData?.last_assistant_persona_id || (convData?.personas && convData.personas.length > 0 ? convData.personas[0]?.id : null);
              console.log("[ChatPageInitializer] Active Conversation. lastSpeakerFromConv ID:", lastSpeakerFromConv);

              if (lastSpeakerFromConv) {
                try {
                    const personaDetails = await getPersonaDetailsI18n(lastSpeakerFromConv, i18n.language);
                    if (isMounted) {
                        console.log("[ChatPageInitializer] Setting sidebarData for speaker:", lastSpeakerFromConv, personaDetails);
                        setSidebarData(personaDetails);
                        setLastAssistantId(lastSpeakerFromConv);
                    }
                } catch (personaErr) {
                    console.error(`[ChatPageInitializer] Failed to fetch bio for ${lastSpeakerFromConv}, defaulting.`, personaErr);
                    if (isMounted) {
                        // Fallback to AI Health Expert Carol or default if specific persona fails
                        if (initialBioData) { // initialBioData is AI Health Expert Carol's bio from Promise.all
                            console.log("[ChatPageInitializer] Fallback: Setting sidebarData to AI Health Expert Carol (initialBioData)");
                            setSidebarData(initialBioData);
                            setLastAssistantId('ai_persona_aileen_carol');
                        } else {
                            setSidebarData(null);
                        }
                    }
                }
              } else if (initialBioData) {
                console.log("[ChatPageInitializer] Active conv, no specific speaker, using AI Health Expert Carol (initialBioData) for sidebarData.");
                setSidebarData(initialBioData);
                setLastAssistantId('ai_persona_aileen_carol');
              } else {
                // console.log(
                //   'useChatPageInitializer: No specific persona for active conv and no AI Health Expert Carol. Setting sidebar to default.'
                // );
                setSidebarData(null);
              }
            }
          } catch (err) {
            console.error(
              `useChatPageInitializer: Conv details fetch failed for ${conversationId}:`,
              err
            );
            if (isMounted) {
              setSidebarError(
                (prev) => prev || 'Failed to load details for current conversation.'
              );
              setConversationDetails(null); // Ensure details are cleared
              setSidebarData(null); // Fallback to no bio
              setSidebarContentMode('default'); // Fallback to list
            }
          }
        } else {
          // No active conversationId
          setConversationDetails(null);
          setSidebarData(null); 
          setLastAssistantId(null); // Clear last speaker too

          // +++ CHECK FOR PENDING SUMMARY +++
          // This logic can likely be removed if location.state in ChatPage/index.jsx handles modal opening.
          // For now, let's keep it but ensure it doesn't conflict.
          // The useEffect in ChatPage/index.jsx is now responsible for opening the modal based on location.state.
          // So, useChatPageInitializer should just set up the default sidebar if no conversationId.
          // if (pendingSummary && setPendingSummary) { // pendingSummary prop no longer passed here
          //   console.log("[ChatPageInitializer] Pending summary found, displaying in sidebar.", pendingSummary);
          //   setSidebarContentMode('summary');
          //   setSidebarData(pendingSummary);
          //   setPendingSummary(null); // Clear pending summary after displaying
          // } else {
          // Default sidebar mode if no pending summary
          setSidebarContentMode('personaList'); 
          // }
        }
      } catch (err) {
        console.error(
          'useChatPageInitializer: General error during initial data fetch:',
          err
        );
        if (isMounted) {
          setSidebarError('Failed to load initial page data.');
          setSidebarContentMode('default'); // Fallback on general error
          setSidebarData(null);
        }
      } finally {
        if (isMounted) {
          // console.log('useChatPageInitializer: fetchInitialData finished.');
          setSidebarIsLoading(false);
        }
      }
    };

    // Only run fetchInitialData if not in authLoading state.
    // If authLoading is true, it means we are still waiting for authToken to be determined.
    // The effect will re-run when authLoading changes or authToken becomes available.
    if (!authLoading) {
      fetchInitialData();
    } else {
        // If auth is loading, ensure sidebar and profile also show loading appropriately
        if(isMounted){
            setSidebarIsLoading(true);
        }
    }

    return () => {
      isMounted = false;
      // console.log('useChatPageInitializer: Unmounting or deps changed.');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [
    conversationId,
    authToken,
    isAuthenticated, // Added: re-run if authentication status changes
    authLoading,     // Added: re-run when auth loading state finishes
    i18n.language,   // Re-run when language changes to reload personas
    // Pass setters directly to avoid them being part of dependency array if they don't change
    // This is generally safer for effects.
    setAllPersonas, setConversationDetails, setConversationsList, setLastAssistantId, 
    setChatAreaContentMode, setCurrentChatSummary,
    setSidebarContentMode, setSidebarData, setSidebarError, setSidebarIsLoading,
    // pendingSummary, setPendingSummary, // These are no longer passed as direct props
  ]);
}; 