import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Tooltip
} from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useTranslation } from 'react-i18next';

export default function MobileBottomNavigation({
  conversationId,
  onChange,
  onChatAreaStartTeamChat
}) {
  const { t } = useTranslation('chat');
  const location = useLocation();
  
  // Get current view from URL with new structure
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/consultations' || path.includes('/consultations')) return 'consultations';
    if (path === '/team' || path.includes('/team')) return 'team';
    if (path === '/encyclopedia' || path.includes('/encyclopedia')) return 'encyclopedia';
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/conversation/')) return 'chat';
    return 'chat';
  };
  
  const currentMobileView = getCurrentView();

  // Don't show bottom navigation during conversation or on welcome screen
  if (conversationId || currentMobileView === 'chat') {
    return null;
  }

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1200,
        height: 56,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }} 
      elevation={8}
    >
      <BottomNavigation
        value={currentMobileView}
        onChange={onChange}
        showLabels={false}
        sx={{ height: 56 }}
      >
        <Tooltip title={t('mobileNavigation.consultation')} placement="top" enterTouchDelay={0} leaveTouchDelay={1500}>
          <BottomNavigationAction 
            value="chat" 
            icon={<AddCommentIcon />}
            onClick={() => {
              onChatAreaStartTeamChat();
            }}
          />
        </Tooltip>
        <Tooltip title={t('mobileNavigation.team')} placement="top" enterTouchDelay={0} leaveTouchDelay={1500}>
          <BottomNavigationAction 
            value="team" 
            icon={<GroupIcon />}
          />
        </Tooltip>
        <Tooltip title={t('mobileNavigation.history')} placement="top" enterTouchDelay={0} leaveTouchDelay={1500}>
          <BottomNavigationAction 
            value="consultations" 
            icon={<HistoryIcon />}
          />
        </Tooltip>
        <Tooltip title={t('mobileNavigation.encyclopedia')} placement="top" enterTouchDelay={0} leaveTouchDelay={1500}>
          <BottomNavigationAction 
            value="encyclopedia" 
            icon={<MenuBookIcon />}
          />
        </Tooltip>
      </BottomNavigation>
    </Paper>
  );
} 