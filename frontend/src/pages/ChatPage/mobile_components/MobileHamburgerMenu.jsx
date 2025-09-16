import React from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import { useTranslation } from 'react-i18next';

export default function MobileHamburgerMenu({
  conversationId,
  currentMobileView,
  onNavigateToView,
  onGetSummary,
  onGetDifferentialOpinion,
  onGetTranscript,
  sidebarContentMode,
  isLoading,
  disabled = false
}) {
  const { t } = useTranslation('chat');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (viewType) => {
    console.log(`[HamburgerMenu] Navigating to: ${viewType}`);
    handleClose();
    
    // Direct navigation to views
    switch (viewType) {
      case 'chat':
        onNavigateToView('chat');
        break;
      case 'summary':
        onNavigateToView('summary');
        onGetSummary && onGetSummary();
        break;
      case 'differentialOpinion':
        onNavigateToView('differentialOpinion');
        onGetDifferentialOpinion && onGetDifferentialOpinion();
        break;
      case 'transcript':
        onNavigateToView('transcript');
        onGetTranscript && onGetTranscript();
        break;
      case 'team':
        onNavigateToView('team');
        break;
      case 'encyclopedia':
        onNavigateToView('encyclopedia');
        break;
      default:
        onNavigateToView('chat');
    }
  };

  // Don't show hamburger menu if no conversation
  if (!conversationId) {
    return null;
  }

  const isViewActive = (view) => currentMobileView === view;

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleClick}
        disabled={disabled || isLoading}
        sx={{ 
          mr: 1,
          color: 'primary.main'
        }}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 280,
            maxWidth: '90%',
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('hamburger.navigation', 'Navigation')}
          </Typography>
        </Box>

        {/* Return to Chat - Always show first */}
        <MenuItem 
          onClick={() => handleMenuItemClick('chat')}
          selected={isViewActive('chat')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            {currentMobileView !== 'chat' ? <ArrowBackIcon /> : <ChatIcon />}
          </ListItemIcon>
          <ListItemText 
            primary={currentMobileView !== 'chat' ? t('hamburger.returnToChat', 'Return to Chat') : t('hamburger.chat', 'Chat')}
          />
        </MenuItem>

        <Divider />

        {/* Consultation Tools */}
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {t('hamburger.consultationTools', 'Consultation Tools')}
          </Typography>
        </Box>

        <MenuItem 
          onClick={() => handleMenuItemClick('summary')}
          selected={isViewActive('summary')}
          disabled={!conversationId}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <SummarizeIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('hamburger.summary', 'Summary')}
            secondary={isViewActive('summary') ? t('hamburger.currentView', 'Current view') : null}
          />
        </MenuItem>

        <MenuItem 
          onClick={() => handleMenuItemClick('differentialOpinion')}
          selected={isViewActive('differentialOpinion')}
          disabled={!conversationId}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <PsychologyIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('hamburger.differentialOpinion', 'Differential Opinion')}
            secondary={isViewActive('differentialOpinion') ? t('hamburger.currentView', 'Current view') : null}
          />
        </MenuItem>

        <MenuItem 
          onClick={() => handleMenuItemClick('transcript')}
          selected={isViewActive('transcript')}
          disabled={!conversationId}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('hamburger.transcript', 'Transcript')}
            secondary={isViewActive('transcript') ? t('hamburger.currentView', 'Current view') : null}
          />
        </MenuItem>

        <Divider />

        {/* Additional Features */}
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {t('hamburger.additionalFeatures', 'Additional Features')}
          </Typography>
        </Box>

        <MenuItem 
          onClick={() => handleMenuItemClick('team')}
          selected={isViewActive('team')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('hamburger.myTeam', 'My AI Health Team')}
            secondary={isViewActive('team') ? t('hamburger.currentView', 'Current view') : null}
          />
        </MenuItem>

        <MenuItem 
          onClick={() => handleMenuItemClick('encyclopedia')}
          selected={isViewActive('encyclopedia')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <MenuBookIcon />
          </ListItemIcon>
          <ListItemText 
            primary={t('hamburger.encyclopedia', 'Health Encyclopedia')}
            secondary={isViewActive('encyclopedia') ? t('hamburger.currentView', 'Current view') : null}
          />
        </MenuItem>
      </Menu>
    </>
  );
}