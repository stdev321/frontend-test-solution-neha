// frontend/src/assets/whitepapers/MentalHealthAIWhitePaperPage.jsx
// This page displays the detailed white paper on AI in Mental Health.
// It maintains the standard app layout (header/footer) and uses Material UI for styling.

import React, { useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, Divider, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import jsPDF from 'jspdf';
import logoImage from '../../assets/branding/full_logo_high.png' // High quality for whitepapers;

function MentalHealthAIWhitePaperPage() {
  const { t, i18n } = useTranslation('pages');
  
  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);
  const { setHeaderMode } = useHeaderVisibility();
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  const addWrappedText = (doc, text, x, y, maxWidth, options = {}) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, options);
    const fontSize = doc.internal.getFontSize();
    const lineHeightFactor = options.lineHeightFactor || 1.15;
    const textHeight = lines.length * fontSize * lineHeightFactor / doc.internal.scaleFactor;
    return y + textHeight;
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // ... PDF generation logic (can be complex) ...
      // For now, let's just confirm it works without breaking
      
      doc.save('VirtualMD_AI_Mental_Health_White_Paper.pdf');

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, direction: 'ltr' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={isGeneratingPdf ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? t('common:generating') : t('whitepapers.downloadPdf')}
        </Button>
      </Box>
      
      <Paper ref={contentRef} elevation={3} sx={{ p: { xs: 2, sm: 3, md: 5 }, bgcolor: '#1976d2', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
          {t('mentalHealthWhitepaper.title')}
        </Typography>
        
        <Typography variant="subtitle1" align="center" sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.8)' }}>
          <i>{t('mentalHealthWhitepaper.authors')}</i><br />
          {t('mentalHealthWhitepaper.organization')}
        </Typography>
        
        <Box sx={{ mb: 4, bgcolor: 'rgba(255, 255, 255, 0.1)', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>{t('mentalHealthWhitepaper.disclaimer.title')}</Typography>
          <Typography variant="body2" paragraph>{t('mentalHealthWhitepaper.disclaimer.text')}</Typography>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.abstract.title')}</Typography>
          <Typography variant="body1" paragraph>{t('mentalHealthWhitepaper.abstract.text')}</Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.introduction.title')}</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>{t('mentalHealthWhitepaper.introduction.text')}</Typography>
        </Box>
        
        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.methods.title')}</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>{t('mentalHealthWhitepaper.methods.text')}</Typography>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.results.title')}</Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>{t('mentalHealthWhitepaper.results.diagnosticSupport.title')}</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>{t('mentalHealthWhitepaper.results.diagnosticSupport.text')}</Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>{t('mentalHealthWhitepaper.results.therapeuticApplications.title')}</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>{t('mentalHealthWhitepaper.results.therapeuticApplications.text')}</Typography>
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 3 }}>{t('mentalHealthWhitepaper.results.patientMonitoring.title')}</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>{t('mentalHealthWhitepaper.results.patientMonitoring.text')}</Typography>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.discussion.title')}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{t('mentalHealthWhitepaper.discussion.text')}</Typography>
        </Box>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('mentalHealthWhitepaper.conclusion.title')}</Typography>
          <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>{t('mentalHealthWhitepaper.conclusion.text')}</Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default MentalHealthAIWhitePaperPage;