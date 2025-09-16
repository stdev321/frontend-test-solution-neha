import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Checkbox,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { safeParseDate, formatDateInUserTimeZone } from '../../../utils/safeDate';
import EditIcon from '@mui/icons-material/Edit';

export default function MobileConsultationsList({
  conversationsList = [],
  navigate,
  onEditItem,
  onUpdateTitle,
  onTriggerMultiDelete
}) {
  const { t, i18n } = useTranslation('chat');
  
  // conversationsList received with items
  
  // Mobile consultations selection state
  const [mobileSelectedIds, setMobileSelectedIds] = useState({});
  
  // Calculate selection state
  const mobileSelectedCount = Object.values(mobileSelectedIds).filter(Boolean).length;
  const mobileTotalCount = conversationsList?.length || 0;
  const mobileAllSelected = mobileTotalCount > 0 && mobileSelectedCount === mobileTotalCount;
  const mobileSomeSelected = mobileSelectedCount > 0;

  const handleMobileSelectAllToggle = () => {
    if (mobileAllSelected) {
      setMobileSelectedIds({});
    } else {
      const allIds = conversationsList?.reduce((acc, conv) => ({ ...acc, [conv.id]: true }), {}) || {};
      setMobileSelectedIds(allIds);
    }
  };

  const handleMobileDeleteSelected = () => {
    console.log('Delete selected:', Object.keys(mobileSelectedIds).filter(id => mobileSelectedIds[id]));
    if (onTriggerMultiDelete) {
      onTriggerMultiDelete();
    }
  };

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, px: 1 }}>{t('mobileConsultations.title')}</Typography>
      
      {/* Mobile-only selection controls */}
      {conversationsList && conversationsList.length > 0 && (
        <Box sx={{ mb: 1.5, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 'auto', mr: 0.5, pl: 0.5 }}>
              <Checkbox
                checked={mobileAllSelected}
                indeterminate={mobileSomeSelected && !mobileAllSelected}
                onChange={handleMobileSelectAllToggle}
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {mobileAllSelected ? t('mobileConsultations.deselectAll') : t('mobileConsultations.selectAll')}
              </Typography>
            </Box>
            {mobileSomeSelected && (
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={handleMobileDeleteSelected}
              >
                {t('mobileConsultations.deleteSelected', { count: mobileSelectedCount })}
              </Typography>
            )}
          </Box>
          <Divider />
        </Box>
      )}

      {/* Mobile conversations list */}
      <Box sx={{ px: 1 }}>
        {conversationsList && conversationsList.length > 0 ? (
          <List disablePadding>
            {conversationsList.map(conv => {
              const baseTitle = conv.title || t('mobileConsultations.consultationDefault', { id: conv.id });
              const hasCount = typeof conv.message_count === 'number' && !isNaN(conv.message_count);
              const displayTitle = hasCount ? `${baseTitle} (${conv.message_count})` : baseTitle;
              return (
              <ListItem
                key={conv.id}
                disablePadding
                sx={{ mb: 0.5, borderRadius: 1, position: 'relative' }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5, pl: 0.5 }}>
                  <Checkbox
                    checked={mobileSelectedIds[conv.id] || false}
                    onChange={(e) => {
                      e.stopPropagation();
                      setMobileSelectedIds(prev => ({
                        ...prev,
                        [conv.id]: e.target.checked
                      }));
                    }}
                    size="small"
                  />
                </ListItemIcon>
                <ListItemButton
                  onClick={() => {
                    console.log(`Mobile navigating to /conversation/${conv.id}`);
                    navigate(`/conversation/${conv.id}`);
                  }}
                  sx={{ borderRadius: 1, pr: '50px' }}
                >
                  <ListItemText
                    primary={displayTitle}
                    secondary={(() => {
                      const d = safeParseDate(conv.updated_at || conv.created_at);
                      return d
                        ? t('mobileConsultations.lastUpdate', { date: formatDateInUserTimeZone(d, i18n.language) })
                        : t('mobileConsultations.noUpdates');
                    })()}
                    primaryTypographyProps={{ 
                      fontWeight: 'medium', 
                      noWrap: true,
                      color: 'primary.main',
                      sx: { 
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }
                    }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
                  />
                </ListItemButton>
                <Box sx={{ position: 'absolute', right: 8 }}>
                  <Tooltip title={t('mobileConsultations.editTitle')} placement="left" enterTouchDelay={0} leaveTouchDelay={1500}>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Trigger the same edit functionality as desktop
                        if (onEditItem) {
                          onEditItem(conv, e);
                        } else if (onUpdateTitle) {
                          // Alternative: prompt for new title and call onUpdateTitle
                          const newTitle = prompt(t('mobileConsultations.enterNewTitle'), conv.title || t('mobileConsultations.consultationDefault', { id: conv.id }));
                          if (newTitle && newTitle.trim() && newTitle.trim() !== conv.title) {
                            onUpdateTitle(conv.id, newTitle.trim());
                          }
                        } else {
                          console.log('Edit conversation title:', conv.id, conv.title);
                        }
                      }}
                    >
                      <EditIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            );})}
          </List>
        ) : (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
            {t('mobileConsultations.noConsultations')}
          </Typography>
        )}
      </Box>
    </Box>
  );
} 