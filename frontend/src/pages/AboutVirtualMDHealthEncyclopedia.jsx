import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function AboutVirtualMDHealthEncyclopedia() {
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
        <Typography color="text.primary">{t('aboutEncyclopediaPage.title')}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <MenuBookIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'primary.main', mb: 1 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('aboutEncyclopediaPage.mainHeading')}
          </Typography>
        </Box>

        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {t('aboutEncyclopediaPage.p1')}
        </Typography>
        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {t('aboutEncyclopediaPage.p2')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {t('aboutEncyclopediaPage.p3')}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
          {t('aboutEncyclopediaPage.p4')}
        </Typography>
      </Paper>
    </Container>
  );
}

export default AboutVirtualMDHealthEncyclopedia; 