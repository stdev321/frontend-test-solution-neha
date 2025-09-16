import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Button, 
  Typography, 
  IconButton, 
  Tooltip,
  useMediaQuery,
  useTheme 
} from '@mui/material';
import { useTranslation } from 'react-i18next';
// Use tiered logo system for better performance
import logoImage from '../../assets/branding/full_logo_medium.png'; // Guest header (256x256)
import logoImageSmall from '../../assets/branding/VMD_Logo_Transparent_tiny.png'; // Mobile guest header (96x96)
import LanguageSwitcher from '../common/LanguageSwitcher';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Define explicit bright colors used in the header
const BRAND_COLORS = {
  paleBlue: '#D6EAFF',
  mediumBlue: '#82B5FF',
  brightBlue: '#5A9AFE',
  blue: '#4385F4',
  darkBlue: '#356AC3',
  purple: '#6741D9',
  lightPurple: '#9D69FA'
};

function SimpleGuestHeader({ 
  mode = 'light', 
  toggleColorMode, 
  showDarkModeToggle = false,
  isMobile = false 
}) {
  const navigate = useNavigate();
  
  // Create a local fallback for toggleColorMode if not provided
  const [localMode, setLocalMode] = React.useState(mode);
  
  const effectiveToggleColorMode = toggleColorMode || (() => {
    setLocalMode(prev => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      // Update body class for theme
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${newMode}`);
      // Store preference
      try {
        localStorage.setItem('themeMode', newMode);
      } catch {}
      return newMode;
    });
  });
  
  const effectiveMode = toggleColorMode ? mode : localMode;
  const { t } = useTranslation(['common', 'header']);
  
  // Debug: Add visible text to confirm component is rendering
  console.log('[SimpleGuestHeader] Translation test:', {
    key: 'header.welcomeToVirtualMD',
    translated: t('header.welcomeToVirtualMD', 'Welcome to VirtualMD!'),
    fallback: 'Welcome to VirtualMD!'
  });
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('md')) || isMobile;
  
  // Debug logging
  console.log('[SimpleGuestHeader] Render:', {
    showDarkModeToggle,
    hasToggleFunction: !!toggleColorMode,
    mode,
    timestamp: new Date().toISOString()
  });
  
  const headerBackground = `linear-gradient(to right, ${BRAND_COLORS.paleBlue} 0%, ${BRAND_COLORS.paleBlue} 10%, ${BRAND_COLORS.mediumBlue} 20%, ${BRAND_COLORS.brightBlue} 35%, ${BRAND_COLORS.blue} 50%, ${BRAND_COLORS.darkBlue} 65%, ${BRAND_COLORS.purple} 80%, ${BRAND_COLORS.lightPurple} 100%)`;
  const visualHeaderHeight = { xs: 60, sm: 60, md: 60, lg: 72, xl: 120 };

  return (
    <Box sx={{ mt: '5px', width: '100%' }}>
      <AppBar 
        position="sticky"
        elevation={0}
        sx={{ 
          background: `${headerBackground} !important`,
          backgroundColor: 'transparent !important',
          backgroundImage: `${headerBackground} !important`,
          width: '100%', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          height: { 
            xs: `${visualHeaderHeight.xs}px`,
            lg: `${visualHeaderHeight.lg}px`,
            xl: `${visualHeaderHeight.xl}px`
          }
        }}
      >
        <Toolbar sx={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%', 
          px: '10px',
          minHeight: { 
            xs: `${visualHeaderHeight.xs}px !important`,
            lg: `${visualHeaderHeight.lg}px !important`,
            xl: `${visualHeaderHeight.xl}px !important`
          }, 
          height: {
            xs: `${visualHeaderHeight.xs}px`,
            lg: `${visualHeaderHeight.lg}px`,
            xl: `${visualHeaderHeight.xl}px`
          }
        }}>
          {/* Left Section: Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            <Box 
              component="img" 
              src={isMobileScreen ? logoImageSmall : logoImage}
              alt={t('common:alt.logo')}
              sx={{ 
                height: isMobileScreen 
                  ? { xs: 40, sm: 44 } 
                  : { xs: 40, md: 37, lg: 48, xl: 72 },
                width: 'auto',
                display: 'block',
                verticalAlign: 'middle',
                transform: isMobileScreen ? 'scaleY(0.7)' : 'scaleY(0.85)',
                transformOrigin: 'center center',
                my: isMobileScreen ? 0.25 : 'auto'
              }}
            />
          </Box>
          
          {/* Center Section: Welcome message */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, px: 2 }}>
            <Typography variant="h6" color="inherit" sx={{ 
              fontSize: { md: '1.25rem', lg: '1.4rem' }, 
              fontWeight: 'bold', 
              fontStyle: 'italic'
            }}>
              {t('header.welcomeToVirtualMD', 'Welcome to VirtualMD!')}
            </Typography>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', gap: { md: 1, lg: 1.5 }, alignItems: 'center' }}>
            {/* Language Switcher */}
            <LanguageSwitcher color="white" size="small" />
            
            {/* Dark/Light toggle - only show when requested */}
            {showDarkModeToggle && (
              <Tooltip title={t('header:toggleMode', 'Toggle Light/Dark Mode')}>
                <IconButton
                  onClick={effectiveToggleColorMode}
                  size="small"
                  sx={{ color: 'white' }}
                  aria-label={t('header:toggleMode', 'Toggle Light/Dark Mode')}
                >
                  {effectiveMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
            )}
            
            {/* Advisory Button */}
            <Button
              onClick={() => navigate('/health-advisory')}
              size="small"
              sx={{
                color: 'white',
                textTransform: 'none',
                fontSize: { md: '0.9rem', xl: '1.2rem' },
                py: { md: 0.5, xl: 1 },
                px: { md: 1.5, xl: 2 },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {t('header:advisory', 'Advisory')}
            </Button>
            
            {/* Sign up Button with Tooltip */}
            <Tooltip title={t('common:header.signupForFullAccess', 'Sign up for free for full access')}>
              <Button
                onClick={() => navigate('/register')}
                variant="contained"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: BRAND_COLORS.blue,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: { md: '0.9rem', xl: '1.2rem' },
                  py: { md: 0.5, xl: 1 },
                  px: { md: 2, xl: 3 },
                  minHeight: { md: '32px', xl: '48px' },
                  minWidth: { md: '90px', xl: '130px' },
                  height: { md: '38px', xl: '54px' },
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                {t('header:register', 'Sign up')}
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default SimpleGuestHeader;