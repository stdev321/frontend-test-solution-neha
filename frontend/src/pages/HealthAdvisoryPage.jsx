import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';

function HealthAdvisoryPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t } = useTranslation('pages');

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  return (
    <Container maxWidth="md" sx={{ 
      py: { xs: 0, md: 5 },
      // Add padding top on mobile to account for fixed header
      pt: { xs: '70px', md: 5 },
      // Ensure full height on mobile
      minHeight: { xs: '100vh', md: 'auto' },
      px: { xs: 2, sm: 3, md: 4 }
    }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        // Remove elevation on mobile for better integration
        elevation: { xs: 0, md: 3 },
        // Ensure content fills mobile screen
        minHeight: { xs: 'calc(100vh - 70px)', md: 'auto' }
      }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('healthAdvisoryPage.title')}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            {t('healthAdvisoryPage.sections.consultation.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('healthAdvisoryPage.sections.consultation.description')}
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>{t('healthAdvisoryPage.sections.consultation.emergencyTitle')}</strong>
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.us')}</li>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.canada')}</li>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.uk')}</li>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.australia')}</li>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.israel')}</li>
            <li>{t('healthAdvisoryPage.sections.consultation.emergency.other')}</li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            {t('healthAdvisoryPage.sections.consultation.emergencyWarning')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            {t('healthAdvisoryPage.sections.technology.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('healthAdvisoryPage.sections.technology.description1')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('healthAdvisoryPage.sections.technology.description2')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('healthAdvisoryPage.sections.technology.description3')}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h5" gutterBottom color="error">
            {t('healthAdvisoryPage.sections.disclaimer.title')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('healthAdvisoryPage.sections.disclaimer.description')}
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>{t('healthAdvisoryPage.sections.disclaimer.points.noDiagnosis')}</li>
            <li>{t('healthAdvisoryPage.sections.disclaimer.points.mayContainErrors')}</li>
            <li>{t('healthAdvisoryPage.sections.disclaimer.points.requiresEvaluation')}</li>
            <li>{t('healthAdvisoryPage.sections.disclaimer.points.mayBeOutdated')}</li>
            <li>{t('healthAdvisoryPage.sections.disclaimer.points.uniqueCircumstances')}</li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            {t('healthAdvisoryPage.sections.disclaimer.userResponsibility')}
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 3 }}>
            {t('healthAdvisoryPage.sections.disclaimer.missionStatement')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default HealthAdvisoryPage;
