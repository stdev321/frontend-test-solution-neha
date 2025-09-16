import React from 'react';
import SiteMeta from '../components/seo/SiteMeta';
import { Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, Button, Box, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ResearchPage = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const { t } = useTranslation(['pages', 'common']);
  
  // For square cards, we need to use a combination of properties
  const cardStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  
  const cardContentStyle = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 3, // Consistent padding
  };
  
  // Use aspect ratio to create square cards
  const cardWrapperStyle = {
    position: 'relative',
    paddingTop: '100%', // 1:1 aspect ratio
  };
  
  const cardSquareStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <>
      <SiteMeta
        title={t('researchPage.seoTitle', 'Research & Publications — VirtualMD AI Healthcare')}
        description={t('researchPage.seoDescription', 'Explore VirtualMD research: AI health imaging, pathology AI, dermatology AI, mental health AI, and healthcare technology research papers and studies.')}
        keywords={[
          'health AI research', 'healthcare AI studies', 'health imaging AI',
          'pathology AI research', 'dermatology AI', 'mental health AI research'
        ]}
        philippinesOptimized={true}
        breadcrumbs={[
          { name: 'Home', url: 'https://virtualmd.app' },
          { name: 'Research', url: 'https://virtualmd.app/research' }
        ]}
      />
      <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography 
        variant="h3" // Larger font
        component="h1" 
        gutterBottom 
        align="center"
        sx={{ 
          mb: 5,
          color: '#4385F4', // Brand blue color to stand out
          fontWeight: 'bold',
        }}
      >
        {t('researchPage.title')}
      </Typography>
      
      <Grid container spacing={3}>
        {/* Health Advisory Card */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {t('researchPage.healthAdvisory.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.healthAdvisory.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/health-advisory"
                    fullWidth
                  >
                    {t('researchPage.healthAdvisory.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* Imaging AI Card */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.imagingAI.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.imagingAI.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/whitepapers/imaging-ai-assist"
                    fullWidth
                  >
                    {t('researchPage.imagingAI.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* Pathology AI Card */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.pathologyAI.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.pathologyAI.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/whitepapers/pathology-ai-assist"
                    fullWidth
                  >
                    {t('researchPage.pathologyAI.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* Dermatology AI Card */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.dermatologyAI.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.dermatologyAI.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/whitepapers/dermatology-ai-assist"
                    fullWidth
                  >
                    {t('researchPage.dermatologyAI.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Mental Health AI Whitepaper Card (New) */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.mentalHealthAI.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.mentalHealthAI.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/research/mental-health-ai-whitepaper"
                    fullWidth
                  >
                    {t('researchPage.mentalHealthAI.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* Data Privacy White Paper Card (New) */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.dataPrivacy.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.dataPrivacy.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/data-privacy-whitepaper"
                    fullWidth
                  >
                    {t('researchPage.dataPrivacy.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* AI Accuracy Studies Card (Ensured link and text are correct) */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.aiAccuracy.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.aiAccuracy.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/research/ai-accuracy" 
                    fullWidth
                  >
                    {t('researchPage.aiAccuracy.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
        
        {/* AI for Laypeople Card */}
        <Grid item xs={12} sm={6} md={4} lg={isLargeScreen ? 3 : 4}>
          <Box sx={cardWrapperStyle}>
            <Card elevation={3} sx={cardSquareStyle}>
              <CardContent sx={cardContentStyle}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('researchPage.aiForLaypeople.title')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {t('researchPage.aiForLaypeople.description')}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/explainers/imaging-ai"
                    fullWidth
                  >
                    {t('researchPage.aiForLaypeople.button')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
    </>
  );
};

export default ResearchPage; 