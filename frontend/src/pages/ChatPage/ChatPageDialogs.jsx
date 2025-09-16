import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  useTheme, 
  CircularProgress, 
  Button, 
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import VirtualMDLogo from '../../assets/branding/full_logo_medium.png' // Medium for component;
import { getAuth } from 'firebase/auth';
import { apiRequest, API_BASE_URL } from '../../services/api';

// Use high quality for dialog displays
const aileenCarolImage = `/persona_images/aileen-carol_high.png`;

export default function ChatPageDialogs({
  // Dialog states
  exitConfirmOpen,
  setExitConfirmOpen,
  moreInfoNeededDialogOpen,
  setMoreInfoNeededDialogOpen,
  showDeleteSuccessDialog,
  setShowDeleteSuccessDialog,
  summaryModalOpen,
  setSummaryModalOpen,
  logoutConfirmOpen,
  setLogoutConfirmOpen,
  shortConvEndDialogOpen,
  setShortConvEndDialogOpen,
  
  // Dialog content and actions
  isSummarizing,
  willSummarizeOnExit,
  isExiting,
  modalSummaryText,
  conversationDetails,
  
  // Action handlers
  onConfirmDeleteAndExit,
  onLeaveWithoutSummarizing,
  onConfirmExit,
  onLogoutAndDeleteConsult,
  onLogoutAndSaveConsult,
  
  // Snackbar props
  snackbarError,
  showSnackbar,
  handleCloseSnackbar,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation('chat');

  console.log('ChatPageDialogs: Rendering with logoutConfirmOpen =', logoutConfirmOpen);

  return (
    <>
      <Dialog
        open={exitConfirmOpen}
        onClose={() => setExitConfirmOpen(false)}
        aria-labelledby="finish-consult-dialog-title"
        maxWidth="md"
        fullWidth
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          }
        }}
      >
        {!isMobile && (
          <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                width: '180px',
                flexShrink: 0, 
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              <img 
                src={aileenCarolImage} 
                alt={t('common:alt.aiAssistant')} 
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top'
                }} 
              />
            </Box>
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <DialogTitle id="finish-consult-dialog-title" sx={{ p: 0, mb: 1}}>
                {isSummarizing ? t('dialogs.summarizing') : (willSummarizeOnExit ? t('dialogs.finishConsultationTitle') : t('dialogs.doneAlready'))}
              </DialogTitle>
              <DialogContentText component="div" id="finish-consult-dialog-description" sx={{flexGrow: 1, mb: 2}}>
                {isSummarizing ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" align="center">
                      {t('dialogs.generatingSummary')}
                    </Typography>
                  </Box>
                ) : willSummarizeOnExit ? (
                  t('dialogs.finishConsultationMessage')
                ) : (
                  <>
                    <Typography variant="body2" component="p" gutterBottom>
                      {t('dialogs.doneAlreadyMessage')}
                    </Typography>
                    <Typography variant="caption" component="p" sx={{ fontStyle: 'italic' }}>
                      &mdash; {t('dialogs.doneAlreadySignature')}
                    </Typography>
                  </>
                )}
              </DialogContentText>
              <DialogActions sx={{ p: 2, pt:1, justifyContent: 'flex-end' }}>
                {!isSummarizing && (
                  <Button 
                    onClick={() => setExitConfirmOpen(false)} 
                    variant="text" 
                    disabled={isExiting}
                    sx={{ mr: 1 }}
                  >
                    {t('dialogs.cancel')}
                  </Button>
                )}

                {!isSummarizing && willSummarizeOnExit ? (
                  <>
                    <Button 
                      onClick={onConfirmDeleteAndExit} 
                      variant="outlined" 
                      disabled={isExiting}
                      sx={{ mr: 1 }}
                    >
                      {isExiting ? <CircularProgress size={20}/> : t('dialogs.deleteConversation')}
                    </Button>
                    <Button 
                      onClick={onLeaveWithoutSummarizing} 
                      variant="outlined" 
                      disabled={isExiting}
                      sx={{ mr: 1 }}
                    >
                      {isExiting ? <CircularProgress size={20}/> : t('dialogs.leaveWithoutSummarizing')}
                    </Button>
                    <Button 
                      onClick={onConfirmExit}
                      variant="contained" 
                      disabled={isExiting}
                    >
                      {isExiting ? <CircularProgress size={20}/> : t('dialogs.summarize')}
                    </Button>
                  </>
                ) : !isSummarizing ? (
                  <Button 
                    onClick={onLeaveWithoutSummarizing}
                    variant="outlined" 
                    disabled={isExiting} 
                  >
                    {t('dialogs.exitConsultationButton')}
                  </Button>
                ) : null}
              </DialogActions>
            </Box>
          </DialogContent>
        )}

        {isMobile && (
          <DialogContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <Avatar 
                src={aileenCarolImage}
                alt={t('common:alt.aiDoctor')}
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 2,
                  border: '2px solid white',
                  boxShadow: 2
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {t('dialogs.aileenCarol')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                  {t('dialogs.aiHealthAssistant')}
                </Typography>
              </Box>
            </Box>

            <DialogTitle id="finish-consult-dialog-title" sx={{ p: 0, mb: 2, textAlign: 'center' }}>
              {isSummarizing ? t('dialogs.summarizing') : (willSummarizeOnExit ? t('dialogs.finishConsultationTitle') : t('dialogs.doneAlready'))}
            </DialogTitle>
            
            <DialogContentText component="div" sx={{ mb: 3, textAlign: 'center' }}>
              {isSummarizing ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" align="center">
                    {t('dialogs.generatingSummary')}
                  </Typography>
                </Box>
              ) : willSummarizeOnExit ? (
                t('dialogs.finishConsultationMessage')
              ) : (
                <>
                  <Typography variant="body2" component="p" gutterBottom>
                    {t('dialogs.doneAlreadyMessage')}
                  </Typography>
                  <Typography variant="caption" component="p" sx={{ fontStyle: 'italic' }}>
                    &mdash; {t('dialogs.doneAlreadySignature')}
                  </Typography>
                </>
              )}
            </DialogContentText>

            <DialogActions sx={{ 
              flexDirection: 'column',
              gap: 1,
              p: 0
            }}>
              {!isSummarizing && (
                <Button 
                  onClick={() => setExitConfirmOpen(false)} 
                  variant="outlined" 
                  disabled={isExiting}
                  fullWidth
                  sx={{ order: 3 }}
                >
                  {t('dialogs.cancel')}
                </Button>
              )}

              {!isSummarizing && willSummarizeOnExit ? (
                <>
                  <Button 
                    onClick={onConfirmExit}
                    variant="contained" 
                    disabled={isExiting}
                    fullWidth
                    sx={{ order: 1 }}
                  >
                    {isExiting ? <CircularProgress size={20}/> : t('dialogs.summarizeAndFinish')}
                  </Button>
                  <Button 
                    onClick={onLeaveWithoutSummarizing} 
                    variant="outlined" 
                    disabled={isExiting}
                    fullWidth
                    sx={{ order: 2 }}
                  >
                    {isExiting ? <CircularProgress size={20}/> : t('dialogs.leaveWithoutSummarizing')}
                  </Button>
                  <Button 
                    onClick={onConfirmDeleteAndExit} 
                    variant="text" 
                    disabled={isExiting}
                    fullWidth
                    sx={{ order: 4, color: 'error.main' }}
                  >
                    {isExiting ? <CircularProgress size={20}/> : t('dialogs.deleteConversation')}
                  </Button>
                </>
              ) : !isSummarizing ? (
                <Button 
                  onClick={onLeaveWithoutSummarizing}
                  variant="contained" 
                  disabled={isExiting} 
                  fullWidth
                  sx={{ order: 1 }}
                >
                  {t('dialogs.exitConsultationButton')}
                </Button>
              ) : null}
            </DialogActions>
          </DialogContent>
        )}
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={typeof snackbarError === 'string' ? snackbarError : (snackbarError?.message || 'An error occurred')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog
        open={moreInfoNeededDialogOpen}
        onClose={() => {
          console.log('More info dialog: Close button clicked');
          setMoreInfoNeededDialogOpen(false);
        }}
        aria-labelledby="more-info-dialog-title"
        aria-describedby="more-info-dialog-description"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          }
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
      >
        <DialogTitle id="more-info-dialog-title">
          {t('dialogs.moreInfoTitle')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
          <Box 
            sx={{ 
              width: '150px',
              flexShrink: 0, 
              display: 'flex',
              alignItems: 'stretch',
            }}
          >
            <img 
              src={aileenCarolImage} 
              alt={t('common:alt.aiAssistant')} 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top'
              }} 
            />
          </Box>
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
            <DialogContentText id="more-info-dialog-description">
              {t('dialogs.moreInfoMessage')}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMoreInfoNeededDialogOpen(false)} autoFocus>
            {t('dialogs.ok')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteSuccessDialog}
        onClose={() => setShowDeleteSuccessDialog(false)}
        aria-labelledby="delete-success-dialog-title"
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: '320px',
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                width: '120px',
                flexShrink: 0, 
                display: 'flex',
                alignItems: 'stretch', 
              }}
            >
              <img 
                src={aileenCarolImage} 
                alt={t('common:alt.aiAssistant')} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  objectPosition: 'center top'
                }} 
              />
            </Box>
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <DialogTitle id="delete-success-dialog-title" sx={{p:0, mb:1, textAlign: 'center'}}>
                {t('dialogs.deleteSuccessTitle')}
              </DialogTitle>
              <DialogContentText sx={{textAlign: 'center', mb:2}}>
                {t('dialogs.deleteSuccessMessage')}
              </DialogContentText>
              <DialogActions sx={{justifyContent: 'center', p:0}}>
                <Button onClick={() => setShowDeleteSuccessDialog(false)} variant="contained" autoFocus>
                  {t('dialogs.ok')}
                </Button>
              </DialogActions>
            </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={logoutConfirmOpen}
        onClose={() => {
          console.log('Logout dialog: Close button clicked');
          setLogoutConfirmOpen(false);
        }}
        aria-labelledby="logout-confirm-dialog-title"
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: '12px',
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          } 
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
      >
        {!isMobile && (
          <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                width: '180px',
                flexShrink: 0, 
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              <img 
                src={aileenCarolImage} 
                alt={t('common:alt.aiAssistant')} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  objectPosition: 'center top'
                }} 
              />
            </Box>
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <DialogTitle id="logout-confirm-dialog-title" sx={{ p: 0, mb: 1}}>
                {t('dialogs.logoutTitle')}
              </DialogTitle>
              <DialogContentText component="div" sx={{flexGrow:1, mb:2}}>
                {t('dialogs.logoutMessage')}
              </DialogContentText>
              <DialogActions sx={{ p: 2, pt:1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setLogoutConfirmOpen(false)} variant="text" sx={{ mr: 1 }}>{t('dialogs.cancel')}</Button>
                <Button onClick={onLogoutAndDeleteConsult} variant="outlined" sx={{ mr: 1 }}>
                  {t('dialogs.deleteAndExit')}
                </Button>
                <Button onClick={onLogoutAndSaveConsult} variant="contained">
                  {t('dialogs.saveAndExit')}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        )}

        {isMobile && (
          <DialogContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <Avatar 
                src={aileenCarolImage}
                alt={t('common:alt.aiDoctor')}
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 2,
                  border: '2px solid white',
                  boxShadow: 2
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {t('dialogs.aileenCarol')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f8c8d' }}>
                  {t('dialogs.aiHealthSpecialist')}
                </Typography>
              </Box>
            </Box>

            <DialogTitle id="logout-confirm-dialog-title" sx={{ p: 0, mb: 2, textAlign: 'center' }}>
              {t('dialogs.logoutTitle')}
            </DialogTitle>
            
            <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
              {t('dialogs.logoutMessage')}
            </DialogContentText>

            <DialogActions sx={{ 
              flexDirection: 'column',
              gap: 1,
              p: 0
            }}>
              <Button 
                onClick={onLogoutAndSaveConsult}
                variant="contained" 
                fullWidth
                sx={{ order: 1 }}
              >
                {t('dialogs.saveAndExit')}
              </Button>
              
              <Button 
                onClick={onLogoutAndDeleteConsult}
                variant="outlined" 
                fullWidth
                sx={{ 
                  order: 2,
                  color: 'error.main',
                  borderColor: 'error.main',
                  '&:hover': {
                    borderColor: 'error.dark',
                    bgcolor: 'rgba(244, 67, 54, 0.04)'
                  }
                }}
              >
                {t('dialogs.deleteAndExit')}
              </Button>
              
              <Button 
                onClick={() => setLogoutConfirmOpen(false)}
                variant="text" 
                fullWidth
                sx={{ order: 3, mt: 1 }}
              >
                {t('dialogs.cancel')}
              </Button>
            </DialogActions>
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        aria-labelledby="summary-modal-dialog-title"
        maxWidth="lg"
        fullWidth
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            height: '80vh',
            zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
          }
        }}
      >
        <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden', height: '100%' }}>
            <Box 
              sx={{ 
                width: '200px',
                flexShrink: 0, 
                display: 'flex',
                alignItems: 'stretch',
                '@media print': { display: 'none' }
              }}
            >
              <img 
                src={aileenCarolImage} 
                alt={t('common:alt.aiAssistant')} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover', 
                  objectPosition: 'center top'
                }} 
              />
            </Box>
            <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <img src={VirtualMDLogo} alt={t('common:alt.logo')} style={{ maxWidth: '180px', height: 'auto' }} />
              </Box>
              <DialogTitle id="summary-modal-dialog-title" sx={{p:0, mb: 1, textAlign: 'center'}}>
                {t('dialogs.summaryTitle')}
              </DialogTitle>
              {conversationDetails?.title && (
                <Typography variant="subtitle1" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {t('dialogs.consultationTitle', { title: conversationDetails.title })}
                </Typography>
              )}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, px:1 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{modalSummaryText || t('dialogs.summaryUnavailable')}</ReactMarkdown>
              </Box>
              <DialogActions sx={{justifyContent: 'center', p:0, pt:1, borderTop: `1px solid ${theme.palette.divider}`, '@media print': { display: 'none' }}}>
                <Button onClick={() => window.print()} variant="outlined" sx={{mr:1}}>{t('dialogs.print')}</Button>
                <Button onClick={() => navigator.clipboard.writeText(modalSummaryText || '')} variant="outlined" sx={{mr:1}}>{t('dialogs.copy')}</Button>
                <Button 
                  onClick={() => {
                    setSummaryModalOpen(false);
                  }}
                  variant="contained" 
                  autoFocus
                >
                  {t('dialogs.close')}
                </Button>
              </DialogActions>
            </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={shortConvEndDialogOpen}
        onClose={() => setShortConvEndDialogOpen(false)}
        aria-labelledby="short-conv-dialog-title"
        sx={{
          zIndex: (theme) => theme.zIndex.modal // Use Material-UI's modal z-index
        }}
        PaperProps={{ sx: { borderRadius: '12px', minWidth: '320px', zIndex: (theme) => theme.zIndex.modal } }}
      >
        <DialogContent sx={{ display: 'flex', p: 0, overflow: 'hidden' }}>
          <Box sx={{ width: '120px', flexShrink: 0, display: 'flex', alignItems: 'stretch' }}>
            <img
              src={aileenCarolImage}
              alt={t('common:alt.aiAssistant')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          </Box>
          <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <DialogTitle id="short-conv-dialog-title" sx={{ p: 0, mb: 1, textAlign: 'center' }}>
              {t('dialogs.shortConv.title')}
            </DialogTitle>
            <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
              {t('dialogs.shortConv.messageLine1')}
              <br />
              {t('dialogs.shortConv.messageLine2')}
            </DialogContentText>
            <DialogActions sx={{ justifyContent: 'center', p: 0 }}>
              <Button onClick={() => setShortConvEndDialogOpen(false)} variant="contained" autoFocus>
                {t('dialogs.ok')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
