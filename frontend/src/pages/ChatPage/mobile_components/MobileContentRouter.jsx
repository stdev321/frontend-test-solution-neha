import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatSidebar from '../../../components/features/chat/sidebar';
import SpecialistsGrid from '../../../components/features/specialists/SpecialistsGrid';
import EncyclopediaPanel from '../../../components/features/chat/sidebar/EncyclopediaPanel';
import MobileProfilePage from './MobileProfilePage';
import MobileConsultationsList from './MobileConsultationsList';
import MobileAIHelpsBuildTeam from './MobileAIHelpsBuildTeam';
import MobileChatInterface from './MobileChatInterface';
import MobileChatWelcomeScreen from './MobileChatWelcomeScreen';

export default function MobileContentRouter({
  // Chat state
  conversationId,
  conversationDetails,
  conversationsList,
  messages,
  isThinking,
  sidebarIsLoading,
  sidebarError,
  chatAreaContentMode,
  currentChatSummary,
  isSummarizing,
  
  // User & auth
  isAuthenticated,
  currentUser,
  profileData,
  onLogout,
  
  // Sidebar data
  sidebarContentMode,
  sidebarData,
  allPersonas,
  myAdvisers,
  
  // Chat functionality
  onChatAreaStartTeamChat,
  onExitChat,
  onNavigateToView,
  onSetMode,
  sendMessage,
  onSelectPersona,
  onGetSummary,
  onGetTranscript,
  
  // Mobile input
  mobileInputMessage,
  setMobileInputMessage,
  onSendMessage,
  
  // UI state
  isSpeakerEnabled,
  onDrawerToggle,
  
  // Props and handlers
  props,
  restProps,
  activeImageStack,
  
  // Navigation handlers
  handleReturnToChat,
  onEncyclopediaQuery,
  encyclopediaError,
  encyclopediaResponse,
  encyclopediaLoading,
  onEncyclopediaReset
}) {
  const { t } = useTranslation(['chat', 'common']);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get current view from URL with new structure
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path.startsWith('/chat/dashboard')) return 'dashboard';
    if (path === '/profile') return 'profile';
    if (path === '/consultations' || path.startsWith('/chat/consultations')) return 'consultations';
    if (path === '/team' || path.startsWith('/chat/team')) return 'team';
    if (path === '/encyclopedia' || path.startsWith('/chat/encyclopedia')) return 'encyclopedia';
    if (path.includes('/transcript')) return 'transcript';
    if (path.includes('/summary')) return 'summary';
    if (path.includes('/differential-opinion')) return 'differentialOpinion';
    if (path.startsWith('/conversation/')) return 'chat';
    // Legacy support
    if (path.startsWith('/chat/')) return 'chat';
    return 'chat';
  };
  
  const currentMobileView = getCurrentView();
  
  // Check if we should show team recommendation results
  if (currentMobileView === 'aiTeamBuilder' && !props.isGettingRecommendation && props.recommendationData) {
    // We have finished getting recommendations, show the results
    // This should be handled by navigation, not state change
  }
  
  // Add new case for showing team recommendation results
  if (currentMobileView === 'teamResults') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
          <Toolbar sx={{ minHeight: '48px !important', py: 0 }}>
            <IconButton edge="start" onClick={() => navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard')} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '1.1rem' }}>
              {t('mobileRouter.teamRecommendations')}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Team Recommendation Results */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <ChatSidebar
            {...props}
            conversationId={conversationId}
            conversationDetails={conversationDetails}
            contentMode="teamRecommendationResults"
            data={props.recommendationData}
            isLoading={props.isApplyingRecommendation || false}
            error={props.recommendationError}
            hideHeader={true}
            onSetMode={onSetMode}
            currentUser={currentUser}
            allPersonas={allPersonas}
            myAdvisers={myAdvisers}
            profileData={profileData}
          />
        </Box>
      </Box>
    );
  }

  // Add this case for the AI team builder
  if (currentMobileView === 'aiTeamBuilder') {
    console.log('=== MOBILE UI TEAM BUILDER DEBUG ===');
    console.log('Available props:', Object.keys(props));
    console.log('props.onSubmitQuestionnaire:', typeof props.onSubmitQuestionnaire);
    console.log('props.isGettingRecommendation:', props.isGettingRecommendation);
    console.log('props.recommendationData:', props.recommendationData);
    console.log('props.recommendationError:', props.recommendationError);
    
    return (
      <MobileAIHelpsBuildTeam
        onSubmit={props.onSubmitQuestionnaire}
        onBack={() => {
          navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard');
        }}
        isLoading={props.isGettingRecommendation || false}
        error={props.recommendationError || null}
        myAdvisers={myAdvisers}
        profileData={profileData}
        currentUser={currentUser}
        onStartTeamConversation={onChatAreaStartTeamChat}
        recommendationData={props.recommendationData}
        onSetMode={onSetMode}
      />
    );
  }

  // Only show sidebar content for specific sidebar views when in a conversation
  const sidebarViews = ['team', 'summary', 'differentialOpinion', 'transcript', 'encyclopedia'];
  if (conversationId && sidebarViews.includes(currentMobileView)) {
    
    // Map views to their content modes
    const viewToContentMode = {
      'transcript': 'transcript',
      'summary': 'summary',
      'differentialOpinion': 'differentialOpinion',
      'team': 'activeChatView',
      'encyclopedia': 'encyclopediaQuery'
    };
    const effectiveContentMode = viewToContentMode[currentMobileView] || sidebarContentMode;
    
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with back button */}
        <Paper square elevation={1} sx={{ 
          flexShrink: 0, 
          height: 48, 
          px: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: 1, 
          borderColor: 'divider', 
          bgcolor: 'background.paper' 
        }}>
          <IconButton onClick={handleReturnToChat} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {currentMobileView === 'team' && t('mobileRouter.myTeam')}
            {currentMobileView === 'summary' && t('mobileRouter.summary')}
            {currentMobileView === 'differentialOpinion' && t('mobileRouter.differentialOpinion')}
            {currentMobileView === 'transcript' && t('mobileRouter.transcript')}
            {currentMobileView === 'encyclopedia' && t('mobileRouter.encyclopedia')}
            {currentMobileView === 'consultations' && t('mobileRouter.consultations')}
          </Typography>
          <Button size="small" onClick={handleReturnToChat}>
            {t('mobileRouter.returnToChat')}
          </Button>
        </Paper>

        {/* Sidebar content in full screen */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <ChatSidebar
            {...restProps}
            conversationId={conversationId}
            conversationDetails={conversationDetails}
            contentMode={effectiveContentMode}
            data={sidebarData}
            isLoading={sidebarIsLoading}
            error={sidebarError}
            onEncyclopediaQuery={onEncyclopediaQuery}
            onEncyclopediaReset={onEncyclopediaReset}
            encyclopediaResponse={encyclopediaResponse}
            encyclopediaLoading={encyclopediaLoading}
            encyclopediaError={encyclopediaError}
            hideHeader={true}
            onSetMode={(mode) => {
              // For mobile, when returning from transcript/summary to chat, 
              // we need to update the mobile view as well
              if (mode === 'activeChatView') {
                handleReturnToChat();
              } else {
                onSetMode(mode);
              }
            }}
            currentUser={currentUser}
            allPersonas={allPersonas}
            conversationPersonas={conversationDetails?.personas || []}
            onSelectPersona={onSelectPersona}
            profileData={profileData}
            onGetSummary={onGetSummary}
            onGetTranscript={onGetTranscript}
            onExitChat={onExitChat}
            sendMessage={sendMessage}
            activeImageStack={activeImageStack}
          />
        </Box>
      </Box>
    );
  }

  // If we have a conversation, always show chat interface
  if (conversationId && currentMobileView === 'chat') {
    return (
      <MobileChatInterface
        conversationId={conversationId}
        conversationDetails={conversationDetails}
        messages={messages}
        isThinking={isThinking}
        sidebarIsLoading={sidebarIsLoading}
        sidebarError={sidebarError}
        currentUser={currentUser}
        profileData={profileData}
        onChatAreaStartTeamChat={onChatAreaStartTeamChat}
        onExitChat={onExitChat}
        onNavigateToView={onNavigateToView}
        mobileInputMessage={mobileInputMessage}
        setMobileInputMessage={setMobileInputMessage}
        onSendMessage={onSendMessage}
        isSpeakerEnabled={isSpeakerEnabled}
        onDrawerToggle={onDrawerToggle}
        onNavigateToTeam={() => navigate('/team')}
        onNavigateToHealthAdvisory={() => navigate('/health-advisory')}
        onNavigateToConsultations={() => navigate('/consultations')}
        onNavigateToEncyclopedia={() => navigate('/encyclopedia')}
        onNavigateToProfile={() => navigate('/profile')}
        onLogout={onLogout}
        isGuestMode={props.isGuestMode}
      />
    );
  }

  // Regular mobile content based on current view
  switch (currentMobileView) {
    case 'dashboard':
      // Show welcome screen when at dashboard
      return (
        <MobileChatWelcomeScreen
          username={currentUser?.displayName || currentUser?.email || t('common:user.defaultName')}
          currentUser={currentUser}
          onChatAreaStartTeamChat={onChatAreaStartTeamChat}
          onNavigateToTeam={() => onNavigateToView('team')}
          onNavigateToHealthAdvisory={() => onNavigateToView('health-advisory')}
          onNavigateToConsultations={() => onNavigateToView('consultations')}
          onNavigateToEncyclopedia={() => onNavigateToView('encyclopedia')}
          onNavigateToProfile={() => onNavigateToView('profile')}
          onLogout={onLogout}
          aileenCarolImage={props.aileenCarolImage}
          persona={props.aileenCarolPersona}
          userProfile={profileData}
        />
      );
      
    case 'profile':
      return (
        <MobileProfilePage
          currentUser={currentUser}
          profileData={profileData}
          onBack={() => navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard')}
          onLogout={onLogout}
          conversationId={conversationId}
          onSaveChanges={restProps.handleUpdateProfile || restProps.onUpdateProfile}
          {...restProps}
        />
      );
      
    case 'chat':
      if (chatAreaContentMode === 'summaryView') {
        return (
          <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h5" gutterBottom>{t('chat:summary.title')}</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', flexGrow: 1, overflow: 'auto' }}>
                {isSummarizing ? t('chat:summary.generating') : (currentChatSummary || t('chat:summary.notGenerated'))}
              </Typography>
            </Paper>
          </Box>
        );
      }
      
      if (!isAuthenticated) {
        return (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Typography variant="h6" gutterBottom>{t('mobileRouter.pleaseLogIn')}</Typography>
            <Typography paragraph align="center">{t('mobileRouter.logInToView')}</Typography>
            <Button variant="contained" onClick={() => navigate('/login')}>{t('mobileRouter.logIn')}</Button>
          </Box>
        );
      }

      // Mobile chat interface
      return (
        <MobileChatInterface
          conversationId={conversationId}
          conversationDetails={conversationDetails}
          messages={messages}
          isThinking={isThinking}
          sidebarIsLoading={sidebarIsLoading}
          sidebarError={sidebarError}
          currentUser={currentUser}
          profileData={profileData}
          onChatAreaStartTeamChat={onChatAreaStartTeamChat}
          onExitChat={onExitChat}
          onNavigateToView={onNavigateToView}
          mobileInputMessage={mobileInputMessage}
          setMobileInputMessage={setMobileInputMessage}
          onSendMessage={onSendMessage}
          isSpeakerEnabled={isSpeakerEnabled}
          onDrawerToggle={onDrawerToggle}
          onNavigateToTeam={() => navigate('/team')}
          onNavigateToHealthAdvisory={() => navigate('/health-advisory')}
          onNavigateToConsultations={() => navigate('/consultations')}
          onNavigateToEncyclopedia={() => navigate('/encyclopedia')}
          onNavigateToProfile={() => navigate('/profile')}
          onLogout={onLogout}
          isGuestMode={props.isGuestMode}
        />
      );
      
    case 'team':
      return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
          {allPersonas && allPersonas.length > 0 ? (
            <SpecialistsGrid 
              personas={allPersonas} 
              selectedIds={myAdvisers?.map(a => a.id) || []} 
              onPersonaClick={onSelectPersona}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="body1" color="text.secondary">
                {t('mobileRouter.loadingSpecialists')}
              </Typography>
            </Box>
          )}
        </Box>
      );
      
    case 'encyclopedia':
      return (
        <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
          <EncyclopediaPanel
            onSubmit={onEncyclopediaQuery}
            onReset={onEncyclopediaReset}
            response={encyclopediaResponse}
            isLoading={encyclopediaLoading}
            error={encyclopediaError}
          />
        </Box>
      );
      
    case 'consultations':
      return (
        <MobileConsultationsList
          conversationsList={conversationsList || []}
          navigate={navigate}
          onEditItem={restProps.handleClickEditItem}
          onUpdateTitle={restProps.onUpdateTitle}
          onTriggerMultiDelete={restProps.onTriggerMultiDelete}
        />
      );
      
    case 'aiTeamBuilder':
      return (
        <MobileAIHelpsBuildTeam
          onSubmit={restProps.onSubmitQuestionnaire || restProps.handleSubmitQuestionnaire}
          onBack={() => {
            navigate(conversationId ? `/conversation/${conversationId}` : '/dashboard');
          }}
          isLoading={restProps.isGettingRecommendation || false}
          error={restProps.recommendationError || null}
          myAdvisers={myAdvisers}
          profileData={profileData}
          currentUser={currentUser}
        />
      );
      
    default:
      return null;
  }
} 