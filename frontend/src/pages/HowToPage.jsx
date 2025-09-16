import React, { useState, useEffect } from 'react';
import SiteMeta from '../components/seo/SiteMeta';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Chip,
  Button,
  useMediaQuery,
  Drawer,
  IconButton,
  Fab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import ImageIcon from '@mui/icons-material/Image';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LanguageIcon from '@mui/icons-material/Language';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SecurityIcon from '@mui/icons-material/Security';
import backgroundImage from '../assets/images/beautiful_see_the_light.jpg';

export default function HowToPage() {
  const { t } = useTranslation('pages');
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeSection, setActiveSection] = useState('getting-started');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sections = [
    { id: 'getting-started', label: t('howToPage.navigation.gettingStarted'), icon: <ChatIcon /> },
    { id: 'personas', label: t('howToPage.navigation.aiMedicalPersonas'), icon: <PersonIcon /> },
    { id: 'team-consultations', label: t('howToPage.navigation.teamConsultations'), icon: <GroupIcon /> },
    { id: 'image-analysis', label: t('howToPage.navigation.medicalImageAnalysis'), icon: <ImageIcon /> },
    { id: 'encyclopedia', label: t('howToPage.navigation.medicalEncyclopedia'), icon: <MenuBookIcon /> },
    { id: 'differential-opinions', label: t('howToPage.navigation.differentialOpinions'), icon: <MedicalServicesIcon /> },
    { id: 'voice-interaction', label: t('howToPage.navigation.voiceInteraction'), icon: <RecordVoiceOverIcon /> },
    { id: 'languages', label: t('howToPage.navigation.languageSupport'), icon: <LanguageIcon /> },
    { id: 'tips', label: t('howToPage.navigation.tipsBestPractices'), icon: <TipsAndUpdatesIcon /> },
    { id: 'privacy', label: t('howToPage.navigation.privacySecurity'), icon: <SecurityIcon /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
  // Restore scroll position on mobile and ensure proper focus
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'auto';
  }
  
  // Scroll to top on component mount for mobile
  window.scrollTo(0, 0);
}, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const SidebarContent = () => (
    <Box sx={{ width: 280, pt: 2 }}>
      <Typography variant="h6" sx={{ px: 3, mb: 2, fontWeight: 600 }}>
        {t('howToPage.sidebar.contents')}
      </Typography>
      <List>
        {sections.map((section) => (
          <ListItem key={section.id} disablePadding>
            <ListItemButton
              onClick={() => scrollToSection(section.id)}
              selected={activeSection === section.id}
              sx={{
                px: 3,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600,
                  }
                }
              }}
            >
              <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                {section.icon}
              </Box>
              <ListItemText primary={section.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.93)',
        pointerEvents: 'none',
      }
    }}>
      {/* SEO Meta - Using improved version with Philippines optimization */}
      <SiteMeta
        title={t('howToPage.seoTitle', 'How to Use VirtualMD — User Guide')}
        description={t('howToPage.seoDescription', 'Learn how to use VirtualMD AI healthcare platform. Step-by-step guide for virtual consultations, AI health guidance, and getting the most from our healthcare technology.')}
        keywords={[
          'VirtualMD guide', 'how to use virtual health advisor', 'AI healthcare tutorial',
          'telemedicine guide', 'virtual consultation steps', 'health AI help'
        ]}
        philippinesOptimized={true}
        breadcrumbs={[
          { name: 'Home', url: 'https://virtualmd.app' },
          { name: 'How To Use', url: 'https://virtualmd.app/how-to' }
        ]}
      />

      {/* Mobile Drawer */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            sx={{ position: 'fixed', top: 0, left: 16, zIndex: 1200 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </Fab>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <SidebarContent />
          </Drawer>
        </>
      )}

      <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              position: 'sticky',
              top: 80,
              height: 'calc(100vh - 80px)',
              overflowY: 'auto',
              borderRight: 1,
              borderColor: 'divider',
              backgroundColor: 'background.paper',
            }}
          >
            <SidebarContent />
          </Box>
        )}

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ 
          py: 6,
          px: { xs: 2, sm: 4, md: 6 }
        }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: theme.palette.primary.main,
            mb: 4,
            textAlign: 'center',
          }}>
            {t('howToPage.title')}
          </Typography>

          <Typography variant="h6" sx={{ 
            mb: 6,
            textAlign: 'center',
            color: theme.palette.text.secondary,
          }}>
            {t('howToPage.subtitle')}
          </Typography>

          {/* Getting Started */}
          <Paper id="getting-started" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <ChatIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.gettingStarted.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.gettingStarted.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.gettingStarted.quickStart.title')}</Typography>
              <ol>
                <li><Typography paragraph>{t('howToPage.sections.gettingStarted.quickStart.step1.chooseBetween')} <strong>{t('howToPage.sections.gettingStarted.quickStart.step1.guestAccess')}</strong> {t('howToPage.sections.gettingStarted.quickStart.step1.tryWithoutAccount')} {t('howToPage.sections.gettingStarted.quickStart.step1.or')} <strong>{t('howToPage.sections.gettingStarted.quickStart.step1.signUpFullFeatures')}</strong></Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.gettingStarted.quickStart.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.gettingStarted.quickStart.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.gettingStarted.quickStart.step4')}</Typography></li>
              </ol>
            </Box>
            <Card sx={{ mt: 3, bgcolor: 'primary.50' }}>
              <CardContent>
                <Typography variant="body2" color="primary.main">
                  <strong>{t('howToPage.sections.gettingStarted.tip.label')}</strong> {t('howToPage.sections.gettingStarted.tip.message')}
                </Typography>
              </CardContent>
            </Card>
          </Paper>

          {/* AI Medical Personas */}
          <Paper id="personas" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <PersonIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.aiMedicalPersonas.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.aiMedicalPersonas.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.aiMedicalPersonas.availableSpecialists')}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.generalPractitioner')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.cardiologist')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.pediatrician')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.mentalHealthSpecialist')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.dermatologist')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.neurologist')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.oncologist')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.emergencyMedicine')} color="primary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.medicalNavigator')} color="secondary" />
                <Chip label={t('howToPage.sections.aiMedicalPersonas.specialists.moreSpecialists')} variant="outlined" />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.aiMedicalPersonas.howToChoose.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.aiMedicalPersonas.howToChoose.step1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.aiMedicalPersonas.howToChoose.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.aiMedicalPersonas.howToChoose.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.aiMedicalPersonas.howToChoose.step4')}</Typography></li>
              </ul>
            </Box>
            <Card sx={{ mt: 3, bgcolor: 'info.50' }}>
              <CardContent>
                <Typography variant="body2" color="info.main">
                  <strong>{t('howToPage.sections.aiMedicalPersonas.proTip.label')}</strong> {t('howToPage.sections.aiMedicalPersonas.proTip.medicalNavigator')}
                </Typography>
              </CardContent>
            </Card>
          </Paper>

          {/* Team Consultations */}
          <Paper id="team-consultations" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <GroupIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.teamConsultations.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.teamConsultations.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.teamConsultations.buildingYourTeam.title')}</Typography>
              <ol>
                <li><Typography paragraph>{t('howToPage.sections.teamConsultations.buildingYourTeam.step1.instruction', { buttonText: t('howToPage.sections.teamConsultations.buildingYourTeam.step1.buttonText') })}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.teamConsultations.buildingYourTeam.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.teamConsultations.buildingYourTeam.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.teamConsultations.buildingYourTeam.step4')}</Typography></li>
              </ol>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.teamConsultations.benefits.title')}</Typography>
              <ul>
                <li><Typography paragraph><strong>{t('howToPage.sections.teamConsultations.benefits.comprehensiveCare.label')}</strong> {t('howToPage.sections.teamConsultations.benefits.comprehensiveCare.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.teamConsultations.benefits.coordinatedAdvice.label')}</strong> {t('howToPage.sections.teamConsultations.benefits.coordinatedAdvice.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.teamConsultations.benefits.efficientNavigation.label')}</strong> {t('howToPage.sections.teamConsultations.benefits.efficientNavigation.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.teamConsultations.benefits.holisticApproach.label')}</strong> {t('howToPage.sections.teamConsultations.benefits.holisticApproach.description')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Medical Image Analysis */}
          <Paper id="image-analysis" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <ImageIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.medicalImageAnalysis.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.medicalImageAnalysis.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.medicalImageAnalysis.howToUse.title')}</Typography>
              <ol>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.howToUse.step1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.howToUse.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.howToUse.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.howToUse.step4')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.howToUse.step5')}</Typography></li>
              </ol>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.xrays')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.mriCtScans')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.laboratoryTests')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.skinConditions')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.ecgEkgReadings')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalImageAnalysis.supportedTypes.prescriptionDocuments')}</Typography></li>
              </ul>
            </Box>
            <Card sx={{ mt: 3, bgcolor: 'warning.50' }}>
              <CardContent>
                <Typography variant="body2" color="warning.main">
                  <strong>{t('howToPage.sections.medicalImageAnalysis.warning.label')}</strong> {t('howToPage.sections.medicalImageAnalysis.warning.text')}
                </Typography>
              </CardContent>
            </Card>
          </Paper>

          {/* Medical Encyclopedia */}
          <Paper id="encyclopedia" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <MenuBookIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.medicalEncyclopedia.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.medicalEncyclopedia.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.medicalEncyclopedia.features.title')}</Typography>
              <ul>
                <li><Typography paragraph><strong>{t('howToPage.sections.medicalEncyclopedia.features.instantAccess.label')}</strong> {t('howToPage.sections.medicalEncyclopedia.features.instantAccess.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.medicalEncyclopedia.features.deepResearch.label')}</strong> {t('howToPage.sections.medicalEncyclopedia.features.deepResearch.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.medicalEncyclopedia.features.evidenceBased.label')}</strong> {t('howToPage.sections.medicalEncyclopedia.features.evidenceBased.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.medicalEncyclopedia.features.contextAware.label')}</strong> {t('howToPage.sections.medicalEncyclopedia.features.contextAware.description')}</Typography></li>
              </ul>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.medicalEncyclopedia.howToResearch.title')}</Typography>
              <ol>
                <li><Typography paragraph>{t('howToPage.sections.medicalEncyclopedia.howToResearch.step1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalEncyclopedia.howToResearch.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalEncyclopedia.howToResearch.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.medicalEncyclopedia.howToResearch.step4')}</Typography></li>
              </ol>
            </Box>
          </Paper>

          {/* Differential Opinions */}
          <Paper id="differential-opinions" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <MedicalServicesIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.differentialOpinions.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.differentialOpinions.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.differentialOpinions.gettingOpinions.title')}</Typography>
              <ol>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.gettingOpinions.step1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.gettingOpinions.step2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.gettingOpinions.step3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.gettingOpinions.step4')}</Typography></li>
              </ol>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.differentialOpinions.whatYoullLearn.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.whatYoullLearn.item1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.whatYoullLearn.item2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.whatYoullLearn.item3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.differentialOpinions.whatYoullLearn.item4')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Voice Interaction */}
          <Paper id="voice-interaction" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <RecordVoiceOverIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.voiceInteraction.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.voiceInteraction.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.voiceInteraction.features.title')}</Typography>
              <ul>
                <li><Typography paragraph><strong>{t('howToPage.sections.voiceInteraction.features.speechToText.label')}</strong> {t('howToPage.sections.voiceInteraction.features.speechToText.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.voiceInteraction.features.textToSpeech.label')}</strong> {t('howToPage.sections.voiceInteraction.features.textToSpeech.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.voiceInteraction.features.naturalConversation.label')}</strong> {t('howToPage.sections.voiceInteraction.features.naturalConversation.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.sections.voiceInteraction.features.multipleVoices.label')}</strong> {t('howToPage.sections.voiceInteraction.features.multipleVoices.description')}</Typography></li>
              </ul>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.voiceInteraction.controls.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.voiceInteraction.controls.microphone')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.voiceInteraction.controls.speaker')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.voiceInteraction.controls.volume')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.voiceInteraction.controls.speed')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Language Support */}
          <Paper id="languages" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <LanguageIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.languageSupport.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.languageSupport.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.languageSupport.availableLanguages.title')}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.english')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.spanish')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.french')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.german')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.chinese')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.japanese')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.korean')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.arabic')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.hebrew')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.russian')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.portuguese')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.italian')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.hindi')} size="small" />
                <Chip label={t('howToPage.sections.languageSupport.availableLanguages.languages.moreLanguages')} size="small" variant="outlined" />
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.languageSupport.languageFeatures.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.languageSupport.languageFeatures.autoDetection')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.languageSupport.languageFeatures.switchLanguages')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.languageSupport.languageFeatures.rtlSupport')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.languageSupport.languageFeatures.medicalTermsExplained')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.languageSupport.languageFeatures.culturalGuidance')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Tips & Best Practices */}
          <Paper id="tips" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <TipsAndUpdatesIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.tipsTitle')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.tipsSubtitle')}</Typography>
              <ul>
                <li><Typography paragraph><strong>{t('howToPage.tips.beSpecific.label')}</strong> {t('howToPage.tips.beSpecific.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.shareContext.label')}</strong> {t('howToPage.tips.shareContext.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.askFollowups.label')}</strong> {t('howToPage.tips.askFollowups.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.useImages.label')}</strong> {t('howToPage.tips.useImages.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.saveConversations.label')}</strong> {t('howToPage.tips.saveConversations.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.buildTeams.label')}</strong> {t('howToPage.tips.buildTeams.description')}</Typography></li>
                <li><Typography paragraph><strong>{t('howToPage.tips.verifyInformation.label')}</strong> {t('howToPage.tips.verifyInformation.description')}</Typography></li>
              </ul>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.commonUseCases.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase4')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase5')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase6')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.commonUseCases.useCase7')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Privacy & Security */}
          <Paper id="privacy" sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              <SecurityIcon sx={{ mr: 2, verticalAlign: 'bottom' }} />
              {t('howToPage.sections.privacySecurity.title')}
            </Typography>
            <Typography paragraph>
              {t('howToPage.sections.privacySecurity.description')}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.privacySecurity.securityFeatures.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature4')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature5')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.securityFeatures.feature6')}</Typography></li>
              </ul>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>{t('howToPage.sections.privacySecurity.yourControl.title')}</Typography>
              <ul>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.yourControl.control1')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.yourControl.control2')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.yourControl.control3')}</Typography></li>
                <li><Typography paragraph>{t('howToPage.sections.privacySecurity.yourControl.control4')}</Typography></li>
              </ul>
            </Box>
          </Paper>

          {/* Call to Action */}
          <Paper sx={{ 
            p: 4, 
            mt: 6,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            textAlign: 'center'
          }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {t('howToPage.sections.callToAction.title')}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {t('howToPage.sections.callToAction.description')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/guest-chat')}
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  minWidth: 200
                }}
              >
                {t('howToPage.sections.callToAction.buttons.tryAsGuest')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { 
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)' 
                  },
                  minWidth: 200
                }}
              >
                {t('howToPage.sections.callToAction.buttons.createAccount')}
              </Button>
            </Box>
          </Paper>

          {/* Back to Home */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/')}
              sx={{ fontSize: '0.95rem' }}
            >
              {t('howToPage.sections.callToAction.buttons.backToHome')}
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}