// src/pages/ClinicianInfoPage.jsx

import React from 'react';
import { Container, Typography, Card, CardContent, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ClinicianInfoPage = () => {
  const { t } = useTranslation('pages');

  return (
  <Container maxWidth="sm" sx={{ py: 6 }}>
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('clinicianInfoPage.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('clinicianInfoPage.subtitle')}
        </Typography>
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            {t('clinicianInfoPage.description')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </Container>
  );
};

export default ClinicianInfoPage;