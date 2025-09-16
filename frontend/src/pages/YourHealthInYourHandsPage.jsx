import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, Link as MuiLink, Breadcrumbs } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import PanToolIcon from '@mui/icons-material/PanTool'; // Icon for empowerment

function YourHealthInYourHandsPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t } = useTranslation('pages');

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
              <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label={t('common:aria.breadcrumb')} sx={{ mb: 3 }}>
        <MuiLink component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('common:home')}
        </MuiLink>
        <Typography color="text.primary">{t('yourHealthInYourHandsPage.title')}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <PanToolIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'primary.main', mb: 1 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('yourHealthInYourHandsPage.mainHeading')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '750px', mx: 'auto' }}>
            {t('yourHealthInYourHandsPage.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              {t('yourHealthInYourHandsPage.sections.uniqueProfile.title')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.uniqueProfile.description1')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.uniqueProfile.description2')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              {t('yourHealthInYourHandsPage.sections.personalizedGoals.title')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.personalizedGoals.description1')}
            </Typography>
             <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.personalizedGoals.description2')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              {t('yourHealthInYourHandsPage.sections.diverseInsights.title')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.diverseInsights.description1')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
               {t('yourHealthInYourHandsPage.sections.diverseInsights.description2')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              {t('yourHealthInYourHandsPage.sections.proactivePartner.title')}
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.proactivePartner.description1')}
            </Typography>
             <Typography variant="body1" paragraph color="text.secondary">
              {t('yourHealthInYourHandsPage.sections.proactivePartner.description2')}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium' }}>
            {t('yourHealthInYourHandsPage.callToAction.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: '600px', mx: 'auto'}}>
            {t('yourHealthInYourHandsPage.callToAction.description')}
          </Typography>
          {/* Potential CTA button to Register or explore features could go here */}
        </Box>

      </Paper>
    </Container>
  );
}

export default YourHealthInYourHandsPage; 