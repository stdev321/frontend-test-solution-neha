import React from 'react';
import { Box } from '@mui/material';
import Header from '../../../components/layout/Header';
import { MobileMessageInput } from './MobileMessageInput';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobileNavigationDrawer from './MobileNavigationDrawer';
import ChatPageDialogs from '../ChatPageDialogs';

export default function MobileLayout({
  // Header props
  isAuthenticated,
  currentUser,
  onLogout,
  mode,
  toggleColorMode,
  chatPageConversationId,
  onChatPageAction,
  activeImageStack,
  onSetFocusedImage,
  uploadedImagePreviewUrl,
  
  // Drawer state
  mobileDrawerOpen,
  handleMobileDrawerToggle,
  
  // Content
  children,
  
  // Message input
  conversationId,
  currentMobileView,
  mobileInputMessage,
  setMobileInputMessage,
  handleMobileSendMessage,
  isConnected,
  isThinking,
  isListening,
  isTranscribing,
  recordingError,
  originalToggleListening,
  
  // Bottom navigation
  currentMobileView,
  handleMobileBottomNavChange,
  onChatAreaStartTeamChat,
  setCurrentMobileView,
  
  // Drawer navigation
  onExitChat,
  handleNavigateToView,
  isSpeakerEnabled,
  handleSpeakerToggle,
  
  // Error handling & dialogs
  restProps,
  snackbarError,
  showSnackbar,
  handleCloseSnackbar
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Header with slide animation */}
      <Box
        sx={{
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
        />
      </Box>
      
      {/* Mobile main content area */}
      <Box sx={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        height: conversationId 
          ? 'calc(100vh - 64px - env(safe-area-inset-bottom))' // No bottom nav during conversation
          : 'calc(100vh - 64px - 56px - env(safe-area-inset-bottom))', // With bottom nav when no conversation
        position: 'relative'
      }}>
        {children}
      </Box>

      {/* Enhanced mobile message input - only show during chat */}
      {conversationId && currentMobileView === 'chat' && (
        <MobileMessageInput
          value={mobileInputMessage}
          onChange={(e) => setMobileInputMessage(e.target.value)}
          onSend={handleMobileSendMessage}
          isConnected={isConnected}
          isThinking={isThinking}
          onFileUpload={() => console.log('File upload')}
          onImageUpload={() => console.log('Image upload')}
          voiceRecorderProps={{
            isListening,
            isTranscribing,
            recordingError,
            toggleListening: originalToggleListening
          }}
        />
      )}

      {/* Mobile bottom navigation */}
      <MobileBottomNavigation
        conversationId={conversationId}
        currentMobileView={currentMobileView}
        onChange={handleMobileBottomNavChange}
        onChatAreaStartTeamChat={onChatAreaStartTeamChat}
        setCurrentMobileView={setCurrentMobileView}
      />

      {/* Enhanced mobile drawer with navigation */}
      <MobileNavigationDrawer
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerToggle}
        onOpen={handleMobileDrawerToggle}
        conversationId={conversationId}
        onExitChat={onExitChat}
        onNavigateToView={handleNavigateToView}
        isSpeakerEnabled={isSpeakerEnabled}
        onSpeakerToggle={handleSpeakerToggle}
        sidebarProps={restProps}
      />

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
    </Box>
  );
} 