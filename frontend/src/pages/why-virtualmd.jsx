import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Paper, List, ListItem, Grid, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowDownward as ArrowDownwardIcon, PersonPinCircleOutlined as PersonPinCircleOutlinedIcon, SpaOutlined as SpaOutlinedIcon, LightbulbOutlined as LightbulbOutlinedIcon, MobileFriendlyOutlined as MobileFriendlyOutlinedIcon, SettingsSuggestOutlined as SettingsSuggestOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { blue, indigo, purple, green, teal } from '@mui/material/colors';
import { useTranslation } from 'react-i18next';

// Import images
// Use high quality logos for why-virtualmd page
import MainLogo from '../assets/branding/VMD_Logo_Transparent_high.png';
import VLogo from '../assets/branding/V_transparent_high.png';
import AthleteImage from '../assets/images/athlete.jpg';
import MedicalHeroImage from '../assets/images/medical-hero.jpg';

/**
 * Main body component between Header and Footer.
 * Scrollable sections with arrow navigation showcase VirtualMD.app.
 * Refactored with enhanced visuals, readability, and content.
 */
export default function WhyVirtualMDPage() {
  const theme = useTheme();
  const { t } = useTranslation('pages');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sections = [
    { id: 'hero', title: 'Welcome' },
    { id: 'why-us', title: 'Why Us?' },
    { id: 'features', title: 'Features' },
    { id: 'technology', title: 'Technology' },
    { id: 'cta', title: 'Get Started' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleScrollToNextSection = (currentSectionId) => {
    const currentIndex = sections.findIndex(section => section.id === currentSectionId);
    if (currentIndex !== -1 && currentIndex < sections.length - 1) {
      scrollToSection(sections[currentIndex + 1].id);
    }
  };

  const sectionPaperSx = {
    p: { xs: 2, sm: 4, md: 5 },
    borderRadius: theme.shape.borderRadius * 6,
    mb: 5,
    bgcolor: 'rgba(38, 50, 56, 0.85)',
    color: theme.palette.common.white,
    position: 'relative',
    overflow: 'hidden',
  };

  const imageOverlaySx = {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  };

  const contentUnderlaySx = {
    position: 'relative',
    zIndex: 2,
  };

  const newWhyUsPoints = [
    { title: t('whyVirtualMD.sections.whyUs.points.personalTeam.title'), text: t('whyVirtualMD.sections.whyUs.points.personalTeam.text'), icon: <SpaOutlinedIcon sx={{ fontSize: 48, color: green[300] }} />, bgColor: green[800] },
    { title: t('whyVirtualMD.sections.whyUs.points.aiNavigator.title'), text: t('whyVirtualMD.sections.whyUs.points.aiNavigator.text'), icon: <PersonPinCircleOutlinedIcon sx={{ fontSize: 48, color: blue[300] }} />, bgColor: blue[800] },
    { title: t('whyVirtualMD.sections.whyUs.points.empoweringChoices.title'), text: t('whyVirtualMD.sections.whyUs.points.empoweringChoices.text'), icon: <LightbulbOutlinedIcon sx={{ fontSize: 48, color: indigo[300] }} />, bgColor: indigo[800] },
    { title: t('whyVirtualMD.sections.whyUs.points.easyToUse.title'), text: t('whyVirtualMD.sections.whyUs.points.easyToUse.text'), icon: <MobileFriendlyOutlinedIcon sx={{ fontSize: 48, color: purple[300] }} />, bgColor: purple[800] },
    { title: t('whyVirtualMD.sections.whyUs.points.advancedTechnology.title'), text: t('whyVirtualMD.sections.whyUs.points.advancedTechnology.text'), icon: <SettingsSuggestOutlinedIcon sx={{ fontSize: 48, color: teal[300] }} />, bgColor: teal[800] },
  ];

  return (
    <Box sx={{
      bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#1A2327',
      color: theme.palette.common.white,
      pt: { xs: 1, md: 1.5 },
      pb: { xs: 2, md: 3 },
      borderTopLeftRadius: theme.shape.borderRadius * 5,
      borderTopRightRadius: theme.shape.borderRadius * 5,
      mt: -1,
    }}>
      <Container maxWidth="lg">
        <Box component="main" sx={{pt: {xs:2, md: 4}}}>
          {/* Hero Section */}
          <Paper id="hero" elevation={3} sx={{ ...sectionPaperSx, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Box sx={imageOverlaySx} />
            <Box sx={{ ...contentUnderlaySx, textAlign: 'center', py: {xs: 4, md: 6}, px: { xs: 1, sm: 2, md: 3 } }}>
              {isMobile && (
                <Box
                  component="img"
                  src={VLogo}
                  alt={t('common:alt.logo')}
                  sx={{
                    width: 'auto',
                    maxHeight: 80,
                    mb: 3,
                    filter: 'drop-shadow(0px 0px 5px rgba(0,0,0,0.5))',
                    maxWidth: '80%'
                  }}
                />
              )}
              <Typography variant="h1" component="h1" fontWeight="bold" gutterBottom color="inherit" sx={{ fontSize: { xs: '2.5rem', sm: '4rem', md: '4.5rem' }, px: { xs: 2, sm: 0 } }}>
                {t('whyVirtualMD.sections.hero.title')}
              </Typography>
              <Typography variant="h5" component="p" sx={{ maxWidth: { xs: '95%', sm: 'lg' }, mx: 'auto', mb: 4, color: theme.palette.grey[200], fontSize: { xs: '1rem', sm: '1.3rem', md: '1.5rem' }, lineHeight: 1.6, px: { xs: 1, sm: 2, md: 0 } }}>
                {t('whyVirtualMD.sections.hero.subtitle')}
              </Typography>
              <ArrowDownwardIcon onClick={() => handleScrollToNextSection('hero')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
            </Box>
            <style>{`@keyframes bounce {0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-12px); } 60% { transform: translateY(-6px); }}`}</style>
          </Paper>

          {/* Why Choose Us */}
          <Paper id="why-us" elevation={3} sx={{ ...sectionPaperSx, borderRadius: theme.shape.borderRadius * 8, bgcolor: 'transparent', boxShadow:'none' }}>
            <Box sx={{ ...contentUnderlaySx, bgcolor: theme.palette.grey[800], p: { xs: 3, sm: 4, md: 5 }, borderRadius: theme.shape.borderRadius * 8 }}>
              <Typography variant="h2" component="h2" fontWeight="bold" gutterBottom color="inherit" sx={{ textAlign: 'center', fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' }, mb:5 }}>
                {t('whyVirtualMD.sections.whyUs.title')}
              </Typography>
              <Grid container spacing={4}>
                {newWhyUsPoints.map((point, index) => (
                  <Grid item xs={12} sm={6} md={index >= 3 && newWhyUsPoints.length === 5 ? 6 : 4} key={index} sx={{ display: 'flex'}}>
                    <Card sx={{ bgcolor: point.bgColor, color: theme.palette.common.white, display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: theme.shape.borderRadius * 4, width: '100%', p: 2 }}>
                      <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', p: {xs: 2, sm: 3} }}>
                        {point.icon}
                        <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom color="inherit" sx={{ mt: 2.5, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>
                          {point.title}
                        </Typography>
                        <Typography color={theme.palette.grey[100]} sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, flexGrow:1, lineHeight: 1.6 }}>
                          {point.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('why-us')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Key Features Section */}
          <Paper id="features" elevation={3} sx={{ ...sectionPaperSx }}>
             <Box sx={contentUnderlaySx}>
              <Typography variant="h2" component="h2" fontWeight="bold" gutterBottom color="inherit" sx={{ textAlign: 'center', fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' }, mb:5 }}>
                {t('whyVirtualMD.sections.features.title')}
              </Typography>
              <Grid container spacing={4} alignItems="stretch">
                <Grid item xs={12} md={6}>
                  <List sx={{ pr: { md: 2 } }}>
                    {[
                      { strong: t('whyVirtualMD.sections.features.points.dynamicEnsemble.title'), text: t('whyVirtualMD.sections.features.points.dynamicEnsemble.text') },
                      { strong: t('whyVirtualMD.sections.features.points.holisticUnderstanding.title'), text: t('whyVirtualMD.sections.features.points.holisticUnderstanding.text') },
                      { strong: t('whyVirtualMD.sections.features.points.rapidAccess.title'), text: t('whyVirtualMD.sections.features.points.rapidAccess.text') },
                      { strong: t('whyVirtualMD.sections.features.points.reliableInteractions.title'), text: t('whyVirtualMD.sections.features.points.reliableInteractions.text') },
                      { strong: t('whyVirtualMD.sections.features.points.insightfulLogs.title'), text: t('whyVirtualMD.sections.features.points.insightfulLogs.text') },
                    ].map((item, index) => (
                      <ListItem key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 2, color: theme.palette.grey[200], borderBottom: index !== 4 ? `1px solid ${theme.palette.grey[700]}` : 'none' }}>
                        <Typography component="strong" fontWeight="bold" color={theme.palette.common.white} sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem' }, mb: 0.5 }}>{item.strong}</Typography>
                        <Typography component="span" color="inherit" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.6 }}>{item.text}</Typography>
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3, justifyContent:'center', alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={MedicalHeroImage}
                    alt={t('common:alt.integratedApproach')}
                    sx={{
                      width: '100%',
                      borderRadius: theme.shape.borderRadius * 2,
                      maxHeight: '400px',
                      objectFit: 'cover',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('features')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Technology Section */}
          <Paper id="technology" elevation={3} sx={{ ...sectionPaperSx }}>
            <Box sx={contentUnderlaySx}>
              <Typography variant="h2" component="h2" fontWeight="bold" gutterBottom color="inherit" sx={{ textAlign: 'center', fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' }, mb:5 }}>
                {t('whyVirtualMD.sections.technology.title')}
              </Typography>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={12}>
                  <Typography color={theme.palette.grey[200]} paragraph sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.7 }}>
                    {t('whyVirtualMD.sections.technology.description1')}
                  </Typography>
                  <Typography color={theme.palette.grey[200]} paragraph sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.7 }}>
                    {t('whyVirtualMD.sections.technology.description2')}
                  </Typography>
                  <Typography color={theme.palette.grey[200]} paragraph sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.7 }}>
                    {t('whyVirtualMD.sections.technology.description3')}
                  </Typography>
                  <Typography color={theme.palette.grey[200]} paragraph sx={{ fontSize: { xs: '1.05rem', sm: '1.15rem' }, lineHeight: 1.7 }}>
                    {t('whyVirtualMD.sections.technology.description4')}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('technology')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Call to Action */}
          <Paper id="cta" elevation={3} sx={{ ...sectionPaperSx, backgroundSize: 'cover', backgroundPosition: 'center center' }}>
            <Box sx={{...imageOverlaySx, backgroundColor: 'rgba(0, 0, 0, 0.6)'}} />
            <Box sx={{ ...contentUnderlaySx, textAlign: 'center', py: {xs: 5, md: 8} }}>
              <Typography variant="h2" component="h2" fontWeight="bold" gutterBottom color="inherit" sx={{ fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' }, mb:3 }}>
                {t('whyVirtualMD.sections.cta.title')}
              </Typography>
              <Typography dangerouslySetInnerHTML={{ __html: t('whyVirtualMD.sections.cta.subtitle') }} sx={{ maxWidth: 'lg', mx: 'auto', mb: 5, color: theme.palette.grey[100], fontSize: { xs: '1.15rem', sm: '1.3rem', md: '1.5rem' }, lineHeight: 1.7 }} />
              <Button 
                variant="contained" 
                size="large" 
                color="primary" 
                component={RouterLink}
                to="/register"
                sx={{ borderRadius: '50px', px: {xs:4, sm:6}, py: {xs:1.5, sm:2}, fontSize: {xs: '1rem', sm: '1.2rem'}, fontWeight:'bold' }}
              >
                {t('whyVirtualMD.sections.cta.buttonText')}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
