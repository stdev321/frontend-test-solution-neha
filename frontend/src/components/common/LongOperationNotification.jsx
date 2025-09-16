import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useTranslation } from 'react-i18next';

export function ProcessingNotification({ type, open, onClose }) {
  const { t } = useTranslation('chat');
  
  const getMessage = () => {
    switch(type) {
      case 'summary':
        return t('longOperation.generatingSummary', 'Generating summary...');
      case 'differentialOpinion':
        return t('longOperation.gettingDifferentialOpinion', 'Getting differential opinion...');
      default:
        return t('longOperation.processing', 'Processing...');
    }
  };

  const getTimeEstimate = () => {
    switch(type) {
      case 'summary':
      case 'differentialOpinion':
        return t('longOperation.timeEstimate', 'This usually takes 30-60 seconds');
      default:
        return '';
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={open}
      sx={{
        top: { xs: 80, sm: 90 }, // Position below header
        '& .MuiSnackbarContent-root': {
          padding: 0
        }
      }}
    >
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 2,
          minWidth: 300,
          maxWidth: 400,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider'
        }}
      >
        {/* Thinking animation */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ThinkingIndicator size="small" />
        </Box>
        
        {/* Message */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body1" fontWeight="medium">
            {getMessage()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {getTimeEstimate()}
          </Typography>
        </Box>
        
        {/* Optional close button */}
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Paper>
    </Snackbar>
  );
}

export function CompletionDialog({ 
  type, 
  open, 
  onViewNow, 
  onContinue,
  error = null 
}) {
  const { t } = useTranslation('chat');
  
  const getTitle = () => {
    if (error) {
      return t('longOperation.error', 'Something went wrong');
    }
    
    switch(type) {
      case 'summary':
        return t('longOperation.summaryReady', '✓ Summary Ready!');
      case 'differentialOpinion':
        return t('longOperation.differentialOpinionReady', '✓ Differential Opinion Ready!');
      default:
        return t('longOperation.ready', '✓ Ready!');
    }
  };

  const getContent = () => {
    if (error) {
      return t('longOperation.errorMessage', 'Unable to complete the operation. Please try again.');
    }
    
    switch(type) {
      case 'summary':
        return t('longOperation.summaryComplete', 'Your consultation summary has been generated. Would you like to view it now?');
      case 'differentialOpinion':
        return t('longOperation.DifferentialOpinionComplete', 'The differential opinion has been prepared. Would you like to view it now?');
      default:
        return t('longOperation.complete', 'The operation is complete. Would you like to view the results?');
    }
  };

  const getViewButtonText = () => {
    switch(type) {
      case 'summary':
        return t('longOperation.viewSummary', 'View Summary');
      case 'differentialOpinion':
        return t('longOperation.viewDifferentialOpinion', 'View Differential Opinion');
      default:
        return t('longOperation.viewResults', 'View Results');
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          mx: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {getTitle()}
      </DialogTitle>
      <DialogContent>
        <Typography color={error ? 'error' : 'text.primary'}>
          {getContent()}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {error ? (
          <Button onClick={onContinue} variant="contained">
            {t('longOperation.ok', 'OK')}
          </Button>
        ) : (
          <>
            <Button onClick={onContinue}>
              {t('longOperation.continueChat', 'Continue in Chat')}
            </Button>
            <Button 
              variant="contained" 
              onClick={onViewNow}
              sx={{ ml: 1 }}
            >
              {getViewButtonText()}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Hook to manage long operations
export function useLongOperation() {
  const [operation, setOperation] = React.useState({
    type: null,
    status: 'idle', // 'idle', 'processing', 'complete', 'error'
    data: null,
    error: null
  });

  const startOperation = (type) => {
    setOperation({
      type,
      status: 'processing',
      data: null,
      error: null
    });
  };

  const completeOperation = (data) => {
    setOperation(prev => ({
      ...prev,
      status: 'complete',
      data
    }));
  };

  const failOperation = (error) => {
    setOperation(prev => ({
      ...prev,
      status: 'error',
      error
    }));
  };

  const resetOperation = () => {
    setOperation({
      type: null,
      status: 'idle',
      data: null,
      error: null
    });
  };

  return {
    operation,
    startOperation,
    completeOperation,
    failOperation,
    resetOperation
  };
}