// frontend/src/pages/LandingPage.jsx

// This is the landing page for the pre-login screen.
// It is the first page that users see when opening the app.
// Features a clean design with white cards for better readability.

import React, { useState, useEffect, useRef } from 'react';
import SiteMeta from '../components/seo/SiteMeta';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Fade, useTheme, Button, useMediaQuery, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ScienceIcon from '@mui/icons-material/Science';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WarningIcon from '@mui/icons-material/Warning';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CampaignIcon from '@mui/icons-material/Campaign';
import SpaIcon from '@mui/icons-material/Spa';
import PanToolIcon from '@mui/icons-material/PanTool';
import SecurityIcon from '@mui/icons-material/Security';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
// Use high quality logos for landing page (first impression)
import MainLogo from '../assets/branding/VMD_Logo_Transparent_high.png'; // 512x512
import VLogo from '../assets/branding/V_transparent_high.png'; // 512x512  
import FullLogo from '../assets/branding/full_logo_high.png'; // 512x512
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useAuth } from '../contexts/AuthContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import HotelIcon from '@mui/icons-material/Hotel';
import CloseIcon from '@mui/icons-material/Close';

// Specific components for this page
import LandingAnimatedTitle from '../components/features/landing/LandingAnimatedTitle';
import LandingHeroAndIntro from '../components/features/landing/LandingHeroAndIntro';
import InfoGrid from '../components/common/InfoGrid';
import AnimatedGuestExperience from '../components/features/landing/AnimatedGuestExperience';

function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;
  const { brandColors } = theme.palette;
  const { setHeaderMode } = useHeaderVisibility();
  // Use common namespace explicitly for landing card strings
  const { t, i18n } = useTranslation('common');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showUpDownArrows, setShowUpDownArrows] = useState(false);
  const [showInitialDownArrow, setShowInitialDownArrow] = useState(false);
  const [showGuestExperience, setShowGuestExperience] = useState(false);
  const [advisoryOpen, setAdvisoryOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setShowGuestExperience(true),
    onSwipedRight: () => setShowGuestExperience(false),
    trackTouch: true,
    preventDefaultTouchmoveEvent: true,
  });
  
  useEffect(() => {
    console.log('showGuestExperience changed to:', showGuestExperience);
    // Add a class to body when guest experience is active
    if (showGuestExperience) {
      document.body.classList.add('guest-experience-active');
    } else {
      document.body.classList.remove('guest-experience-active');
    }
    return () => {
      document.body.classList.remove('guest-experience-active');
    };
  }, [showGuestExperience]);
  
  // Listen for the custom event to close guest experience
  useEffect(() => {
    const handleCloseGuestExperience = () => {
      setShowGuestExperience(false);
    };
    
    window.addEventListener('close-guest-experience', handleCloseGuestExperience);
    
    return () => {
      window.removeEventListener('close-guest-experience', handleCloseGuestExperience);
    };
  }, []);
  
  const tryItOutButtonRef = useRef(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      if (scrollPosition > windowHeight * 0.1) {
        setShowUpDownArrows(true);
      } else {
        setShowUpDownArrows(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const checkButtonVisibility = () => {
      if (tryItOutButtonRef.current) {
        const buttonRect = tryItOutButtonRef.current.getBoundingClientRect();
        setShowInitialDownArrow(buttonRect.bottom > window.innerHeight);
      } else {
        setShowInitialDownArrow(false);
      }
    };
    checkButtonVisibility();
    window.addEventListener('resize', checkButtonVisibility);
    return () => window.removeEventListener('resize', checkButtonVisibility);
  }, []);
  
  const scrollPage = (direction) => {
    const currentPosition = window.scrollY;
    const viewportHeight = window.innerHeight;
    let targetPosition;
    if (direction === 'up') {
      targetPosition = 0;
    } else {
      console.warn("LandingPage: Target button removed. Scrolling by viewport height.");
      targetPosition = currentPosition + viewportHeight;
    }
    const startTime = performance.now();
    const duration = 800;
    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easeInOutCubic = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const newPosition = direction === 'up'
        ? currentPosition - (currentPosition * easeInOutCubic)
        : currentPosition + ((targetPosition - currentPosition) * easeInOutCubic);
      window.scrollTo(0, newPosition);
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    requestAnimationFrame(animateScroll);
  };

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
  }, [setHeaderMode]);

  const tryItOutCard = { 
    id: 'try-it-out',
    title: t('landing.tryItOut'),
    icon: <img src={VLogo} alt={t('common:alt.logo')} style={{ height: 24, width: 'auto', display: 'block', marginTop: '2px', filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }} />,
    description: t('landing.cards.tryItOut.tagline', 'No sign-up required.'),
    onClick: () => {
      console.log('Try it out card clicked!');
      setShowGuestExperience(true);
    },
    color: '#1976d2'
  };

  const whyVirtualMDCard = { 
    id: 'why-use-VirtualMD',
    title: t('landing.cards.whyUse.title'),
    description: !isMobile ? t('landing.cards.whyVirtualMD.description', '') : '',
    icon: <img src="/persona_images/aileen-carol_medium.png" alt="Health Expert Aileen Carol" style={{ width: '200%', height: '200%', objectFit: 'cover', objectPosition: 'center 70%', transform: 'scale(1.2) translateY(5%)' }} />,
    link: '/why-virtualmd',
    color: '#1976d2',
    circleColor: '#1976d2'
  };

  const dataPrivacyCard = { 
    id: 'data-privacy',
    title: t('landing.cards.dataPrivacy.title'),
    icon: <SecurityIcon sx={{ fontSize: 36 }} />,
    description: !isMobile ? t('landing.cards.dataPrivacy.description', '') : '',
    link: '/data-privacy-whitepaper',
    color: '#1976d2'
  };

  // Desktop: restore previous desktop text/content from a week ago; Mobile: keep current simplified layout
  const desktopNavCardsData = [
    { 
      id: 'why-use-VirtualMD',
      title: t('landing.cards.whyUse.title'),
      description: t('landing.cards.whyUse.description'),
      icon: <img src={VLogo} alt={t('common:alt.logo')} style={{ height: 32, width: 'auto', display: 'block', marginTop: '2px', filter: 'drop-shadow(0 0 1px white) drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)' }} />, 
      link: '/why-virtualmd',
      color: '#1976d2'
    },
    { 
      id: 'try-it-out',
      title: t('landing.tryItOut'),
      icon: <MedicalInformationIcon sx={{ fontSize: 36 }} />, 
      description: (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
          {t('landing.cards.tryItOut.description', 'My child is sick!|I\'t sleep!|Nutrition for love').split('|').map((item, index) => {
            const icons = [ThermostatIcon, HotelIcon, FavoriteIcon];
            const Icon = icons[index];
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5, width: '100%', whiteSpace: 'nowrap' }}>
                <Icon sx={{ fontSize: 16, color: '#6741D9', mr: 1, flexShrink: 0 }} />
                <Typography sx={{ color: '#6741D9', fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' }, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {item}
                </Typography>
              </Box>
            );
          })}
        </Box>
      ),
      onClick: () => {
        console.log('Try it out card clicked!');
        setShowGuestExperience(true);
      },
      color: '#1976d2'
    },
    { 
      id: 'data-privacy',
      title: t('landing.cards.dataPrivacy.title'),
      icon: <SecurityIcon sx={{ fontSize: 36 }} />, 
      description: t('landing.cards.dataPrivacy.description', 'Like a trusted friend, your secrets are safe with us.'),
      link: '/data-privacy-whitepaper',
      color: '#1976d2'
    }
  ];

  // Use previous desktop content on desktop; keep current content on mobile
  const navCardsData = isMobile 
    ? [tryItOutCard, whyVirtualMDCard, dataPrivacyCard]
    : desktopNavCardsData;

  const isRTL = i18n.language === 'ar' || i18n.language === 'he';

  return (
    <Box sx={{ 
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      height: { xs: 'auto', md: '100vh' },
      overflow: 'hidden',
      bgcolor: 'transparent',
      m: 0
    }} {...swipeHandlers}>
      {/* SEO Meta */}
      <SiteMeta
        title={t('landing.seoTitle', 'VirtualMD — Personalized AI health guidance')}
        description={t('landing.seoDescription', 'Get instant access to AI-powered health consultations with specialized virtual health advisors. Available 24/7 in multiple languages including Filipino. Your health, in your hands.')}
        keywords={[
          'AI health advisor', 'virtual consultation', 'telemedicine', 'health guidance',
          'health AI', 'online health advisor', 'healthcare technology'
        ]}
        image="https://virtualmd.app/assets/branding/full_logo_medium.png"
        philippinesOptimized={true}
        breadcrumbs={[{ name: 'Home', url: (typeof window !== 'undefined' ? window.location.origin : '/') }]}
      />

      {/* Landing Page Content - Always visible */}
      <Box sx={{
        width: '100%',
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        pt: { xs: 'calc(70px + 1vmin)', sm: 'calc(90px + 2vh)', md: 'calc(64px + 0.5vh)', xl: 'calc(64px + 0.5vh)' },
        pb: { xs: '32px', sm: 0 },
      }}>
        {/* Mobile-only full wordmark above title (use full_logo) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', px: 0.5, mb: 0.5 }}>
          <Box component="img" src={FullLogo} alt="VirtualMD.app" sx={{ width: '92%', maxWidth: '92%', objectFit: 'contain' }} />
        </Box>
        <LandingAnimatedTitle />
        <LandingHeroAndIntro />
        {!showGuestExperience && (
          <Box sx={{ mt: { xs: 1, md: '-5vh' } }}>
            <InfoGrid items={navCardsData} />
          </Box>
        )}
      </Box>

      {/* Guest Experience overlaid on top when active */}
      {showGuestExperience && (
        <Box sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 1200,
          bgcolor: 'background.default',
        }}>
          <AnimatedGuestExperience 
            onClose={() => setShowGuestExperience(false)}
            initialCards={navCardsData}
            configId="default-guest"
          />
        </Box>
      )}
      <Fade in={showInitialDownArrow && !showUpDownArrows && !showGuestExperience} timeout={400} unmountOnExit>
        <Box sx={{ 
          position: 'fixed', 
          bottom: '30px', 
          right: '30px', 
          zIndex: 1100,
          display: { xs: 'none', md: 'block' } // Hide on xs and sm screens
        }}>
          <Box
            onClick={() => scrollPage('down')}
            aria-label={t('common:aria.scrollDown')}
            sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(75, 133, 244, 0.75)', backdropFilter: 'blur(4px)', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s ease', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(75, 133, 244, 0.9)', transform: 'translateY(3px)' }}}
          >
            <KeyboardArrowDownIcon />
          </Box>
        </Box>
      </Fade>
      <Fade in={showUpDownArrows && !showGuestExperience} timeout={400} unmountOnExit>
        <Box sx={{ 
          position: 'fixed', 
          bottom: '30px', 
          right: '30px', 
          zIndex: 1100, 
          display: { xs: 'none', md: 'flex' }, // Hide on xs and sm screens
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <Box
            onClick={() => scrollPage('up')}
            aria-label={t('common:aria.scrollUp')}
            sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(75, 133, 244, 0.75)', backdropFilter: 'blur(4px)', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s ease', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(75, 133, 244, 0.9)', transform: 'translateY(-3px)' }}}
          >
            <KeyboardArrowUpIcon />
          </Box>
          <Box
            onClick={() => scrollPage('down')}
            aria-label={t('common:aria.scrollDown')}
            sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(75, 133, 244, 0.75)', backdropFilter: 'blur(4px)', color: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', transition: 'all 0.2s ease', cursor: 'pointer', '&:hover': { bgcolor: 'rgba(75, 133, 244, 0.9)', transform: 'translateY(3px)' }}}
          >
            <KeyboardArrowDownIcon />
          </Box>
        </Box>
      </Fade>

      {/* Thin blue footer for mobile */}
      {isMobile && (
        <Box sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1300,
          height: '28px',
          background: 'linear-gradient(90deg, #1976d2 0%, #6741D9 100%)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          boxShadow: '0 -1px 3px rgba(0,0,0,0.1)',
        }}>
          <Typography
            component="a"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/health-advisory');
            }}
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'center',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            {t('footer.advisory')}
          </Typography>
          
          <Box sx={{ 
            width: '1px', 
            height: '14px',
            bgcolor: 'rgba(255,255,255,0.5)' 
          }} />
          
          <Typography
            component="a"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/legal');
            }}
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.7rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'center',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            {t('footer.legal')}
          </Typography>
        </Box>
      )}

      {/* Advisory Modal */}
      <Dialog
        open={advisoryOpen}
        onClose={() => setAdvisoryOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Health Advisory
          </Typography>
          <IconButton
            onClick={() => setAdvisoryOpen(false)}
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" paragraph>
            <strong>IMPORTANT MEDICAL ADVISORY:</strong>
          </Typography>
          <Typography variant="body2" paragraph>
            VirtualMD.app is designed to provide health information and educational content. It is NOT a substitute for professional medical advice, diagnosis, or treatment.
          </Typography>
          <Typography variant="body2" paragraph>
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on VirtualMD.app.
          </Typography>
          <Typography variant="body2" paragraph>
            If you think you may have a medical emergency, call your doctor, go to the emergency department, or call 911 immediately.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setAdvisoryOpen(false)} variant="contained">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Legal Modal */}
      <Dialog
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 2
        }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Legal Terms
          </Typography>
          <IconButton
            onClick={() => setLegalOpen(false)}
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body2" paragraph>
            © 2024 VirtualMD. All rights reserved.
          </Typography>
          <Typography variant="body2" paragraph>
            By using VirtualMD.app, you agree to our Terms of Service and Privacy Policy. VirtualMD is a trademark of VirtualMD, Inc.
          </Typography>
          <Typography variant="body2" paragraph>
            The information provided on this platform is for educational purposes only and should not be considered as medical advice. Please consult with a healthcare professional for medical concerns.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setLegalOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LandingPage;
