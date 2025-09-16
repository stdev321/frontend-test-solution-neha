import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Box, Typography, Button, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '80%', md: '700px' }, 
  maxHeight: '90vh', // Limits modal height to 90% of viewport height
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 0, 
  display: 'flex',
  flexDirection: 'column'
};

const contentStyle = {
  overflowY: 'auto', // Ensures vertical scrollbar if content overflows
  p: 2, 
  whiteSpace: 'pre-wrap', 
  fontFamily: 'monospace', 
  fontSize: '0.65rem',    
  color: '#000',          
  backgroundColor: '#fff',
  flexGrow: 1, // Allows this content area to grow and shrink
  minHeight: '200px', // Arbitrary min height to ensure it's not too small
  // The actual height will be determined by flexbox based on modalStyle.maxHeight
};

const headerStyle = {
  p: 1.5,
  borderBottom: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const footerStyle = {
  p: 1.5,
  borderTop: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1
};

function TermsAgreementModal({ open, onClose, onAgree, termsText, termsContent }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef(null);
  const { t } = useTranslation('pages');

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Add a small tolerance (e.g., 1px) for scroll calculations
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        setScrolledToBottom(true);
      }
    }
  };

  useEffect(() => {
    // Reset scrolledToBottom when modal is opened or terms content changes
    if (open) {
      setScrolledToBottom(false);
      // If content is short and already at bottom, enable button
      setTimeout(() => {
        if (contentRef.current && contentRef.current.scrollHeight <= contentRef.current.clientHeight) {
          setScrolledToBottom(true);
        }
      }, 100); // Increased timeout to allow React content to render
    }
  }, [open, termsText, termsContent]);

  return (
    <Modal
      open={open}
      onClose={onClose} // Allow closing by clicking backdrop, though we have a button
      aria-labelledby="terms-agreement-modal-title"
      aria-describedby="terms-agreement-modal-description"
    >
      <Box sx={modalStyle}>
        <Paper elevation={0} sx={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden'}}>
            <Box sx={headerStyle}>
                <Typography id="terms-agreement-modal-title" variant="h6" component="h2">
                    {t('registerPage.termsAndConditions')}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>
            
            <Box 
                ref={contentRef} 
                onScroll={handleScroll} 
                sx={contentStyle}
                id="terms-agreement-modal-description"
            >
                {termsContent || termsText}
            </Box>
            
            <Box sx={footerStyle}>
                <Button 
                    variant="outlined"
                    color="inherit"
                    onClick={onClose} 
                    sx={{
                        color: '#666 !important',
                        border: '1px solid #BDBDBD !important',
                        '&:hover': {
                            border: '1px solid #9E9E9E !important',
                            backgroundColor: 'rgba(0, 0, 0, 0.04) !important'
                        }
                    }}
                >
                    {t('common:common.close')}
                </Button>
                <Button 
                    variant="contained" 
                    onClick={onAgree} 
                    disabled={!scrolledToBottom}
                >
                    {t('registerPage.iAgree')}
                </Button>
            </Box>
        </Paper>
      </Box>
    </Modal>
  );
}

export default TermsAgreementModal; 