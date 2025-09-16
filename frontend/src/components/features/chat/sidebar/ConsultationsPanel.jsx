import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Tooltip,
  Alert,
  Checkbox,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import ConversationsList, { DefaultListSkeleton } from './ConversationsList';

const ConsultationsPanel = ({
  conversationId = null,
  conversationDetails = null,
  conversationsList,
  onUpdateTitle, // API call handler from parent (index.jsx) for the active conversation header title
  isListLoading,
  selectedIds,
  setSelectedIds,
  handleClickEditItem, // To trigger edit dialog in parent (index.jsx)
  handleClickDeleteItem, // To trigger delete dialog in parent (index.jsx)
  onTriggerMultiDelete, // To trigger multi-delete dialog in parent (index.jsx)
  dialogError = '', // Default here
  isActionInProgress, // To disable buttons during operations
}) => {
  const { t } = useTranslation('chat');
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    setNewTitle(conversationDetails?.title || '');
    setEditingTitle(false); // Reset editing state if conversationDetails change
    setTitleError('');
  }, [conversationDetails]);

  const handleEdit = () => setEditingTitle(true);

  const handleCancel = () => {
    setNewTitle(conversationDetails?.title || '');
    setEditingTitle(false);
    setTitleError('');
  };

  const handleSave = async () => {
    if (!conversationId || !newTitle.trim()) {
      setTitleError('Title cannot be empty.');
      return;
    }
    setTitleError('');
    try {
      // This onUpdateTitle is the prop passed from ChatSidebar, for updating the active conversation's header
      await onUpdateTitle(conversationId, newTitle.trim());
      setEditingTitle(false);
    } catch (err) {
      console.error('ConsultationsPanel: Header title update error:', err);
      setTitleError(err.message || 'Failed to update title.');
    }
  };

  // Calculate selection state
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;
  const totalCount = conversationsList?.length || 0;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  const someSelected = selectedCount > 0;

  const handleSelectAllToggle = () => {
    if (allSelected) {
      // Deselect all
      setSelectedIds({});
    } else {
      // Select all
      const allIds = conversationsList.reduce((acc, conv) => ({ ...acc, [conv.id]: true }), {});
      setSelectedIds(allIds);
    }
  };

  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{t('conversations.consultationsTitle')}</Typography>
      {/* Active Conversation Header */}
      {conversationId && conversationDetails && (
        <Paper elevation={2} sx={{ p: 2, mb: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {editingTitle ? (
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                error={!!titleError}
                helperText={titleError}
                sx={{ mr: 1 }}
                autoFocus
              />
            ) : (
              <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                {conversationDetails.title || t('conversations.consultationDefault', { id: conversationId })}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {editingTitle ? (
                <>
                  <Tooltip title={t('conversations.saveTitle')}>
                    <span>
                      <IconButton
                        edge="end"
                        aria-label={t('common:aria.save')}
                        onClick={handleSave}
                        size="small"
                        disabled={isActionInProgress}
                      >
                        <SaveIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('conversations.cancelEdit')}>
                    <span>
                      <IconButton
                        edge="end"
                        aria-label={t('common:aria.cancel')}
                        onClick={handleCancel}
                        size="small"
                        disabled={isActionInProgress}
                      >
                        <CancelIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title={t('conversations.editTitle')}>
                  <span>
                    <IconButton
                      edge="end"
                      aria-label={t('common:aria.edit')}
                      onClick={handleEdit}
                      size="small"
                      disabled={isActionInProgress}
                    >
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ID: {conversationId}
          </Typography>
        </Paper>
      )}

      {/* Simplified Selection Controls */}
      {conversationsList && conversationsList.length > 0 && (
        <Box sx={{ mb: 1.5, mt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected && !allSelected}
                onChange={handleSelectAllToggle}
                disabled={isActionInProgress}
                size="small"
              />
            </Box>
            {someSelected && (
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': {
                    opacity: 0.8
                  }
                }}
                onClick={onTriggerMultiDelete}
              >
                {t('dialogs.deleteSelected')} ({selectedCount})
              </Typography>
            )}
          </Box>
          <Divider />
        </Box>
      )}
      {dialogError && <Alert severity="warning" sx={{ mb: 1 }}>{dialogError}</Alert>}

      {/* Conversations List */}
      {isListLoading ? (
        <DefaultListSkeleton />
      ) : (
        <ConversationsList
          conversationsList={conversationsList}
          onEdit={handleClickEditItem} // Propagates to ChatSidebar's handler in index.jsx
          onDelete={handleClickDeleteItem} // Propagates to ChatSidebar's handler in index.jsx
          activeConversationId={conversationId} // Use conversationId directly
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          isLoading={isActionInProgress} // Disables list items during actions
        />
      )}
      {!isListLoading && conversationsList.length === 0 && (
        <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2 }}>
          {t('conversations.noConsultationsYet')}
        </Typography>
      )}
    </Box>
  );
};

ConsultationsPanel.propTypes = {
  conversationId: PropTypes.string,
  conversationDetails: PropTypes.object,
  conversationsList: PropTypes.array.isRequired,
  onUpdateTitle: PropTypes.func.isRequired, // For the active conversation header
  isListLoading: PropTypes.bool.isRequired,
  selectedIds: PropTypes.object.isRequired,
  setSelectedIds: PropTypes.func.isRequired,
  handleClickEditItem: PropTypes.func.isRequired,
  handleClickDeleteItem: PropTypes.func.isRequired,
  onTriggerMultiDelete: PropTypes.func.isRequired,
  dialogError: PropTypes.string,
  isActionInProgress: PropTypes.bool.isRequired,
};

export default ConsultationsPanel;
