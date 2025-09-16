import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider, Link as MuiLink, Breadcrumbs } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function EncyclopediaVirtualMDPage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t } = useTranslation('pages');

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  const sectionStyles = {
    my: 4,
  };

  const exampleStyles = {
    my: 4,
    p: 3,
    bgcolor: 'rgba(0, 0, 0, 0.03)',
    borderLeft: `4px solid ${'#673AB7'}`,
    borderRadius: 1,
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label={t('common:aria.breadcrumb')} sx={{ mb: 3 }}>
        <MuiLink component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }} color="inherit">
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('common:home')}
        </MuiLink>
        <Typography color="text.primary">{t('encyclopediaPage.title')}</Typography>
      </Breadcrumbs>

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4, md: 5 }, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <MenuBookIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'primary.main', mb: 1 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {t('encyclopediaPage.mainHeading')}
          </Typography>
        </Box>

        <Box sx={sectionStyles}>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {t('encyclopediaPage.p1')}
          </Typography>
        </Box>

        <Divider />

        <Box sx={sectionStyles}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('encyclopediaPage.subtitle')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {t('encyclopediaPage.p2')}
          </Typography>
        </Box>

        <Box sx={exampleStyles}>
          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
            {t('encyclopediaPage.exampleTitle')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ fontStyle: 'italic', fontSize: '1.1rem', lineHeight: 1.7 }}>
            {t('encyclopediaPage.exampleText')}
          </Typography>
        </Box>

        <Box sx={sectionStyles}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('encyclopediaPage.uniqueTitle')}
          </Typography>
          <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
            {t('encyclopediaPage.p3')}
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}

export default EncyclopediaVirtualMDPage;
