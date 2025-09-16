import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import renderSidebarContent from './renderSidebarContent';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  Dialog, DialogActions, DialogContent, DialogTitle, Button, useTheme,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import { ThinkingIndicator, CompactThinkingIndicator } from '../../../common/ThinkingIndicator';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import GroupsIcon from '@mui/icons-material/Groups';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { printHtmlContent } from '../../../../utils/printUtils';
// Use medium size for sidebar display
import VirtualMDLogo from '../../../../assets/branding/full_logo_medium.png';
import CloseIcon from '@mui/icons-material/Close';
import { uploadFile } from '../../../../services/api';
import { constructFullImageUrl, formatDifferentialOpinionText, personalizePatientReferences } from './helpers';

import PersonaListPanel from './PersonaListPanel';
import ProfilePanel from './ProfilePanel';
import EncyclopediaPanel from './EncyclopediaPanel';
import NewConversationPanel from './NewConversationPanel';
import SpecialistPanel from './SpecialistPanel';
import SidebarHeader from './SidebarHeader';
import BioPanel from './BioPanel';
import SummaryPanel from './SummaryPanel';
import TranscriptPanel from './TranscriptPanel';
import SidebarFooter from './SidebarFooter';
import ConsultationsPanel from './ConsultationsPanel';
import { useMyAdvisers } from '../../../../contexts/MyAdvisersContext';
import ChatConfiguratorPanel from './ChatConfiguratorPanel';
import ManageTeamPanel from './ManageTeamPanel';
import ActiveChatParticipantsPanel from './ActiveChatParticipantsPanel';
import AccountPanel from './AccountPanel';
import ImageContextPanel from './ImageContextPanel';
import ImageProcessingToolbar from './ImageProcessingToolbar';
import useDialogManager from './useDialogManager';

import DialogContentText from '@mui/material/DialogContentText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { addParticipantToConversation } from '../../../../services/api';
import ChatSidebarPropTypes from './ChatSidebarPropTypes';

const ChatSidebar = (props) => {
  const {
    hideHeader = false,
    sendMessage,
    conversationId = null,
    conversationDetails = null,
    conversationsList = [],
    conversationPersonas = [],
    onUpdateTitle,
    onDeleteConversation,
    contentMode = 'default',
    data = null,
    isLoading = false,
    error: sidebarErrorProp = null,
    onSetMode,
    onSelectPersona,
    activePersonaId = null,
    onNewConversation,
    isCreatingConversation = false,
    initialChoice = '',
    onSetInitialChoice,
    onConfirmInitialChoice,
    personaApiLoading = false,
    personaApiError = null,
    availablePersonasForSelection = [],
    selectedPersonaIds = {},
    onPersonaSelectionChange,
    onStartWithSelectedSpecialists,
    profileData = null,
    profileLoading = false,
    profileError = null,
    onUpdateProfile,
    onEncyclopediaQuery,
    onEncyclopediaReset,
    encyclopediaLoading = false,
    encyclopediaResponse = null,
    encyclopediaError = null,
    allPersonas,
    onRefreshConversation,
    handleStartTeamConversation,
    handleStartAileenCarolConversation,
    handleSelectSubsetConversation,
    handleSelectSingleSpecialistConversation,
    isSingleSpecialistModeActive,
    setAvailablePersonasForSelection,
    setSidebarContentMode,
    addAdviserToUserTeam,
    removeAdviserFromUserTeam,
    onParticipantTileClick,
    onShowSpecialistsGrid,
    onShowSpecialistsGridOnly,
    chatAreaContentMode,
    sidebarData,
    onGetSummary,
    onGetDifferentialOpinion,
    onGetTranscript,
    onExitChat,
    actionLoading = {},
    currentUser,
    uploadedImagePreviewUrl,
    onClearSidebarImagePreview,


    activeImageStack,
    onPromoteCropToStack,
    onClearAllImages,
    onToggleImageVisibility,
    onDeleteImage,
    onSetFocusedImage,
    onFilesSelectedForContext,
    onSubmitQuestionnaire,
    onAcceptTeamRecommendation,
    isGettingRecommendation,
    isApplyingRecommendation,
    recommendationData,
    recommendationError,
    isGuestMode = false,
  } = props;

  const theme = useTheme();
  const { t } = useTranslation('chat');

  const [dialogError, setDialogError] = useState('');

  const {
    edit: {
      editDialogOpen,
      itemToEdit,
      editedTitle,
      isUpdating,
      editButtonRef,
      setEditedTitle,
      handleClickEditItem,
      handleCloseEditDialog,
      handleConfirmEditTitle,
    },
    deleteOne: {
      deleteDialogOpen,
      itemToDelete,
      isDeleting,
      handleClickDeleteItem,
      handleCloseDeleteDialog,
      handleConfirmDeleteItem,
    },
    deleteMany: {
      multiDeleteDialogOpen,
      isMultiDeleting,
      openMultiDelete,
      closeMultiDelete,
      handleConfirmMultiDelete,
    },
  } = useDialogManager({ onUpdateTitle, onDeleteConversation, setDialogError });

  let userInitials = '?';
  const sourceForInitials = profileData || currentUser || {};
  if (sourceForInitials.full_name) {
    userInitials = sourceForInitials.full_name.trim()[0].toUpperCase();
  } else if (sourceForInitials.display_name) {
    userInitials = sourceForInitials.display_name[0].toUpperCase();
  } else if (sourceForInitials.email) {
    userInitials = sourceForInitials.email[0].toUpperCase();
  }

  const { myAdvisers, isLoadingMyAdvisers, myAdvisersError } = useMyAdvisers();
  const [selectedIds, setSelectedIds] = useState({});
  const [isAddSpecialistModalOpen, setIsAddSpecialistModalOpen] = useState(false);
  const [isAddingSpecialist, setIsAddingSpecialist] = useState(false);
  const [addSpecialistError, setAddSpecialistError] = useState('');
  const [teamManagementError, setTeamManagementError] = useState(null);
  const [isManagingTeam, setIsManagingTeam] = useState(false);
  const [activeChatSubView, setActiveChatSubView] = useState('participantsPanel');
  const DifferentialOpinionRef = useRef(null);
  const prevUploadedImagePreviewUrlRef = useRef(uploadedImagePreviewUrl);
  const handleSelectParticipantsView = () => {
    if (props.onSetMode) props.onSetMode('activeChatView');
    setActiveChatSubView('participantsPanel');
  };

  const handleSelectUploadedImageView = () => {
    if (uploadedImagePreviewUrl && props.onSetMode) {
      props.onSetMode('activeChatView');
      setActiveChatSubView('uploadedImageView');
    }
  };


  useEffect(() => {

    if (uploadedImagePreviewUrl && !prevUploadedImagePreviewUrlRef.current && contentMode === 'activeChatView') {
      setActiveChatSubView('uploadedImageView');
    }

    else if (!uploadedImagePreviewUrl && prevUploadedImagePreviewUrlRef.current && activeChatSubView === 'uploadedImageView' && contentMode === 'activeChatView') {
      setActiveChatSubView('participantsPanel');
    }

    prevUploadedImagePreviewUrlRef.current = uploadedImagePreviewUrl;
  }, [uploadedImagePreviewUrl, contentMode, activeChatSubView]);


  if (isLoading && !conversationDetails && contentMode !== 'default') {
    return (
      <Box sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <ThinkingIndicator />
      </Box>
    );
  }

  const copyDifferentialOpinionToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      alert('Failed to copy');
    }
  };

  const handleDifferentialOpinionPrint = () => {
    if (!DifferentialOpinionRef.current) return;
    printHtmlContent('Differential Opinion','Differential Opinion',DifferentialOpinionRef.current.innerHTML,VirtualMDLogo);
  };

  const handleOpenAddSpecialistModal = () => {
    if (!conversationId) return;
    setAddSpecialistError('');
    setIsAddSpecialistModalOpen(true);
  };

  const handleCloseAddSpecialistModal = () => {
    setIsAddSpecialistModalOpen(false);
    setAddSpecialistError('');
  };

  const handleAddSpecialist = async (personaIdToAdd) => {
    if (!conversationId || !personaIdToAdd) return;
    setIsAddingSpecialist(true);
    setAddSpecialistError('');
    try {
      const updatedConversation = await addParticipantToConversation(conversationId, personaIdToAdd);


      if (onRefreshConversation) {
        onRefreshConversation();
      } else {

        }
      handleCloseAddSpecialistModal();
    } catch (err) {
      setAddSpecialistError(err.message || "Could not add specialist.");
    } finally {
      setIsAddingSpecialist(false);
    }
  };


  const handleChatPlusDirectClick = () => {


    handleStartTeamConversation();
  };

  const handleShowChatConfigurationsClick = () => {


    onSetMode('chatConfigurationView');
  };

  const handleManageTeamClick = () => {

    setTeamManagementError(null);
    // Show normal team list on left and card view on right
    onSetMode('personaList');
    
    // Show the SpecialistsGrid in the main chat area
    if (onShowSpecialistsGrid) {
      onShowSpecialistsGrid();
    }
  };

  const handleAITeamBuilderClick = () => {
    setTeamManagementError(null);
    onSetMode('teamRecommendationQuestionnaire');
    
    // Keep the SpecialistsGrid in the main chat area
    if (onShowSpecialistsGridOnly) {
      onShowSpecialistsGridOnly();
    }
  };

  const handleAddAdviserToTeam = async (personaId) => {
    setTeamManagementError(null);
    setIsManagingTeam(true);
    try {
      if (addAdviserToUserTeam) {
         await addAdviserToUserTeam(personaId);
      } else {
        setTeamManagementError("Error: Could not add adviser. Functionality not available.");
      }
    } catch (err) {
      setTeamManagementError(err.message || "Could not add adviser to your team.");
    } finally {
      setIsManagingTeam(false);
    }
  };

  const handleRemoveAdviserFromTeam = async (personaId) => {
    setTeamManagementError(null);
    setIsManagingTeam(true);
    try {

      if (removeAdviserFromUserTeam) {
        await removeAdviserFromUserTeam(personaId);
      } else {
        setTeamManagementError("Error: Could not remove adviser. Functionality not available.");
      }
    } catch (err) {
      setTeamManagementError(err.message || "Could not remove adviser from your team.");
    } finally {
      setIsManagingTeam(false);
    }
  };

  const handleParticipantCardClick = async (personaId) => {
    if (props.onParticipantTileClick) {
      await props.onParticipantTileClick(personaId);
    }
    setActiveChatSubView('bioView');
  };

  const handleReturnToParticipantsPanel = () => {
    if (onSetMode) {
      if (conversationId) onSetMode('activeChatView');
      else onSetMode('default');
    }
  };

  const currentParticipantIds = conversationDetails?.personas?.map(p => p.id) || [];
  const advisersForModal = myAdvisers.filter(adviser => !currentParticipantIds.includes(adviser.id));

  const isListLoading = isLoading && contentMode === 'default';

  const isActionInProgress = isLoading || isCreatingConversation || isDeleting || isUpdating || isMultiDeleting;

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: theme.palette.background.paper,
      borderRight: '1px solid',
      borderColor: 'divider',
      p: 2,
      overflow: 'hidden'
    }}>
      {}
      {!hideHeader && (
        <SidebarHeader
          isCreatingConversation={isCreatingConversation}
          onSetMode={onSetMode}
          contentMode={contentMode}
          userInitials={userInitials}
          profileData={profileData}
          isActionInProgress={profileLoading || isCreatingConversation || isDeleting || isUpdating || isMultiDeleting }
          onStartChatDirect={handleChatPlusDirectClick}
          onShowChatConfigurations={handleShowChatConfigurationsClick}
          onManageTeam={handleManageTeamClick}
        onAITeamBuilder={handleAITeamBuilderClick}
        conversationId={conversationId}
        onGetSummary={onGetSummary}
        onGetDifferentialOpinion={onGetDifferentialOpinion}
        onGetTranscript={onGetTranscript}
        onExitChat={onExitChat}
        actionLoading={actionLoading}
        uploadedImagePreviewUrl={uploadedImagePreviewUrl}
        onSelectParticipantsView={handleSelectParticipantsView}
        onSelectUploadedImageView={handleSelectUploadedImageView}
        activeChatSubView={activeChatSubView}
        isGuestMode={isGuestMode}
          activeImageStack={activeImageStack}
          onSelectImageThumbnail={onSetFocusedImage}
        />
      )}

      {}
      <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          minHeight: 0,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            borderRadius: '3px',
          },
      }}>
          {}
          {isLoading && !isListLoading && contentMode !== 'encyclopediaQuery' && (
              <ThinkingIndicator sx={{ display: 'block', mx: 'auto', mt: 2 }} />
          )}
           {sidebarErrorProp && !isLoading && (
              <Alert severity="error" sx={{ m: 1 }}>{typeof sidebarErrorProp === 'string' ? sidebarErrorProp : (sidebarErrorProp?.message || 'An error occurred.')}</Alert>
          )}

          {}
           {!isLoading && !sidebarErrorProp && (
              renderSidebarContent({
                t,
                contentMode,
                data,
                chatAreaContentMode,
                sidebarErrorProp,
                onSetMode,
                conversationId,
                conversationDetails,
                profileData,
                currentUser,
                onSelectPersona,
                activePersonaId,
                allPersonas,
                isLoading,
                isLoadingMyAdvisers,
                myAdvisers,
                isCreatingConversation,
                handleStartTeamConversation,
                handleRemoveAdviserFromTeam,
                activeChatSubView,
                isGuestMode,
                activeImageStack,
                uploadedImagePreviewUrl,
                sendMessage,
                onPromoteCropToStack,
                onClearAllImages,
                onToggleImageVisibility,
                onDeleteImage,
                setActiveChatSubView,
                initialChoice,
                onSetInitialChoice,
                onConfirmInitialChoice,
                availablePersonasForSelection,
                selectedPersonaIds,
                onPersonaSelectionChange,
                onStartWithSelectedSpecialists,
                personaApiLoading,
                personaApiError,
                profileLoading,
                profileError,
                onUpdateProfile,
                onShowSpecialistsGrid,
                onShowSpecialistsGridOnly,
                handleStartAileenCarolConversation,
                handleSelectSingleSpecialistConversation,
                handleSelectSubsetConversation,
                isSingleSpecialistModeActive,
                setSidebarContentMode,
                onEncyclopediaQuery,
                onEncyclopediaReset,
                encyclopediaResponse,
                encyclopediaLoading,
                encyclopediaError,
                DifferentialOpinionRef,
                handleDifferentialOpinionPrint,
                copyDifferentialOpinionToClipboard,
                selectedIds,
                setSelectedIds,
                conversationsList,
                isListLoading,
                isActionInProgress,
                handleClickEditItem,
                handleClickDeleteItem,
                onUpdateTitle,
                handleParticipantCardClick,
                onFilesSelectedForContext,
                onSetFocusedImage,
                isMultiDeleting,
                openMultiDelete,
                dialogError,
                handleAddAdviserToTeam,
                onSubmitQuestionnaire,
                onAcceptTeamRecommendation,
                isGettingRecommendation,
                isApplyingRecommendation,
                recommendationData,
                recommendationError,
              })
           )}
           {isListLoading && contentMode === 'default' && (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2}}>
                <ThinkingIndicator />
             </Box>
           ) }
      </Box>

      {}
      <SidebarFooter />

      {}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} aria-labelledby="edit-dialog-title">
        <DialogTitle>{t('dialogs.editTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="editedTitle"
            label={t('dialogs.conversationTitleLabel')}
            type="text"
            fullWidth
            variant="standard"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            error={!!dialogError}
            helperText={dialogError}
            onKeyPress={(e) => e.key === 'Enter' && !isUpdating && handleConfirmEditTitle()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isUpdating}>{t('dialogs.cancel')}</Button>
          <Button onClick={handleConfirmEditTitle} disabled={isUpdating || !editedTitle.trim()}>
            {isUpdating ? <CompactThinkingIndicator /> : t('dialogs.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{t('dialogs.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('dialogs.deleteConfirmation', { title: itemToDelete?.title })}</Typography>
          {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>{t('dialogs.cancel')}</Button>
          <Button onClick={handleConfirmDeleteItem} color="error" disabled={isDeleting}>
            {isDeleting ? <CompactThinkingIndicator /> : t('dialogs.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {}
      <Dialog open={multiDeleteDialogOpen} onClose={() => { if(!isMultiDeleting) closeMultiDelete(); }}>
          <DialogTitle>{t('dialogs.multiDeleteTitle')}</DialogTitle>
          <DialogContent>
              <Typography>
                  {t('dialogs.multiDeleteConfirmation', { count: Object.values(selectedIds).filter(Boolean).length })}
              </Typography>
              {dialogError && <Alert severity="error" sx={{ mt: 2 }}>{dialogError}</Alert>}
          </DialogContent>
          <DialogActions>
              <Button onClick={() => { if(!isMultiDeleting) closeMultiDelete(); }} disabled={isMultiDeleting}>
                  {t('dialogs.cancel')}
              </Button>
              <Button onClick={() => handleConfirmMultiDelete(Object.keys(selectedIds).filter(id=>selectedIds[id]))} color="error" disabled={isMultiDeleting}>
                  {isMultiDeleting ? <CompactThinkingIndicator /> : t('dialogs.deleteSelected')}
              </Button>
          </DialogActions>
      </Dialog>

      {}
      {conversationId && (
        <Dialog open={isAddSpecialistModalOpen} onClose={handleCloseAddSpecialistModal} maxWidth="xs" fullWidth>
          <DialogTitle>{t('dialogs.addSpecialistTitle')}</DialogTitle>
          <DialogContent dividers>
            {isLoadingMyAdvisers ? (
              <ThinkingIndicator sx={{ display: 'block', margin: '20px auto' }} />
            ) : myAdvisersError ? (
              <Alert severity="error">{typeof myAdvisersError === 'string' ? myAdvisersError : t('dialogs.addSpecialistError')}</Alert>
            ) : advisersForModal.length === 0 ? (
              <DialogContentText sx={{textAlign: 'center', mt: 2}}>
                {t('dialogs.noAdvisersToAdd')}
              </DialogContentText>
            ) : (
              <List dense>
                {advisersForModal.map((persona) => (
                  <ListItem
                    key={persona.id}
                    button
                    onClick={() => handleAddSpecialist(persona.id)}
                    disabled={isAddingSpecialist}
                  >
                    <ListItemAvatar>
                      <Avatar src={constructFullImageUrl(persona.image)} alt={persona.name}>
                        {!constructFullImageUrl(persona.image) && <PersonIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={persona.name} secondary={persona.specialty} />
                    {isAddingSpecialist && <CompactThinkingIndicator sx={{ml: 1}}/>}
                  </ListItem>
                ))}
              </List>
            )}
            {addSpecialistError && <Alert severity="error" sx={{ mt: 2 }}>{addSpecialistError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddSpecialistModal} disabled={isAddingSpecialist}>{t('dialogs.cancel')}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

ChatSidebar.propTypes = ChatSidebarPropTypes;

export default ChatSidebar;