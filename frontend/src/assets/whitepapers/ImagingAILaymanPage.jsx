// frontend/src/assets/whitepapers/ImagingAILaymanPage.jsx
// Provides a simplified explanation of the AI in Diagnostic Imaging white paper for a lay audience.
// Uses clear language and analogies.

import React, { useEffect } from 'react';
import { Container, Paper, Typography, Box, Divider, Grid, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useHeaderVisibility, HEADER_MODES } from '../../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function ImagingAILaymanPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t, i18n } = useTranslation('pages');
  
  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(i18n.language);

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0); // Scroll to top
  }, [setHeaderMode]);

  return (
    <Container maxWidth="md" sx={{ direction: 'ltr', py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'primary.main' }}>
          {t('imagingAIExplainer.title')}
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 1 }}>
          {t('imagingAIExplainer.subtitle')}
        </Typography>
        
        {/* Author Information */}
        <Typography variant="caption" align="center" color="text.secondary" display="block" sx={{ mb: 3 }}>
          {t('imagingAIExplainer.author')}
        </Typography>

        <Divider sx={{ my: 4 }} />

        {/* What is Medical Imaging? */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('imagingAIExplainer.whatIsImaging.title')}</Typography>
          <Typography variant="body1" paragraph>
            {t('imagingAIExplainer.whatIsImaging.intro')}
          </Typography>
          <Typography variant="body1" paragraph>{t('imagingAIExplainer.whatIsImaging.typesIntro')}</Typography>
          <ul>
            <li>{t('imagingAIExplainer.whatIsImaging.types.xrays')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.ctScans')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.mriScans')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.ultrasound')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.microscope')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.eyePhotos')}</li>
            <li>{t('imagingAIExplainer.whatIsImaging.types.cameraScopes')}</li>
          </ul>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {t('imagingAIExplainer.whatIsImaging.outro')}
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* What is AI? */}
        <Box sx={{ mb: 4 }}>
           <Typography variant="h5" component="h2" gutterBottom>{t('imagingAIExplainer.whatIsAI.title')}</Typography>
           <Typography variant="body1" paragraph>
             {t('imagingAIExplainer.whatIsAI.intro')}
           </Typography>
           <Typography variant="body1" paragraph>
             {t('imagingAIExplainer.whatIsAI.process')}
           </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* How AI Helps in Medical Imaging (Based on White Paper) */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('imagingAIExplainer.howAIHelps.title')}</Typography>
          <Typography variant="body1" paragraph>
            {t('imagingAIExplainer.howAIHelps.intro')}
          </Typography>

          <Accordion sx={{ my: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} /> <Typography sx={{ fontWeight: 'medium' }}>{t('imagingAIExplainer.howAIHelps.accuracy.title')}</Typography></AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.accuracy.description')}
              </Typography>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.accuracy.example')}
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ my: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><SpeedIcon sx={{ mr: 1, color: 'secondary.main' }} /> <Typography sx={{ fontWeight: 'medium' }}>{t('imagingAIExplainer.howAIHelps.speed.title')}</Typography></AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.speed.description')}
              </Typography>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.speed.example')}
              </Typography>
            </AccordionDetails>
          </Accordion>
          
          <Accordion sx={{ my: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main' }} /> <Typography sx={{ fontWeight: 'medium' }}>{t('imagingAIExplainer.howAIHelps.consistency.title')}</Typography></AccordionSummary>
            <AccordionDetails>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.consistency.description')}
              </Typography>
              <Typography paragraph>
                {t('imagingAIExplainer.howAIHelps.consistency.example')}
              </Typography>
            </AccordionDetails>
          </Accordion>

        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Challenges & Future */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>{t('imagingAIExplainer.challenges.title')}</Typography>
          <Typography variant="body1" paragraph>
            {t('imagingAIExplainer.challenges.intro')}
          </Typography>
          <ul>
            <li>{t('imagingAIExplainer.challenges.bias')}</li>
            <li>{t('imagingAIExplainer.challenges.uncommonCases')}</li>
            <li>{t('imagingAIExplainer.challenges.teamwork')}</li>
            <li>{t('imagingAIExplainer.challenges.regulation')}</li>
          </ul>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {t('imagingAIExplainer.challenges.outro')}
          </Typography>
        </Box>
        
         <Divider sx={{ my: 4 }} />
        
         <Box sx={{ mt: 4, textAlign: 'center' }}>
            <InfoIcon sx={{ color: 'info.main', fontSize: 40, mb: 1 }} />
            <Typography variant="h6">{t('imagingAIExplainer.conclusion.title')}</Typography>
            <Typography variant="body1">
              {t('imagingAIExplainer.conclusion.text')}
            </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default ImagingAILaymanPage; 