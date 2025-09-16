// frontend/src/pages/PharmacistInfoPage.jsx
// Placeholder page for Pharmacist-specific information.

import React from 'react';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

function PharmacistInfoPage() {
  const { t } = useTranslation('pages');

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'secondary.main' }}>
        {t('pharmacistInfoPage.title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'secondary.dark' }}>
        {t('pharmacistInfoPage.description')}
      </Typography>
    </Container>
  );
}

export default PharmacistInfoPage; 