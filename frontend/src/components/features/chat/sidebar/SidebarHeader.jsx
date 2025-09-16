import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Tooltip,
  IconButton,
  Avatar,
  Badge,
  useTheme,
  Stack,
  useMediaQuery
} from '@mui/material';
import { CompactThinkingIndicator } from '../../../common/ThinkingIndicator';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TranscriptIcon from '@mui/icons-material/Article';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';



// Import guest user image
import guestUserImage from '../../../../assets/images/guest-user_tiny.png';

function SidebarHeader({
  isCreatingConversation = false,
  onSetMode,
  contentMode,
  userInitials = '?',
  profileData = null,
  isActionInProgress = false,
  onStartChatDirect,
  onShowChatConfigurations,
  onManageTeam,
  onAITeamBuilder,
  conversationId,
  onGetSummary,
  onGetDifferentialOpinion,
  onGetTranscript,
  onExitChat,
  actionLoading = {},
  uploadedImagePreviewUrl,
  onSelectParticipantsView,
  onSelectUploadedImageView,
  activeChatSubView,
  activeImageStack = [],
  onSelectImageThumbnail,
  isGuestMode = false,
}) {  
  const { t } = useTranslation('chat');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const purpleHighlightColor = '#AD55DA';
  
  const getIconColor = (isActive, isExitButton = false) => {
    if (isExitButton) {
      return purpleHighlightColor;
    }

    if (isActive) {
      return purpleHighlightColor;
    }
    
    return theme.palette.mode === 'dark' ? 'white' : theme.palette.primary.main;
  };

  const handleUserProfileClick = () => {
    onSetMode('profile');
  };

  const isChatActive = !!conversationId;

  const handleThumbnailClick = (imageId) => {
    // Always switch to the uploaded image view when clicking on a thumbnail
    if (onSelectUploadedImageView) {
      onSelectUploadedImageView();
    }
    // Then select the specific image
    if (onSelectImageThumbnail) {
      onSelectImageThumbnail(imageId);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      mb: 2, 
      borderBottom: 1, 
      borderColor: 'divider', 
      pb: 1, 
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 1,
      bgcolor: 'background.paper'
    }}>
      {conversationId ? (
        // IN CONVERSATION STATE
        <>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto' }}>
            <Tooltip title={t('sidebarHeader.panel')}>
              <IconButton 
                onClick={onSelectParticipantsView}
                sx={{ color: getIconColor(contentMode === 'activeChatView' && activeChatSubView === 'participantsPanel') }}
                aria-label={t('common:aria.panel')}
              >
                <GridViewIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('sidebarHeader.summary')}>
              <IconButton 
                onClick={() => {
                  console.log('Summary button clicked. isGuestMode:', isGuestMode, 'onGetSummary:', onGetSummary);
                  if (isGuestMode) {
                    console.log('Guest mode - summary disabled');
                    return;
                  }
                  if (onGetSummary) {
                    console.log('Calling onGetSummary function...');
                    onGetSummary();
                  } else {
                    console.log('ERROR: onGetSummary is undefined!');
                  }
                }}
                sx={{ 
                  color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'summary'),
                  cursor: isGuestMode ? 'not-allowed' : 'pointer'
                }}
                disabled={isGuestMode || actionLoading?.summary}
                aria-label={t('common:aria.summary')}
              >
                {actionLoading?.summary ? <CompactThinkingIndicator /> : <SummarizeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('sidebarHeader.differentialOpinion')}>
              <IconButton 
                onClick={() => {
                  console.log('Differential Opinion button clicked. isGuestMode:', isGuestMode, 'onGetDifferentialOpinion:', onGetDifferentialOpinion);
                  if (isGuestMode) {
                    console.log('Guest mode - differential opinion disabled');
                    return;
                  }
                  if (onGetDifferentialOpinion) {
                    console.log('Calling onGetDifferentialOpinion function...');
                    onGetDifferentialOpinion();
                  } else {
                    console.log('ERROR: onGetDifferentialOpinion is undefined!');
                  }
                }}
                sx={{ 
                  color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'differentialOpinion'),
                  cursor: isGuestMode ? 'not-allowed' : 'pointer'
                }}
                disabled={isGuestMode || actionLoading?.differentialOpinion}
                aria-label={t('common:aria.differentialOpinion')}
              >
                {actionLoading?.differentialOpinion ? <CompactThinkingIndicator /> : <PsychologyIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('sidebarHeader.transcript')}>
              <IconButton 
                onClick={() => {
                  console.log('Transcript button clicked. isGuestMode:', isGuestMode, 'onGetTranscript:', onGetTranscript);
                  if (isGuestMode) {
                    console.log('Guest mode - transcript disabled');
                    return;
                  }
                  if (onGetTranscript) {
                    console.log('Calling onGetTranscript function...');
                    onGetTranscript();
                  } else {
                    console.log('ERROR: onGetTranscript is undefined!');
                  }
                }}
                sx={{ 
                  color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'transcript'),
                  cursor: isGuestMode ? 'not-allowed' : 'pointer'
                }}
                disabled={isGuestMode || actionLoading?.transcript}
                aria-label={t('common:aria.transcript')}
              >
                {actionLoading?.transcript ? <CompactThinkingIndicator /> : <TranscriptIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title={t('sidebarHeader.encyclopedia')}>
              <span>
                <IconButton
                  onClick={isGuestMode ? undefined : () => onSetMode('encyclopediaQuery')}
                  sx={{ 
                    color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'encyclopediaQuery'),
                    cursor: isGuestMode ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isGuestMode || actionLoading?.encyclopedia}
                  aria-label={t('common:aria.encyclopedia')}
                >
                  <MenuBookIcon />
                </IconButton>
              </span>
            </Tooltip>

            {activeImageStack && activeImageStack.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ ml: 1, alignItems: 'center', borderLeft: `1px solid ${theme.palette.divider}`, pl: 0.5 }}>
                {activeImageStack.map((image, index) => (
                  <Tooltip key={image.id || index} title={image.filename || t('sidebarHeader.imageNumber', { number: index + 1 })}>
                    <IconButton
                      onClick={() => handleThumbnailClick(image.id)}
                      sx={{
                        padding: '2px',
                        border: uploadedImagePreviewUrl === image.url ? `2px solid ${purpleHighlightColor}` : `2px solid transparent`,
                        borderRadius: '6px' 
                      }}
                      size="small"
                    >
                      <Avatar 
                        src={image.url} 
                        variant="rounded" 
                        sx={{ width: 20, height: 20, borderRadius: '4px' }}
                      />
                    </IconButton>
                  </Tooltip>
                ))}
              </Stack>
            )}
          </Box>

          {isGuestMode ? (
            <Tooltip title={t('guest.profileRegistrationRequired')}>
              <span>
                <IconButton 
                  disabled
                  sx={{ 
                    color: theme.palette.action.disabled,
                    opacity: 0.5,
                    cursor: 'not-allowed'
                  }}
                  aria-label={t('common:aria.userProfile')}
                >
                  <Avatar
                    src={guestUserImage}
                    sx={{ width: 32, height: 32 }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={t('endConversation', { ns: 'header' })}>
              <IconButton 
                onClick={(e) => {
                  console.log('SidebarHeader: End Conversation button clicked!', e);
                  console.log('SidebarHeader: onExitChat function:', onExitChat);
                  if (onExitChat) {
                    console.log('SidebarHeader: Calling onExitChat...');
                    onExitChat();
                    console.log('SidebarHeader: onExitChat call completed');
                  } else {
                    console.log('SidebarHeader: ERROR - onExitChat is undefined!');
                  }
                }}
                sx={{ 
                  // Desktop = theme purple; Mobile = keep red
                  color: isMobile ? '#d32f2f' : purpleHighlightColor,
                  '&:hover': {
                    backgroundColor: isMobile ? 'rgba(211, 47, 47, 0.04)' : 'rgba(173, 85, 218, 0.08)',
                    color: isMobile ? '#c62828' : purpleHighlightColor
                  }
                }}
                aria-label={t('common:aria.endConversation')}
              >
                <CloseIcon sx={{ fontSize: '1.5rem' }} />
              </IconButton>
            </Tooltip>
          )}
        </>
      ) : (
        // NOT IN CONVERSATION STATE (original layout)
        <>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title={t('sidebarHeader.panel')}>
              <span>
                <IconButton 
                  onClick={onManageTeam}
                  sx={{ color: getIconColor(contentMode === 'personaList') }}
                  aria-label={t('common:aria.panel')}
                >
                  <GridViewIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={t('sidebarHeader.startChatWithTeam')}>
              <span>
                <IconButton 
                  onClick={onStartChatDirect}
                  sx={{ color: getIconColor(false) }}
                  disabled={isCreatingConversation || isActionInProgress}
                  aria-label={t('common:aria.startChat')}
                >
                  {isCreatingConversation && onStartChatDirect ? (
                    <CompactThinkingIndicator />
                  ) : (
                    <AddCommentIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            
            {false && (
              <Tooltip title={t('sidebarHeader.configureNewChat')}>
                <span>
                  <IconButton 
                    onClick={onShowChatConfigurations}
                    sx={{ 
                      color: getIconColor(contentMode === 'chatConfigurationView')
                    }}
                    disabled={isCreatingConversation || isActionInProgress}
                    aria-label={t('common:aria.configureChat')}
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {false && (
              <Tooltip title={t('sidebarHeader.myAIHealthTeam')}>
                <span>
                  <IconButton 
                    onClick={onManageTeam}
                    sx={{ 
                      color: getIconColor(contentMode === 'personaList')
                    }}
                    disabled={isActionInProgress || isCreatingConversation}
                  >
                    <GroupIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {false && (
              <Tooltip title={t('sidebarHeader.aileenCarolTeamBuilder')}>
                <span>
                  <IconButton 
                    onClick={isGuestMode ? undefined : onAITeamBuilder}
                    sx={{ 
                      color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'teamRecommendationQuestionnaire' || contentMode === 'teamRecommendationResults'),
                      cursor: isGuestMode ? 'not-allowed' : 'pointer'
                    }}
                    disabled={isGuestMode || isActionInProgress || isCreatingConversation}
                  >
                    <AutoAwesomeIcon />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            <Tooltip title={t('sidebarHeader.savedConsultations')}>
              <span>
                <IconButton
                  onClick={isGuestMode ? undefined : () => onSetMode('default')}
                  sx={{ 
                    color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'default'),
                    cursor: isGuestMode ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isGuestMode || isActionInProgress || isCreatingConversation}
                  aria-label={t('common:aria.savedConsultations')}
                >
                  <HistoryIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('sidebarHeader.encyclopedia')}>
              <span>
                <IconButton
                  onClick={isGuestMode ? undefined : () => onSetMode('encyclopediaQuery')}
                  sx={{ 
                    color: isGuestMode ? theme.palette.action.disabled : getIconColor(contentMode === 'encyclopediaQuery'),
                    cursor: isGuestMode ? 'not-allowed' : 'pointer'
                  }}
                  disabled={isGuestMode || isActionInProgress || isCreatingConversation}
                  aria-label={t('common:aria.encyclopedia')}
                >
                  <MenuBookIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <span>
            <Tooltip title={t('sidebarHeader.myProfile')}>
              <span>
                <IconButton 
                  onClick={handleUserProfileClick}
                  size="small" 
                  sx={{ p: 0 }} 
                  disabled={isActionInProgress || isCreatingConversation}
                  aria-label={t('common:aria.myProfile')}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    badgeContent={
                      <Box 
                        component="span" 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          color: 'white',
                          border: `1px solid ${theme.palette.background.paper}`
                        }}
                      >
                        {t('common:sidebarHeader.plusBadge')}
                      </Box>
                    }
                  >
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        bgcolor: 'primary.main', 
                        fontSize: '1rem' 
                      }} 
                      src={isGuestMode ? guestUserImage : (profileData?.profile_picture || undefined)}
                    >
                      {!isGuestMode && !profileData?.profile_picture && userInitials}
                    </Avatar>
                  </Badge>
                </IconButton>
              </span>
            </Tooltip>
          </span>
        </>
      )}
    </Box>
  );
}

SidebarHeader.propTypes = {
  isCreatingConversation: PropTypes.bool,
  onSetMode: PropTypes.func.isRequired,
  contentMode: PropTypes.string.isRequired,
  userInitials: PropTypes.string,
  profileData: PropTypes.object,
  isActionInProgress: PropTypes.bool,
  onStartChatDirect: PropTypes.func.isRequired,
  onShowChatConfigurations: PropTypes.func.isRequired,
  onManageTeam: PropTypes.func.isRequired,
  onAITeamBuilder: PropTypes.func.isRequired,
  conversationId: PropTypes.string,
  onGetSummary: PropTypes.func,
  onGetDifferentialOpinion: PropTypes.func,
  onGetTranscript: PropTypes.func,
  onExitChat: PropTypes.func,
  actionLoading: PropTypes.object,
  uploadedImagePreviewUrl: PropTypes.string,
  onSelectParticipantsView: PropTypes.func,
  onSelectUploadedImageView: PropTypes.func.isRequired,
  activeChatSubView: PropTypes.string,
  activeImageStack: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    filename: PropTypes.string,
  })),
  onSelectImageThumbnail: PropTypes.func,
};

export default SidebarHeader;
