import React from 'react';
import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  ListItemIcon,
  IconButton, 
  Typography, 
  Box, 
  Checkbox, 
  Tooltip, 
  Skeleton,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { safeParseDate, formatDateInUserTimeZone } from '../../../../utils/safeDate';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ConversationsList = ({
  conversationsList,
  isLoading,
  navigate,
  onEdit,
  onDelete,
  disabledActions,
  activeConversationId,
  selectedIds,
  onSelectedIdsChange
}) => {
  const { t } = useTranslation('chat');
  console.log('ConversationsList received disabledActions:', disabledActions);

  if (!conversationsList || conversationsList.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', mt: 2}}>
          {t('conversations.noPastConsultations')}
      </Typography>
    );
  }

  return (
    <List disablePadding sx={{ opacity: disabledActions ? 0.7 : 1 }}>
      {conversationsList.map(conv => {
        const isActive = conv.id === activeConversationId;
        const baseTitle = conv.title || t('conversations.consultationDefault', { id: conv.id });
        const hasCount = typeof conv.message_count === 'number' && !isNaN(conv.message_count);
        const displayTitle = hasCount ? `${baseTitle} (${conv.message_count})` : baseTitle;

        return (
        <ListItem
            key={conv.id}
            disablePadding
            sx={{
              mb: 0.5,
              bgcolor: isActive ? 'action.selected' : 'transparent',
              borderRadius: 1
            }}
            secondaryAction={
              // Made Box always present, visibility depends on content
              <Box>
                <Tooltip title={t('conversations.editTitle')}>
                  {/* Span needed for tooltip on disabled button */}
                  <span>
                    <IconButton
                      edge="end"
                      aria-label={t('common:aria.edit')}
                      onClick={(e) => {
                        console.log('ConversationsListDisplay: Edit clicked for', conv.id);
                        e.stopPropagation();
                        onEdit(conv, e);
                      }}
                      size="small"
                      sx={{ mr: 0.5 }}
                      disabled={disabledActions} // Still respects disabled state
                    >
                      <EditIcon fontSize="small"/>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('conversations.deleteConsultation')}>
                  {/* Span needed for tooltip on disabled button */}
                  <span>
                   <IconButton
                     edge="end"
                     aria-label={t('common:aria.delete')}
                     onClick={(e) => {
                       console.log('ConversationsListDisplay: Delete clicked for', conv.id);
                       e.stopPropagation();
                       onDelete(conv);
                     }}
                     size="small"
                     disabled={disabledActions} // Still respects disabled state
                    >
                     <DeleteIcon fontSize="small"/>
                   </IconButton>
                  </span>
                </Tooltip>
              </Box>
            }
        >
           <ListItemIcon sx={{ minWidth: 'auto', mr: 0.5, pl: 0.5 }}>
              <Checkbox
                edge="start"
                checked={selectedIds[conv.id] || false}
                tabIndex={-1}
                disableRipple
                inputProps={{ 'aria-labelledby': `conv-label-${conv.id}` }}
                onChange={(event) => {
                  event.stopPropagation();
                  if (onSelectedIdsChange) {
                    onSelectedIdsChange(prev => ({...prev, [conv.id]: event.target.checked}));
                  } else {
                    console.error("onSelectedIdsChange is not defined in ConversationsList");
                  }
                }}
                onClick={(event) => event.stopPropagation()}
                disabled={disabledActions}
                size="small"
              />
           </ListItemIcon>
           <Tooltip title={t('conversations.clickToReturn')} placement="bottom-start">
             <span style={{ display: 'block', width: '100%' }}>
               <ListItemButton
                  onClick={() => {
                     console.log(`ConversationsListDisplay: FORCE NAVIGATING to /chat/${conv.id}`);
                     // navigate(`/chat/${conv.id}`); // Comment out for test
                     window.location.href = `/chat/${conv.id}`; // Force reload
                  }}
                  sx={{
                    borderRadius: 1,
                    pr: '70px' // Keep enough space for buttons for now
                  }}
                  disabled={disabledActions}
               >
                   <ListItemText
                       primary={displayTitle} 
                       secondary={(() => {
                          const d = safeParseDate(conv.updated_at || conv.created_at);
                          return d
                            ? t('conversations.lastUpdate', { date: formatDateInUserTimeZone(d) })
                            : t('mobileConsultations.noUpdates');
                        })()}
                       primaryTypographyProps={{ 
                         fontWeight: isActive ? 'bold' : 'medium', 
                         noWrap: true,
                         id: `conv-label-${conv.id}`
                        }}
                       secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
                    />
               </ListItemButton>
             </span>
           </Tooltip>
        </ListItem>
      );
    })}
  </List>
  );
};

// Also include the loading skeleton that's used with the conversations list
export const DefaultListSkeleton = () => (
  <>
      <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
      <Divider sx={{ mb: 2 }} />
      {[1, 2, 3, 4, 5].map(i => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="text" width="100%" height={40} />
        </Box>
      ))}
  </>
);

export default ConversationsList;