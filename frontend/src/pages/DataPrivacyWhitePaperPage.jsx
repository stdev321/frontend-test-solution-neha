import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Link as MuiLink } from '@mui/material';
import { ArrowDownward as ArrowDownwardIcon, Security as SecurityIcon, GppGood as GppGoodIcon, Policy as PolicyIcon, InfoOutlined as InfoOutlinedIcon, LockOutlined as LockOutlinedIcon, HistoryEduOutlined as HistoryEduOutlinedIcon, AssignmentIndOutlined as AssignmentIndOutlinedIcon, ArticleOutlined as ArticleOutlinedIcon, WarningAmberOutlined as WarningAmberOutlinedIcon, BalanceOutlined as BalanceOutlinedIcon, CheckCircleOutline as CheckCircleOutlineIcon, IntegrationInstructionsOutlined as IntegrationInstructionsOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';

// Placeholder images - consider specific images for data privacy, security, HIPAA compliance visuals
import PrivacyHeroImage from '../assets/images/medical-hero.jpg'; // Placeholder
import SecurityTechImage from '../assets/images/radiology-and-ai.jpg'; // Placeholder
import EthicalUseImage from '../assets/images/therapy.jpg'; // Placeholder

export default function DataPrivacyWhitePaperPage() {
  const theme = useTheme();
  const { t } = useTranslation('pages');
  const { setHeaderMode } = useHeaderVisibility();

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  const sections = [
    { id: 'hero', title: t('dataPrivacyWhitepaper.sections.hero') },
    { id: 'privacy-pledge', title: t('dataPrivacyWhitepaper.sections.privacyPledge') },
    { id: 'security-levels', title: t('dataPrivacyWhitepaper.sections.securityLevels') },
    { id: 'hipaa-deep-dive', title: t('dataPrivacyWhitepaper.sections.hipaaDeepDive') },
    { id: 'VirtualMD-security', title: t('dataPrivacyWhitepaper.sections.VirtualMDSecurity') },
    { id: 'hipaa-considerations', title: t('dataPrivacyWhitepaper.sections.hipaaConsiderations') },
    { id: 'user-responsibility', title: t('dataPrivacyWhitepaper.sections.userResponsibility') },
    { id: 'privacy-scenarios', title: t('dataPrivacyWhitepaper.sections.privacyScenarios') },
    { id: 'conclusion', title: t('dataPrivacyWhitepaper.sections.conclusion') },
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
    p: { xs: 3, sm: 4, md: 5 },
    borderRadius: theme.shape.borderRadius * 6,
    mb: 5,
    bgcolor: 'rgba(38, 50, 56, 0.9)', // Darker grey with slight transparency
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 1,
  };

  const contentUnderlaySx = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'left', // Default left align for text heavy sections
  };

  const h2Styles = { textAlign: 'center', fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' }, mb: 4, fontWeight: 'bold' };
  const h3Styles = { fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, mt: 4, mb: 2, fontWeight: 'bold', color: theme.palette.primary.light };
  const paragraphStyles = { fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.7, mb: 2, color: theme.palette.grey[300] };
  const strongTextStyles = { color: theme.palette.common.white, fontWeight: 'bold' };

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
          <Paper id="hero" elevation={3} sx={{ ...sectionPaperSx, backgroundImage: `url(${PrivacyHeroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Box sx={imageOverlaySx} />
            <Box sx={{ ...contentUnderlaySx, textAlign: 'center', py: {xs: 5, md: 8} }}>
              <PolicyIcon sx={{ fontSize: { xs: 60, sm: 70, md: 80 }, mb: 2, color: theme.palette.primary.light }} />
              <Typography variant="h1" component="h1" fontWeight="bold" gutterBottom color="inherit" sx={{ fontSize: { xs: '2.8rem', sm: '3.8rem', md: '4.2rem' } }}>
                {t('dataPrivacyWhitepaper.hero.title')}
              </Typography>
              <Typography variant="h5" component="p" sx={{ maxWidth: 'lg', mx: 'auto', mb: 4, color: theme.palette.grey[200], fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }, lineHeight: 1.6 }}>
                {t('dataPrivacyWhitepaper.hero.subtitle')}
              </Typography>
              <ArrowDownwardIcon onClick={() => handleScrollToNextSection('hero')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
            </Box>
            <style>{`@keyframes bounce {0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-12px); } 60% { transform: translateY(-6px); }}`}</style>
          </Paper>

          {/* Section 1: Our Privacy Pledge */}
          <Paper id="privacy-pledge" elevation={3} sx={{ ...sectionPaperSx }}>
            <Box sx={contentUnderlaySx}>
              <GppGoodIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.success.light, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.privacyPledge.title')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyPledge.intro')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.privacyPledge.secureInfo.title')}</strong> {t('dataPrivacyWhitepaper.privacyPledge.secureInfo.description')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.privacyPledge.noPersonalUse.title')}</strong> {t('dataPrivacyWhitepaper.privacyPledge.noPersonalUse.description')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.privacyPledge.neverSell.title')}</strong> {t('dataPrivacyWhitepaper.privacyPledge.neverSell.description')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.privacyPledge.anonymizedData.title')}</strong> {t('dataPrivacyWhitepaper.privacyPledge.anonymizedData.description')}
              </Typography>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('privacy-pledge')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 2: Understanding Data Security & HIPAA */}
          <Paper id="security-levels" elevation={3} sx={{ ...sectionPaperSx, backgroundImage: `url(${SecurityTechImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Box sx={imageOverlaySx} />
            <Box sx={{...contentUnderlaySx, py: {xs:4, md:6}}}>
              <SecurityIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.info.light, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.securityLevels.title')}
              </Typography>
              
              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.securityLevels.accountSecurity.title')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.securityLevels.accountSecurity.description')}
              </Typography>
              <List>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.sfaTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.sfaDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.tfaTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.tfaDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.mfaTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.accountSecurity.mfaDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
              </List>

              <Typography variant="h3" component="h3" sx={h3Styles}><HistoryEduOutlinedIcon sx={{verticalAlign: 'middle', mr:1}}/>{t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.title')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.p1')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.p2Title')}</strong>
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><ArticleOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.privacyRuleTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.privacyRuleDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><ArticleOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.securityRuleTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.securityRuleDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><ArticleOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.breachRuleTitle')} secondary={t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.breachRuleDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.coveredEntitiesTitle')}</strong> {t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.coveredEntitiesDescription')}
              </Typography>
              <Typography sx={paragraphStyles}>
                <strong style={strongTextStyles}>{t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.hipaaMeaningTitle')}</strong> {t('dataPrivacyWhitepaper.securityLevels.hipaaHistory.hipaaMeaningDescription')}
              </Typography>
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('security-levels')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 3: VirtualMD.app Security Practices */}
          <Paper id="VirtualMD-security" elevation={3} sx={{ ...sectionPaperSx }}>
            <Box sx={contentUnderlaySx}>
              <AssignmentIndOutlinedIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.success.main, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.VirtualMDSecurity.title')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.VirtualMDSecurity.intro')}
              </Typography>
              <List>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.VirtualMDSecurity.passwordEncryptionTitle')} secondary={t('dataPrivacyWhitepaper.VirtualMDSecurity.passwordEncryptionDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.VirtualMDSecurity.twoFactorAuthTitle')} secondary={t('dataPrivacyWhitepaper.VirtualMDSecurity.twoFactorAuthDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.VirtualMDSecurity.threeFactorAuthTitle')} secondary={t('dataPrivacyWhitepaper.VirtualMDSecurity.threeFactorAuthDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                 <ListItem><ListItemIcon><SecurityIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.VirtualMDSecurity.dataEncryptionTitle')} secondary={t('dataPrivacyWhitepaper.VirtualMDSecurity.dataEncryptionDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><GppGoodIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.VirtualMDSecurity.permanentDeletionTitle')} secondary={t('dataPrivacyWhitepaper.VirtualMDSecurity.permanentDeletionDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
              </List>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.VirtualMDSecurity.outro')}
              </Typography>
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('VirtualMD-security')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 4: VirtualMD.app & HIPAA Considerations */}
          <Paper id="hipaa-considerations" elevation={3} sx={{ ...sectionPaperSx }}>
             <Box sx={contentUnderlaySx}>
              <BalanceOutlinedIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.primary.main, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.title')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p1')}
              </Typography>
              <Typography sx={{...paragraphStyles, fontWeight: 'bold', textDecoration: 'underline', color: theme.palette.warning.light, textAlign: 'center', my: 3}}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p2')}
              </Typography>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.hipaaConsiderations.approachTitle')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p3')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p4')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p5')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p6')}
              </Typography>
              
              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.hipaaConsiderations.informedDiscussionsTitle')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p7')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.hipaaConsiderations.p8')}
              </Typography>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.hipaaConsiderations.alignmentTitle')}</Typography>
              <List>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.hipaaConsiderations.userControlTitle')} secondary={t('dataPrivacyWhitepaper.hipaaConsiderations.userControlDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.hipaaConsiderations.anonymizationTitle')} secondary={t('dataPrivacyWhitepaper.hipaaConsiderations.anonymizationDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('hipaa-considerations')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 5: User Responsibility & Ethical Use */}
           <Paper id="user-responsibility" elevation={3} sx={{ ...sectionPaperSx, backgroundImage: `url(${EthicalUseImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Box sx={{...imageOverlaySx, backgroundColor: 'rgba(0,0,0,0.65)'}} />
            <Box sx={{...contentUnderlaySx, py: {xs:4, md:6}}}>
              <WarningAmberOutlinedIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.error.light, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.userResponsibility.title')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.userResponsibility.intro')}
              </Typography>
              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.userResponsibility.agreementTitle')}</Typography>
              <List>
                <ListItem><ListItemIcon><GppGoodIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.userResponsibility.noReviewTitle')} secondary={t('dataPrivacyWhitepaper.userResponsibility.noReviewDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: theme.palette.error.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.userResponsibility.prohibitedContentTitle')} secondary={t('dataPrivacyWhitepaper.userResponsibility.prohibitedContentDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><InfoOutlinedIcon sx={{color: theme.palette.info.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.userResponsibility.consultPractitionerTitle')} secondary={t('dataPrivacyWhitepaper.userResponsibility.consultPractitionerDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
                <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: theme.palette.error.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.userResponsibility.emergencySituationsTitle')} secondary={t('dataPrivacyWhitepaper.userResponsibility.emergencySituationsDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles, fontSize: '1.15rem'}} /></ListItem>
              </List>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.userResponsibility.outro')}
              </Typography>
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('user-responsibility')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 6: Practical Privacy Scenarios & Advanced Considerations (NEW) */}
          <Paper id="privacy-scenarios" elevation={3} sx={{ ...sectionPaperSx }}>
            <Box sx={contentUnderlaySx}>
              <SecurityIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.secondary.light, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.title')}
              </Typography>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.privacyScenarios.scenario1Title')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.scenario1Question')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.scenario1Answer')}
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><LockOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.confidentialConvosTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.confidentialConvosDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><SecurityIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.dataEncryptionTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.dataEncryptionDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><GppGoodIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.accountSecurityTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.accountSecurityDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><ArticleOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.deletionControlTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.deletionControlDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><InfoOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.anonymizationTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.anonymizationDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.scenario1Outro')}
              </Typography>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.privacyScenarios.scenario2Title')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.scenario2Question')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.scenario2Answer')}
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><AssignmentIndOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.profileSecurityTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.profileSecurityDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><PolicyIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.accessControlsTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.accessControlsDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><IntegrationInstructionsOutlinedIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.aiAccessTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.aiAccessDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.privacyScenarios.techNoteTitle')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.techNoteQuestion')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.techNoteP1')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.techNoteP2')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.techNoteP3')}
              </Typography>

              <Typography variant="h3" component="h3" sx={h3Styles}>{t('dataPrivacyWhitepaper.privacyScenarios.thirdPartyDataTitle')}</Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.thirdPartyDataQuestion')}
              </Typography>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.thirdPartyDataAnswer')}
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><GppGoodIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.VirtualMDTrainingTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.VirtualMDTrainingDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><GppGoodIcon sx={{color: theme.palette.grey[300] }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.privacyScenarios.thirdPartyTrainingTitle')} secondary={t('dataPrivacyWhitepaper.privacyScenarios.thirdPartyTrainingDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>
              <Typography sx={paragraphStyles}>
                {t('dataPrivacyWhitepaper.privacyScenarios.outro')}
              </Typography>
               <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <ArrowDownwardIcon onClick={() => handleScrollToNextSection('privacy-scenarios')} sx={{ fontSize: {xs: 48, md: 56}, color: theme.palette.common.white, animation: 'bounce 1.5s infinite', cursor: 'pointer', '&:hover': { color: theme.palette.primary.light} }}/>
              </Box>
            </Box>
          </Paper>

          {/* Section 7: Conclusion & Key Takeaways (Renumbered) */}
          <Paper id="conclusion" elevation={3} sx={{ ...sectionPaperSx, textAlign: 'center' }}> 
            <Box sx={contentUnderlaySx}>
              <ArticleOutlinedIcon sx={{ fontSize: { xs: 50, md: 60 }, mb: 2, color: theme.palette.primary.light, display:'block', margin: '0 auto 16px auto' }} />
              <Typography variant="h2" component="h2" sx={h2Styles}>
                {t('dataPrivacyWhitepaper.conclusion.title')}
              </Typography>
              <Typography sx={{...paragraphStyles, textAlign:'left', mb:3}}>
                {t('dataPrivacyWhitepaper.conclusion.intro')}
              </Typography>
              <Typography variant="h3" component="h3" sx={{...h3Styles, textAlign:'left'}}>{t('dataPrivacyWhitepaper.conclusion.recapTitle')}</Typography>
              <List sx={{textAlign: 'left'}}>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.privacyPriorityTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.privacyPriorityDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.anonymizedDataTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.anonymizedDataDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.accountSecurityTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.accountSecurityDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: theme.palette.success.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.dataControlTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.dataControlDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><InfoOutlinedIcon sx={{color: theme.palette.info.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.hipaaConsiderationsTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.hipaaConsiderationsDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
                <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: theme.palette.error.light }}/></ListItemIcon><ListItemText primary={t('dataPrivacyWhitepaper.conclusion.ethicalUseTitle')} secondary={t('dataPrivacyWhitepaper.conclusion.ethicalUseDescription')} secondaryTypographyProps={{color: theme.palette.grey[400]}} primaryTypographyProps={{style: strongTextStyles}} /></ListItem>
              </List>
              <Typography sx={{...paragraphStyles, textAlign:'center', mt:4}}>
                {t('dataPrivacyWhitepaper.conclusion.outro')}
              </Typography>
            </Box>
          </Paper>

        </Box>
      </Container>
    </Box>
  );
} 