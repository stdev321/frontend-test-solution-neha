import React, { useState, useEffect } from 'react';
// Use high quality logo for prominent intro popup display
import full_logo from '../assets/branding/full_logo_high.png';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Fade,
  Zoom,
  Grow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { keyframes } from '@mui/system';
import { useTranslation } from 'react-i18next';
import beautifulSeeTheLightImage from '../assets/images/beautiful_see_the_light.jpg';
import { useLanguage } from '../contexts/LanguageContext';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-10px) translateX(5px); }
  66% { transform: translateY(5px) translateX(-5px); }
`;

const swipePulse = keyframes`
  0%, 100% { transform: translateX(0); opacity: 0.7; }
  50% { transform: translateX(10px); opacity: 1; }
`;


const IntroductoryPopup = () => {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const theme = useTheme();
  const { t, i18n } = useTranslation('pages');
  const { changeLanguage } = useLanguage();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Reset page when screen size changes
  useEffect(() => {
    setPage(1);
  }, [isMobile]);
  
  // Languages that need smaller font sizes
  const longTextLanguages = ['de', 'ru', 'uk', 'el', 'th', 'ta', 'pa', 'hi', 'fa', 'ar', 'he', 'fr', 'id', 'it', 'pt', 'xh', 'zu'];
  const needsSmallerFont = longTextLanguages.includes(i18n.language);

  // Use high quality (512x512) for the intro popup since it's a prominent display
  const images = {
    portrait: '/persona_images/aileen-carol_high.png',
    makingPoint: '/persona_images/aileen-carol_makingapoint_high.png',
    thinking: '/persona_images/aileen-carol_thinking_high.png',
    fullBody: '/persona_images/aileen-carol_fullbody_high.png',
  };


  const allLanguages = [
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'de', name: 'Deutsch' },
    { code: 'nl', name: 'Dutch (Nederlands)' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fa', name: 'Farsi', nativeName: 'فارسی' },
    { code: 'fil', name: 'Filipino' },
    { code: 'fr', name: 'Français' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italiano' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'ms', name: 'Malay' },
    { code: 'mi', name: 'Māori' },
    { code: 'pt', name: 'Português' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'sw', name: 'Swahili' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
    { code: 'xh', name: 'Xhosa' },
    { code: 'yo', name: 'Yorùbá' },
    { code: 'zu', name: 'Zulu' }
  ];

  const sortedLanguages = allLanguages.sort((a, b) => a.name.localeCompare(b.name));

  useEffect(() => {
    // Don't show intro popup on admin page
    if (window.location.pathname === '/admin') {
      return;
    }
    
    // Check localStorage to prevent showing popup again
    const hasSeenIntro = localStorage.getItem('hasSeenIntroPopup');
    
    // Disabled popup - never show it
    if (!hasSeenIntro) {
      setOpen(false); // Changed from true to false to disable popup
    }
    
    // Keyboard shortcut disabled - popup is completely disabled
    // const handleKeyPress = (e) => {
    //   if (e.ctrlKey && e.shiftKey && e.key === 'I') {
    //     localStorage.removeItem('hasSeenIntroPopup');
    //     setOpen(true);
    //   }
    // };
    // window.addEventListener('keydown', handleKeyPress);
    // return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);


  const handleClose = () => {
    // Mark as seen in localStorage when user clicks "I Promise"
    localStorage.setItem('hasSeenIntroPopup', 'true');
    
    setOpen(false);
    setTimeout(() => setPage(1), 500);
  };


  const handleLanguageChange = (language) => {
    changeLanguage(language);
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(3, prev + 1));
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  // Touch handling for swipe gestures
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && page < 3) {
      handleNextPage();
    } else if (isRightSwipe && page > 1) {
      handlePrevPage();
    }
  };

  const getLanguageDisplay = (language) => {
    if (language.nativeName) {
      return `${language.name} (${language.nativeName})`;
    }
    return language.name;
  };

  // Return null if dialog is closed
  if (!open) return null;

  // DESKTOP RENDER
  if (!isMobile) {
    return (
      <Dialog
        key="desktop-dialog"
        open={open}
        onClose={(_, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            handleClose();
          }
        }}
        maxWidth="lg"
        fullWidth
        disableEscapeKeyDown
        disableAutoFocus
        disableEnforceFocus
        PaperProps={{ 
          sx: { 
            borderRadius: '16px', 
            height: '92vh', 
            maxWidth: '1400px',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(${beautifulSeeTheLightImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } 
        }}
      >
        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', height: '100%' }}>
            {/* Left side with image */}
            <Box sx={{ flex: '0 0 20%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
               <Zoom in={open} timeout={600}>
                  <Box
                    component="img"
                    src={images.fullBody}
                    alt="Aileen Carol"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain', animation: `${float} 4s ease-in-out infinite` }}
                  />
                </Zoom>
            </Box>
            {/* Right side with content */}
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'auto' }}>
                 <Grow in={open} timeout={800}>
                 <Box
                   sx={{
                     position: 'relative',
                     maxWidth: '1100px',
                     mx: 'auto',
                   }}
                 >
                 {/* Language Selector */}
                 <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
                   <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                     <Select
                       value={i18n.language}
                       onChange={(e) => handleLanguageChange(e.target.value)}
                       sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                       MenuProps={{
                         PaperProps: {
                           sx: {
                             maxHeight: '70vh',
                             '& .MuiList-root': {
                               display: 'grid',
                               gridTemplateColumns: '1fr 1fr 1fr',
                               gridAutoFlow: 'column',
                               gridTemplateRows: 'repeat(10, auto)',
                               gap: '4px',
                               p: 1,
                               direction: 'ltr', // Always use LTR for language grid
                               // Use transform to counteract RTL flipping
                               transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
                               '& > *': {
                                 // Flip children back
                                 transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
                               }
                             },
                           },
                         },
                       }}
                     >
                       {sortedLanguages.map((lang) => (
                         <MenuItem 
                           key={lang.code} 
                           value={lang.code}
                           sx={{ 
                             fontSize: '0.875rem', 
                             p: 1, 
                             borderRadius: 1,
                             backgroundColor: lang.code === i18n.language ? 'primary.light' : 'transparent',
                             color: lang.code === i18n.language ? 'primary.main' : 'inherit',
                             fontWeight: lang.code === i18n.language ? 'bold' : 'normal',
                             '&:hover': {
                               backgroundColor: lang.code === i18n.language ? 'primary.light' : 'action.hover',
                             }
                           }}
                         >
                           {getLanguageDisplay(lang)}
                         </MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                 </Box>
                 <Box
                   sx={{
                     background: 'rgba(255, 255, 255, 0.5)',
                     borderRadius: '24px',
                     p: 2,
                    py: 3,
                     position: 'relative',
                     boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                     border: '3px solid',
                     borderColor: theme.palette.mode === 'dark' ? '#7E3F98' : '#9E5FB0',
                     '&::before': {
                       content: '""',
                       position: 'absolute',
                       left: '-20px',
                       top: '20%',
                       transform: 'translateY(-50%)',
                       width: 0,
                       height: 0,
                       borderTop: '15px solid transparent',
                       borderBottom: '15px solid transparent',
                       borderRight: '20px solid rgba(255, 255, 255, 0.5)',
                     },
                     '&::after': {
                       content: '""',
                       position: 'absolute',
                       left: '-25px',
                       top: '20%',
                       transform: 'translateY(-50%)',
                       width: 0,
                       height: 0,
                       borderTop: '18px solid transparent',
                       borderBottom: '18px solid transparent',
                       borderRight: `23px solid ${theme.palette.mode === 'dark' ? '#7E3F98' : '#9E5FB0'}`,
                     },
                   }}
                 >
                   {/* Header */}
                   <Typography
                     variant={"h5"}
                     sx={{
                       fontWeight: 'bold',
                       color: '#7E3F98',
                       mb: 1,
                       lineHeight: 1.2,
                     }}
                   >
                     {t('introPopup.greeting')}
                   </Typography>
 
                   {/* Welcome message */}
                   <Typography
                     variant={"body1"}
                     sx={{
                       mb: 1.5,
                       lineHeight: 1.4,
                       color: 'text.primary',
                     }}
                   >
                     {t('introPopup.welcomeMessage')}
                   </Typography>
 
                   {/* Specialists list - condensed for mobile */}
                   <Box sx={{ mb: 2 }}>
                     <Typography
                       variant={"body1"}
                       sx={{
                         fontWeight: 'medium',
                         color: '#7E3F98',
                         mb: 1,
                       }}
                     >
                       {t('introPopup.meetTheTeam')}
                     </Typography>
 
                       <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, position: 'relative' }}>
                         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                           <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
                           <Typography 
                             variant="body2" 
                             sx={{ color: '#333', fontSize: needsSmallerFont ? '0.8rem' : '0.9rem', lineHeight: 1.4 }}
                             dangerouslySetInnerHTML={{ __html: t('introPopup.specialists.cardiology') }}
                           />
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                           <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
                           <Typography 
                             variant="body2" 
                             sx={{ color: '#333', fontSize: needsSmallerFont ? '0.8rem' : '0.9rem', lineHeight: 1.4 }}
                             dangerouslySetInnerHTML={{ __html: t('introPopup.specialists.oncology') }}
                           />
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                           <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
                           <Typography 
                             variant="body2" 
                             sx={{ color: '#333', fontSize: needsSmallerFont ? '0.8rem' : '0.9rem', lineHeight: 1.4 }}
                             dangerouslySetInnerHTML={{ __html: t('introPopup.specialists.chineseMedicine') }}
                           />
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                           <Typography sx={{ color: '#27A9E0', fontSize: '0.9rem' }}>★</Typography>
                           <Typography 
                             variant="body2" 
                             sx={{ color: '#333', fontSize: needsSmallerFont ? '0.8rem' : '0.9rem', lineHeight: 1.4 }}
                             dangerouslySetInnerHTML={{ __html: t('introPopup.specialists.andMore') }}
                           />
                         </Box>
                       </Box>
                   </Box>
 
                   {/* Disclaimer - shorter for mobile */}
                   <Box
                     sx={{
                       bgcolor: 'transparent',
                       borderRadius: '12px',
                       p: 1.5,
                       border: '2px solid #1976d2',
                       mb: 1.5,
                     }}
                   >
                     <Typography
                       variant={"body2"}
                       sx={{
                         fontWeight: 'bold',
                         color: '#1976d2',
                         lineHeight: 1.4,
                         textAlign: 'center',
                         fontSize: needsSmallerFont ? '0.7rem' : '0.85rem',
                         textTransform: 'uppercase',
                       }}
                     >
                       {t('introPopup.disclaimer.fullText')}
                     </Typography>
                   </Box>
 
                   {/* Promise statement */}
                   <Box
                     sx={{
                       bgcolor: 'transparent',
                       borderRadius: '12px',
                       p: 1.5,
                       textAlign: 'center',
                       border: '2px solid #1976d2',
                     }}
                   >
                     <Typography
                       variant={"body2"}
                       sx={{
                         fontWeight: 'bold',
                         color: '#1976d2',
                         lineHeight: 1.4,
                         fontSize: needsSmallerFont ? '0.7rem' : '0.85rem',
                         textTransform: 'uppercase',
                       }}
                     >
                       {t('introPopup.promise')}
                     </Typography>
                   </Box>
                 </Box>
                 {/* Centered I Promise button */}
                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                   <Button onClick={handleClose} variant="contained" size="large" sx={{ borderRadius: '25px', px: 4, py: 1.5, bgcolor: 'rgba(126, 63, 152, 0.4)', color: '#1976d2', fontWeight: 'bold', border: '2px solid #1976d2', '&:hover': { bgcolor: 'rgba(126, 63, 152, 0.6)', borderColor: '#1565c0' } }}>
                     {t('introPopup.promiseButton')}
                   </Button>
                 </Box>
                 </Box>
               </Grow>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
            <Box
              component="img"
              src={full_logo}
              alt="VirtualMD Logo"
              sx={{ 
                height: '60px', 
                width: 'auto',
                position: 'relative',
                zIndex: 10,
                opacity: 0.9
              }}
            />
        </DialogActions>
      </Dialog>
    );
  }

  // MOBILE RENDER
  if (!open) return null;
  
  return (
    <Dialog
      key="mobile-dialog"
      open={open}
      fullScreen
      TransitionComponent={Fade}
      disableAutoFocus
      disableEnforceFocus
      sx={{ 
        '& .MuiDialog-container': {
          height: '100vh',
          width: '100vw',
        },
        '& .MuiDialog-paper': {
          margin: 0,
        }
      }}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: page === 1 ? `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url(${beautifulSeeTheLightImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          margin: 0,
          maxHeight: '100vh',
          maxWidth: '100vw',
          borderRadius: 0,
        }
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Box
          component="img"
          src={full_logo}
          alt="VirtualMD.app Logo"
          sx={{ height: '40px', width: 'auto' }}
        />
      </Box>

      <DialogContent 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          pt: '70px', 
          pb: '20px', 
          height: '100%', 
          overflow: 'auto', 
          flex: 1, 
          width: '100%',
          direction: 'ltr'  // Force LTR for mobile popup to maintain consistent navigation
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Page 1: Language */}
        {page === 1 && (
          <Fade in={page === 1}>
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              position: 'relative',
              // Force LTR for layout positioning
              direction: 'ltr !important'
            }}>
              <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto', mt: 2 }}>
                <FormControl fullWidth variant="outlined" sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                  <InputLabel>{t('introPopup.languageSelectLabel')}</InputLabel>
                  <Select
                    value={i18n.language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    label={t('introPopup.languageSelectLabel')}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: '70vh',
                          '& .MuiList-root': {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gridAutoFlow: 'column',
                            gridTemplateRows: 'repeat(15, auto)',
                            gap: '4px',
                            p: 1,
                            direction: 'ltr', // Always use LTR for language grid
                            // Use transform to counteract RTL flipping
                            transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
                            '& > *': {
                              // Flip children back
                              transform: i18n.dir() === 'rtl' ? 'scaleX(-1)' : 'none',
                            }
                          },
                        },
                      },
                    }}
                  >
                    {sortedLanguages.map((lang) => (
                      <MenuItem key={lang.code} value={lang.code} sx={{ fontSize: '0.875rem', p: 1, borderRadius: 1 }}>
                        {getLanguageDisplay(lang)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box 
                style={{
                  position: 'absolute', 
                  bottom: '20%', 
                  right: '20px',
                  left: 'auto',
                  textAlign: 'right',
                  direction: ['ar', 'he', 'fa'].includes(i18n.language) ? 'rtl' : 'ltr'
                }}>
                <Box sx={{ mb: 1 }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                      lineHeight: 0.9,
                      color: '#b366cc',
                      mb: 1.5
                    }}
                  >
                    {t('pages:introPopup.mobile.simply')}
                  </Typography>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      fontWeight: 900, 
                      fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                      lineHeight: 0.9
                    }}
                  >
                    <span style={{ color: '#b366cc' }}>{t('pages:introPopup.mobile.better')}</span>{' '}
                    <span style={{ color: '#1976d2' }}>{t('pages:introPopup.mobile.health')}</span>
                  </Typography>
                </Box>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#1976d2',
                    fontWeight: 500,
                    fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                    lineHeight: 1.2
                  }}
                >
                  {t('pages:introPopup.mobile.tagline')}<br />{t('pages:introPopup.mobile.poweredByAI')}
                </Typography>
              </Box>
              {/* Swipe indicator - for RTL languages, show left arrow on left side */}
              {['ar', 'he', 'fa'].includes(i18n.language) ? (
                <IconButton
                  style={{
                    position: 'absolute',
                    left: '10px',
                    right: 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  sx={{
                    animation: `${swipePulse} 2s ease-in-out infinite`,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  onClick={handleNextPage}
                >
                  <ArrowBackIosIcon sx={{ color: '#1976d2' }} />
                </IconButton>
              ) : (
                <IconButton
                  sx={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    animation: `${swipePulse} 2s ease-in-out infinite`,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  onClick={handleNextPage}
                >
                  <ArrowForwardIosIcon sx={{ color: '#1976d2' }} />
                </IconButton>
              )}
            </Box>
          </Fade>
        )}

        {/* Page 2: Welcome with speech bubble */}
        {page === 2 && (
          <Fade in={page === 2}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'flex-start', 
              height: '100%', 
              px: 1,
              overflow: 'auto',
              pt: 1
            }}>
              {/* Health Expert Carol image on the left - full height */}
              <Box sx={{ 
                flex: '0 0 30%', 
                display: 'flex', 
                alignItems: 'flex-start',
                justifyContent: 'center',
                height: '75%',
                pl: 0,
                ml: -1,
                mt: '10%'
              }}>
                <Box
                  component="img"
                  src={images.fullBody}
                  alt="Aileen Carol"
                  sx={{ 
                    height: '100%', 
                    width: 'auto', 
                    objectFit: 'contain',
                    objectPosition: 'top'
                  }}
                />
              </Box>
              
              {/* Speech bubble on the right */}
              <Box sx={{ 
                flex: '1 1 60%',
                pl: 1.5,
                pr: 0.3,
                display: 'flex',
                alignItems: 'flex-start',
                pt: 6
              }}>
                <Box sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '20px',
                  p: 2,
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '2px solid #7E3F98',
                  width: '100%',
                  direction: i18n.dir(),  // Use proper text direction inside bubble
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '20px',
                    left: '-15px',
                    width: 0,
                    height: 0,
                    borderTop: '15px solid transparent',
                    borderBottom: '15px solid transparent',
                    borderRight: '15px solid #7E3F98',
                  }
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#7E3F98', 
                    mb: 0.8,
                    fontSize: needsSmallerFont ? 'clamp(0.9rem, 3.2vw, 1rem)' : 'clamp(1.1rem, 3.8vw, 1.3rem)',
                    lineHeight: 1.2
                  }}>
                    {t('pages:introPopup.mobile.welcomeTitle')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.primary', 
                    mb: 0.8,
                    fontSize: needsSmallerFont ? 'clamp(0.75rem, 2.8vw, 0.85rem)' : 'clamp(0.95rem, 3.5vw, 1.1rem)',
                    lineHeight: 1.3
                  }}>
                    {t('pages:introPopup.mobile.welcomeTeamIntro')}
                  </Typography>
                  <Box component="ul" sx={{ 
                    pl: 2, 
                    m: 0,
                    '& li': {
                      color: '#1976d2',
                      fontSize: needsSmallerFont ? 'clamp(0.7rem, 2.5vw, 0.8rem)' : 'clamp(0.9rem, 3.2vw, 1rem)',
                      mb: 0.2,
                      lineHeight: 1.2
                    }
                  }}>
                    <li>{t('pages:introPopup.mobile.specialties.heart')}</li>
                    <li>{t('pages:introPopup.mobile.specialties.cancer')}</li>
                    <li>{t('pages:introPopup.mobile.specialties.children')}</li>
                    <li>{t('pages:introPopup.mobile.specialties.mental')}</li>
                    <li>{t('pages:introPopup.mobile.specialties.healthSystem')}</li>
                    <li>{t('pages:introPopup.mobile.specialties.andMore') || t('pages:introPopup.mobile.specialties.more')}</li>
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: '#7E3F98', 
                    mt: 1.5,
                    fontSize: needsSmallerFont ? 'clamp(0.75rem, 2.5vw, 0.85rem)' : 'clamp(0.95rem, 3.2vw, 1.05rem)',
                    fontWeight: 600,
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    {t('pages:introPopup.mobile.available247')}
                  </Typography>
                </Box>
              </Box>
              {/* Swipe indicators - for RTL languages, swap arrows and positions */}
              {['ar', 'he', 'fa'].includes(i18n.language) ? (
                <>
                  {/* For RTL: right arrow on right side goes to previous page */}
                  <IconButton
                    style={{
                      position: 'absolute',
                      right: '10px',
                      left: 'auto',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                    sx={{
                      animation: `${swipePulse} 2s ease-in-out infinite`,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    onClick={handlePrevPage}
                  >
                    <ArrowForwardIosIcon sx={{ color: '#1976d2' }} />
                  </IconButton>
                  {/* For RTL: left arrow on left side goes to next page */}
                  <IconButton
                    style={{
                      position: 'absolute',
                      left: '10px',
                      right: 'auto',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255,255,255,0.8)',
                    }}
                    sx={{
                      animation: `${swipePulse} 2s ease-in-out infinite`,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    onClick={handleNextPage}
                  >
                    <ArrowBackIosIcon sx={{ color: '#1976d2' }} />
                  </IconButton>
                </>
              ) : (
                <>
                  {/* For LTR: left arrow on left side goes to previous page */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.8)',
                      animation: `${swipePulse} 2s ease-in-out infinite`,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    onClick={handlePrevPage}
                  >
                    <ArrowBackIosIcon sx={{ color: '#1976d2' }} />
                  </IconButton>
                  {/* For LTR: right arrow on right side goes to next page */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.8)',
                      animation: `${swipePulse} 2s ease-in-out infinite`,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                    }}
                    onClick={handleNextPage}
                  >
                    <ArrowForwardIosIcon sx={{ color: '#1976d2' }} />
                  </IconButton>
                </>
              )}
            </Box>
          </Fade>
        )}

        {/* Page 3: Promise */}
        {page === 3 && (
          <Fade in={page === 3}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'row',
              alignItems: 'flex-start', 
              height: '100%', 
              px: 0.5,
              overflow: 'auto',
              pt: 1
            }}>
              {/* Health Expert Carol image on the left - EXACT SAME AS PAGE 2 */}
              <Box sx={{ 
                flex: '0 0 30%', 
                display: 'flex', 
                alignItems: 'flex-start',
                justifyContent: 'center',
                height: '75%',
                pl: 0,
                ml: -1,
                mt: '10%'
              }}>
                <Box
                  component="img"
                  src={images.fullBody}
                  alt="Aileen Carol"
                  sx={{ 
                    height: '100%', 
                    width: 'auto', 
                    objectFit: 'contain',
                    objectPosition: 'top'
                  }}
                />
              </Box>
              
              {/* Speech bubble on the right */}
              <Box sx={{ 
                flex: '1 1 70%',
                pl: 1.5,
                pr: 0.3,
                display: 'flex',
                alignItems: 'flex-start',
                pt: 6,
                maxHeight: 'calc(100% - 16px)',
                overflow: 'auto'
              }}>
                <Box sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '20px',
                  p: 2,
                  position: 'relative',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '2px solid #7E3F98',
                  width: '100%',
                  direction: i18n.dir(),  // Use proper text direction inside bubble
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '20px',
                    left: '-15px',
                    width: 0,
                    height: 0,
                    borderTop: '15px solid transparent',
                    borderBottom: '15px solid transparent',
                    borderRight: '15px solid #7E3F98',
                  }
                }}>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 500, 
                    color: '#7E3F98', 
                    mb: 1.5,
                    fontSize: needsSmallerFont ? 'clamp(0.75rem, 2.8vw, 0.85rem)' : 'clamp(0.95rem, 3.5vw, 1.1rem)',
                    textAlign: 'left',
                    lineHeight: 1.5
                  }}>
                    {t('pages:introPopup.mobile.disclaimerText')}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontWeight: 600, 
                    color: '#1976d2',
                    fontSize: needsSmallerFont ? 'clamp(0.75rem, 2.8vw, 0.85rem)' : 'clamp(0.95rem, 3.5vw, 1.1rem)',
                    textAlign: 'left',
                    lineHeight: 1.4
                  }}>
                    {t('pages:introPopup.mobile.promiseText')}
                  </Typography>
                </Box>
              </Box>
              {/* Swipe indicator - for RTL languages, show right arrow on right side */}
              {['ar', 'he', 'fa'].includes(i18n.language) ? (
                <IconButton
                  style={{
                    position: 'absolute',
                    right: '10px',
                    left: 'auto',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  sx={{
                    animation: `${swipePulse} 2s ease-in-out infinite`,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  onClick={handlePrevPage}
                >
                  <ArrowForwardIosIcon sx={{ color: '#1976d2' }} />
                </IconButton>
              ) : (
                <IconButton
                  sx={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    animation: `${swipePulse} 2s ease-in-out infinite`,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  }}
                  onClick={handlePrevPage}
                >
                  <ArrowBackIosIcon sx={{ color: '#1976d2' }} />
                </IconButton>
              )}
            </Box>
          </Fade>
        )}

      </DialogContent>

      {/* I Promise button centered below text bubble on page 3 */}
      {page === 3 && (
        <Box sx={{ 
          position: 'absolute',
          bottom: '18%',
          left: '35%',
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          px: 2
        }}>
          <Button 
            onClick={handleClose} 
            variant="contained" 
            size="large" 
            sx={{ 
              borderRadius: '25px', 
              px: 4, 
              py: 1.5, 
              bgcolor: 'rgba(126, 63, 152, 0.4)', 
              color: '#1976d2', 
              fontWeight: 'bold', 
              border: '2px solid #1976d2', 
              '&:hover': { 
                bgcolor: 'rgba(126, 63, 152, 0.6)', 
                borderColor: '#1565c0' 
              } 
            }}
          >
            {t('introPopup.promiseButton')}
          </Button>
        </Box>
      )}

    </Dialog>
  );
};

export default IntroductoryPopup;