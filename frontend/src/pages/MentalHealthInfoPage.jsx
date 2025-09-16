// frontend/src/pages/MentalHealthInfoPage.jsx
// Placeholder page for Mental Health Specialist-specific information.

import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

function MentalHealthInfoPage() {
  const { t } = useTranslation('pages');

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'secondary.main' }}>
        {t('mentalHealthInfoPage.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'secondary.dark' }}>
        {t('mentalHealthInfoPage.description')}
      </Typography>
    </Container>
  );
}

export default MentalHealthInfoPage; 