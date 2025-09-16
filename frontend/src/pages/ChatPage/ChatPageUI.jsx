// frontend/src/pages/ChatPage/ChatPageUI.jsx

import React, { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header, { APP_BAR_HEIGHT } from '../../components/layout/Header';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ChatSidebar from '../../components/features/chat/sidebar';
import ChatArea from '../../components/features/chat/ChatArea';
import SpecialistsGrid from '../../components/features/specialists/SpecialistsGrid';
import { useMyAdvisers } from '../../contexts/MyAdvisersContext';
import ChatPageDialogs from './ChatPageDialogs';
import ChatPageMobileUI from './mobile_components/ChatPageMobileUI';
import { ThinkingIndicator } from '../../components/common/ThinkingIndicator';
import { Typography, Paper, Button, Alert, Tooltip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function ChatPageUI(props) {
  const { chatAreaContentMode, currentChatSummary, isSummarizing } = props;
  const {
    isAuthenticated,
    isGuestMode,
    guestSession,
    currentUser,
    navigate,
    mode,
    toggleColorMode,
    conversationId,
    conversationDetails,
    sidebarContentMode,
    sidebarData,
    sidebarIsLoading,
    sidebarError,
    profileData,
    allPersonas,
    actionLoading,
    exitConfirmOpen,
    setExitConfirmOpen,
    onLogout,
    onExitChat,
    onUpdateTitle,
    onSetMode,
    onFetchBio,
    onNewConversation,
    onDeleteConversation,
    onSelectPersona,
    chatPageConversationId,
    onChatPageAction,
    activeImageStack,
    onSetFocusedImage,
    uploadedImagePreviewUrl,
    DEFAULT_SIDEBAR_SIZE_PERCENT = 30,
    MIN_SIDEBAR_SIZE_PERCENT = 20,
    MIN_CHAT_AREA_SIZE_PERCENT = 30,
    // Error handling
    combinedWsError,
    encyclopediaError,
    personaApiError,
    setWsError,
    setEncyclopediaError,
    setPersonaApiError,
    // Dialog props
    moreInfoNeededDialogOpen,
    setMoreInfoNeededDialogOpen,
    showDeleteSuccessDialog,
    setShowDeleteSuccessDialog,
    summaryModalOpen,
    setSummaryModalOpen,
    logoutConfirmOpen,
    setLogoutConfirmOpen,
    shortConvEndDialogOpen,
    setShortConvEndDialogOpen,
    ...restProps
  } = props;
  
  const theme = useTheme();
  const { t } = useTranslation(['chat', 'header']);
  
  // Mobile detection - [following cardinal rule][[memory:32121305648437940]]
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Refs for panel resizing
  const panelGroupRef = useRef(null);
  const sidebarPanelRef = useRef(null);

  // Constants for expanded sidebar
  const EXPANDED_SIDEBAR_SIZE_PERCENT = 40;

  const { myAdvisers = [] } = useMyAdvisers();

  // Persist active conversation id for header use on non-chat pages
  useEffect(() => {
    try {
      const activeId = conversationId || chatPageConversationId || '';
      if (activeId) {
        localStorage.setItem('activeConversationId', activeId);
      }
      // Do NOT clear here on absence; persistence should survive navigation away
    } catch {}
  }, [conversationId, chatPageConversationId]);

  // Function to determine if sidebar should be expanded based on content mode and data
  const shouldExpandSidebar = useCallback(() => {
    // Dr Carol team building modes
    if (sidebarContentMode === 'teamRecommendationQuestionnaire' || 
        sidebarContentMode === 'teamRecommendationResults') {
      return true;
    }

    // Summary mode with actual data (not loading)
    if (sidebarContentMode === 'summary' && sidebarData && !sidebarIsLoading) {
      return true;
    }

    // Differential opinion mode with actual data (not loading)
    if (sidebarContentMode === 'differentialOpinion' && sidebarData && !sidebarIsLoading) {
      return true;
    }

    // Encyclopedia mode with actual response (not just the page or loading)
    if (sidebarContentMode === 'encyclopediaQuery' && 
        props.encyclopediaResponse?.response && 
        !props.encyclopediaLoading) {
      return true;
    }

    return false;
  }, [sidebarContentMode, sidebarData, sidebarIsLoading, props.encyclopediaResponse, props.encyclopediaLoading]);

  // Effect to handle sidebar resizing
  useEffect(() => {
    if (!panelGroupRef.current || !sidebarPanelRef.current) return;

    const expand = shouldExpandSidebar();
    const targetSize = expand ? EXPANDED_SIDEBAR_SIZE_PERCENT : DEFAULT_SIDEBAR_SIZE_PERCENT;
    
    // Get the current size of the sidebar panel
    const currentSize = sidebarPanelRef.current.getSize();
    
    // Only resize if there's a meaningful difference (avoid unnecessary resizing)
    if (Math.abs(currentSize - targetSize) > 2) {
      try {
        sidebarPanelRef.current.resize(targetSize);
      } catch (error) {
        console.warn('Failed to resize sidebar panel:', error);
      }
    }
  }, [shouldExpandSidebar, DEFAULT_SIDEBAR_SIZE_PERCENT, EXPANDED_SIDEBAR_SIZE_PERCENT]);

  // Error handling
  const snackbarError = combinedWsError || sidebarError || props.profileError || encyclopediaError || personaApiError;
  const showSnackbar = Boolean(snackbarError);
  const handleCloseSnackbar = () => {
    if (setWsError) setWsError('');
    if (setSidebarError) setSidebarError('');
    if (props.setProfileError) props.setProfileError('');
    if (setEncyclopediaError) setEncyclopediaError('');
    if (setPersonaApiError) setPersonaApiError('');
  };

  // [Following cardinal rule][[memory:32121305648437940]] - if mobile, use mobile component
  if (isMobile) {
    return <ChatPageMobileUI {...props} isGuestMode={isGuestMode} />;
  }

  // For desktop, render the EXACT existing layout - UNCHANGED
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Header
        isAuthenticated={isAuthenticated}
        isGuestMode={isGuestMode}
        guestSessionActive={isGuestMode}
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
      />
      {/* Spacer to offset the fixed header so content doesn't sit underneath it (desktop path only) */}
      <Box sx={{ height: APP_BAR_HEIGHT, flexShrink: 0 }} />
      
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        <PanelGroup direction="horizontal" style={{ width: '100%', height: '100%' }} ref={panelGroupRef}>
          <Panel 
            ref={sidebarPanelRef}
            defaultSize={DEFAULT_SIDEBAR_SIZE_PERCENT}
            minSize={MIN_SIDEBAR_SIZE_PERCENT}
            style={{ overflow: 'hidden', height: '100%' }}
          >
            <ChatSidebar
              {...restProps}
              conversationId={conversationId}
              conversationDetails={conversationDetails}
              onUpdateTitle={onUpdateTitle}
              contentMode={sidebarContentMode}
              data={sidebarData}
              isLoading={sidebarIsLoading || props.personaApiLoading || props.isCreatingConversation}
              error={sidebarError}
              onSetMode={onSetMode}
              onFetchBio={onFetchBio}
              onNewConversation={onNewConversation}
              currentUser={currentUser}
              allPersonas={allPersonas}
              conversationPersonas={conversationDetails?.personas || []}
              onSelectPersona={onSelectPersona}
              onDeleteConversation={onDeleteConversation}
              isGuestMode={isGuestMode}
              profileData={profileData}
              profileLoading={props.profileLoading}
              profileError={props.profileError}
              onUpdateProfile={props.onUpdateProfile}
              onEncyclopediaQuery={props.onEncyclopediaQuery}
              onEncyclopediaReset={props.onEncyclopediaReset}
              encyclopediaLoading={props.encyclopediaLoading}
              encyclopediaResponse={props.encyclopediaResponse}
              encyclopediaError={encyclopediaError}
              chatAreaContentMode={chatAreaContentMode}
              onGetSummary={props.onGetSummary}
              onGetTranscript={props.onGetTranscript}
              onExitChat={onExitChat}
              actionLoading={actionLoading}
              uploadedImagePreviewUrl={uploadedImagePreviewUrl}
              sendMessage={props.sendMessage}
              activeImageStack={activeImageStack}
              onRefreshConversation={props.onRefreshConversation}
            />
            </Panel>

          <PanelResizeHandle 
            style={{
              width: '12px', 
              cursor: 'ew-resize',
              background: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
              borderLeft: `2px solid ${theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.light}`,
            }}
          />

          <Panel 
            minSize={MIN_CHAT_AREA_SIZE_PERCENT}
            defaultSize={100 - DEFAULT_SIDEBAR_SIZE_PERCENT}
            style={{ overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {props.chatAreaContentMode === 'summaryView' ? (
              <Paper sx={{ p: 3, m: 2, flexGrow: 1, overflowY: 'auto' }}>
                 <Typography variant="h5" gutterBottom>Consultation Summary</Typography>
                 <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                   {isSummarizing ? 'Generating summary...' : (currentChatSummary || 'Summary could not be generated.')}
                 </Typography>
              </Paper>
            ) : chatAreaContentMode === 'specialistsGrid' ? (
              <SpecialistsGrid 
                personas={allPersonas || []} 
                selectedIds={myAdvisers.map(a => a.id)} 
                onPersonaClick={onSelectPersona}
              />
            ) : (
              <>
                {!isAuthenticated && !isGuestMode ? (
                     <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                         <Typography variant="h6" gutterBottom>{t('chat:pleaseLogIn')}</Typography>
                         <Typography paragraph align="center">{t('chat:logInToView')}</Typography>
                         <Button variant="contained" onClick={() => navigate('/login')}>{t('loginPage.signIn')}</Button>
                     </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {conversationId && (
                      <Paper square elevation={1} sx={{ flexShrink: 0, height: 48, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                         <Typography variant="h6" noWrap sx={{flexGrow: 1}}>
                           {conversationDetails?.title === 'New Conversation' ? t('sidebar.newConversation', { ns: 'chat' }) : (conversationDetails?.title || t('sidebar.newConversation', { ns: 'chat' }))}
                         </Typography>
                       </Paper>
                    )}
                            {(conversationId && sidebarIsLoading && !conversationDetails) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}><ThinkingIndicator /></Box>
        ) : (conversationId && sidebarError && !conversationDetails) ? (
                          <Alert severity="error" sx={{ m: 2 }}>{sidebarError}</Alert>
              ) : (
                 <ChatArea 
                  messages={props.messages}
                  sendMessage={props.sendMessage}
                  isConnected={props.isConnected}
                  isConnecting={props.isConnecting}
                  isThinking={props.isThinking}
                  conversationId={conversationId}
                  currentUser={currentUser}
                  userProfile={profileData}
                  allPersonas={allPersonas}
                  isGuestMode={isGuestMode}
                  onStartTeamChat={props.onChatAreaStartTeamChat}
                   onGoToSavedConsultations={() => onSetMode('default')}
                  onGoToEncyclopedia={props.onChatAreaGoToEncyclopedia}
                  onGoToManageTeam={props.onChatAreaGoToManageTeam}
                  onShowSpecialistsGrid={props.onChatAreaShowSpecialistsGrid || props.onShowSpecialistsGrid}
                  onFilesSelected={props.onFilesSelectedForContext}
                />
              )}
            </Box>
                 )}
              </>
            )}
          </Panel>
        </PanelGroup>
      </Box>

      <ChatPageDialogs
        exitConfirmOpen={exitConfirmOpen}
        setExitConfirmOpen={setExitConfirmOpen}
        moreInfoNeededDialogOpen={moreInfoNeededDialogOpen}
        setMoreInfoNeededDialogOpen={setMoreInfoNeededDialogOpen}
        showDeleteSuccessDialog={showDeleteSuccessDialog}
        setShowDeleteSuccessDialog={setShowDeleteSuccessDialog}
        summaryModalOpen={summaryModalOpen}
        setSummaryModalOpen={setSummaryModalOpen}
        logoutConfirmOpen={logoutConfirmOpen}
        setLogoutConfirmOpen={setLogoutConfirmOpen}
        shortConvEndDialogOpen={shortConvEndDialogOpen}
        setShortConvEndDialogOpen={setShortConvEndDialogOpen}
        snackbarError={snackbarError}
        showSnackbar={showSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        {...restProps}
      />
    </Box>
  );
}
