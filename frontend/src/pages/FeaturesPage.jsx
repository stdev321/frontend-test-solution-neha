// frontend/src/pages/FeaturesPage.jsx
// Displays feature cards using InfoGrid.

import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import SiteMeta from '../components/seo/SiteMeta';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import BiotechIcon from '@mui/icons-material/Biotech';
import GroupsIcon from '@mui/icons-material/Groups';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoGrid from '../components/common/InfoGrid';
import { useTranslation } from 'react-i18next';

export default function FeaturesPage() {
  const { t } = useTranslation('pages');

  // Combined data for the feature cards
  const featuresItems = [
    {
      id: 'instant-wellness-insights',
      title: t('featuresPage.features.instantWellnessInsights.title'),
      description: t('featuresPage.features.instantWellnessInsights.description'),
      icon: <AutoAwesomeIcon fontSize="large" />,
      color: '#4385F4', // Blue
      link: null,
    },
    {
      id: 'holistic-wellness-picture',
      title: t('featuresPage.features.holisticWellnessPicture.title'),
      description: t('featuresPage.features.holisticWellnessPicture.description'),
      icon: <AllInclusiveIcon fontSize="large" />,
      color: '#5C70E2', // Blue-Purple
      link: null,
    },
    {
      id: 'diverse-ai-perspectives',
      title: t('featuresPage.features.diverseAIPerspectives.title'),
      description: t('featuresPage.features.diverseAIPerspectives.description'),
      icon: <DynamicFeedIcon fontSize="large" />,
      color: '#7B5BD9', // Purple
      link: null,
    },
    {
      id: 'ever-evolving-intelligence',
      title: t('featuresPage.features.everEvolvingIntelligence.title'),
      description: t('featuresPage.features.everEvolvingIntelligence.description'),
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#8E44AD', // A slightly different Purple for differentiation
      link: null,
    },
  ];

  return (
    <>
      <SiteMeta
        title={t('featuresPage.seoTitle', 'Features — VirtualMD AI Healthcare Platform')}
        description={t('featuresPage.seoDescription', 'Explore VirtualMD features: AI health consultations, specialist personas, multi-language support, and advanced healthcare technology. Available in the Philippines.')}
        keywords={[
          'AI healthcare features', 'health AI technology', 'virtual health advisor consultations',
          'healthcare platform features', 'health specialist AI', 'telemedicine features'
        ]}
        philippinesOptimized={true}
        breadcrumbs={[
          { name: 'Home', url: 'https://virtualmd.app' },
          { name: 'Features', url: 'https://virtualmd.app/features' }
        ]}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          {t('featuresPage.title', 'VirtualMD Features')}
        </Typography>
        
        <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ mb: 4 }}>
          {t('featuresPage.subtitle', 'Discover the powerful features that make VirtualMD your trusted AI health advisor')}
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};
