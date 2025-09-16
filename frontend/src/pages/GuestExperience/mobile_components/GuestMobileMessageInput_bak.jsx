import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Alert,
  Collapse,
  Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';

function GuestMobileMessageInputComponent({
  value = '',
  onChange,
  onSend,
  isConnected = true,
  isThinking = false,
  sessionStats = null,
  disabled = false,
}) {
  const [showWarning, setShowWarning] = useState(false);

  // Show warning when low on time (30 seconds)
  React.useEffect(() => {
    if (sessionStats && sessionStats.time_remaining_seconds <= 30 && sessionStats.time_remaining_seconds > 0) {
      setShowWarning(true);
    }
  }, [sessionStats]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = value?.trim();
    if (!text) return;
    onSend?.(text);
  };

  const isDisabled = disabled || !isConnected || isThinking;
  const hasText = value?.trim().length > 0;
  const messagesRemaining = sessionStats?.messages_remaining || 0;

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {/* Low time warning - 30 seconds */}
      <Collapse in={showWarning}>
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ 
            m: 1, 
            borderRadius: 2,
          }}
          action={
            <IconButton size="small" onClick={() => setShowWarning(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body2">
            Your session will expire in 30 seconds. Sign up to continue your consultation!
          </Typography>
        </Alert>
      </Collapse>

      {/* Session ended message */}
      {sessionStats && messagesRemaining === 0 && (
        <Alert severity="info" sx={{ m: 1, borderRadius: 2 }}>
          Your free session has ended. Create an account to continue chatting with our AI doctors.
        </Alert>
      )}

      {/* Input area */}
      <Box sx={{
        display: 'flex',
        alignItems: 'flex-end',
        p: 0.75,
        gap: 0.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={6}
          minRows={2}
          placeholder={
            messagesRemaining === 0 
              ? "Session ended - Create an account to continue"
              : isThinking 
              ? "AI is responding..."
              : "Type your health concern..."
          }
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || messagesRemaining === 0}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: messagesRemaining > 0 && messagesRemaining <= 5 ? (
              <InputAdornment position="start" sx={{ mr: 0.5 }}>
                <Typography variant="caption" color="warning.main">
                  {messagesRemaining} left
                </Typography>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              bgcolor: 'background.default',
              minHeight: '56px',
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '1rem',
              py: 1.125,
              px: 1.25
            }
          }}
        />
        
        {/* Send button */}
        <IconButton
          size="large" 
          onClick={handleSend} 
          disabled={isDisabled || !hasText || messagesRemaining === 0} 
          sx={{ 
            minWidth: 40,
            minHeight: 40,
            p: 0.75,
            color: hasText && !isDisabled && messagesRemaining > 0
              ? 'primary.main'
              : 'action.disabled',
            '&:hover': {
              backgroundColor: 'transparent'
            }
          }}
        >
          <SendIcon sx={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
}

export const GuestMobileMessageInput = GuestMobileMessageInputComponent;
export default GuestMobileMessageInputComponent;