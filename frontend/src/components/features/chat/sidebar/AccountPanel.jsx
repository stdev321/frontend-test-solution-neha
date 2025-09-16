import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Alert } from '@mui/material';
import { CompactThinkingIndicator } from '../../../common/ThinkingIndicator';

function AccountPanel({ onDeleteAccount, deletionLoading=false, deletionError='' }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { t } = useTranslation('chat');

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{fontWeight:'bold'}}>{t('account.title')}</Typography>
      <Typography variant="body2" sx={{mb:2}}>
        {t('account.description')}
      </Typography>
      {deletionError && <Alert severity="error" sx={{mb:2}}>{deletionError}</Alert>}
      <Button variant="outlined" color="error" onClick={()=> setConfirmOpen(true)} disabled={deletionLoading}>
        {deletionLoading ? <CompactThinkingIndicator /> : t('account.deleteMyAccount')}
      </Button>

      <Dialog open={confirmOpen} onClose={()=> setConfirmOpen(false)}>
        <DialogTitle>{t('account.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('account.confirmDeleteText')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=> setConfirmOpen(false)} disabled={deletionLoading}>{t('account.cancel')}</Button>
          <Button onClick={()=> { if(onDeleteAccount) onDeleteAccount(); }} color="error" disabled={deletionLoading}>
            {deletionLoading ? <CompactThinkingIndicator /> : t('account.yesDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AccountPanel; 