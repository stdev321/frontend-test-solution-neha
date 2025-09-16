// frontend/src/pages/LoginPage.jsx
// This page is the login page for the application.
// It uses the useAuth hook to get the login function and error state.
// It also uses the useNavigate hook to navigate to the main authenticated page (e.g., chat or home).

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import { useTranslation } from 'react-i18next';
// RACE CONDITION FIX: Import new navigation hook
import { useSimpleAuthNavigation } from '../hooks/useAuthNavigation';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Grid, // Import Grid if needed for Link layout
  InputLabel, // Added InputLabel
  Tooltip, // Added Tooltip import
  IconButton,
} from '@mui/material';
import { CompactThinkingIndicator } from '../components/common/ThinkingIndicator';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import beautifulSeeTheLightImage from '../assets/images/beautiful_see_the_light.jpg';
// Use appropriate logo sizes for login page
import logoSmallTransparent from '../assets/branding/VMD_Logo_Transparent_medium.png'; // 256x256 for login
import logoLongTransparent from '../assets/branding/full_logo_high.png'; // 512x512 for prominent display

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(''); // Local error state
  const { login, authError, clearAuthError, currentUser, loading } = useAuth(); // Added loading
  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Ref to prevent multiple navigations
  const { t, i18n } = useTranslation('pages');
  const isRtl = ['ar', 'he', 'fa'].includes(i18n.language);
  

  // Effect to redirect logged-in users AFTER initial load
  useEffect(() => {
    // Only navigate if auth state is confirmed, user exists, AND we haven't navigated yet
    if (!loading && currentUser && !hasNavigated.current) {
      console.log("LoginPage: Auth loaded, currentUser detected, navigating ONCE to /chat");
      hasNavigated.current = true; // Mark as navigated
      navigate('/chat', { replace: true });
    }
    // If loading finishes and there's NO user, reset the flag (allows re-login attempts)
    if (!loading && !currentUser) {
        hasNavigated.current = false;
    }

  }, [currentUser, loading, navigate]); // Add loading to dependency array

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    setLoginError(''); // Clear any previous error

    try {
      await login(email, password);
      // Login successful, onAuthStateChanged in AuthContext handles sync and token.
      // Navigation will now be handled by the useEffect hook monitoring currentUser.
      // Keep button disabled until navigation occurs
    } catch (error) {
      // Set user-friendly error message based on error code
      let errorMessage = 'Incorrect username or password';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setLoginError(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (loginError && (email || password)) {
      setLoginError('');
    }
  }, [email, password]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh', // Ensure full height
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Center the form for all screen sizes
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${beautifulSeeTheLightImage})`, // Ensure correct path
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container for the login form area */}
      <Box
        sx={{
          width: { xs: '100%', sm: '60%', md: '45%', lg: '35%' },
          maxWidth: { xl: '550px' }, // Scale up on very large screens
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4 }, 
          py: { xs: 2, sm: 0 }, // Add vertical padding on mobile
          height: 'fit-content', 
          my: 'auto', 
        }}
      >
        <Paper
          elevation={6}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: { xs: 2, sm: 4 }, // Adjust padding for mobile
            borderRadius: 2,
            width: '100%', 
            maxWidth: { xs: '100%', sm: '450px' }, // Allow full width on mobile
            bgcolor: 'rgba(255, 255, 255, 0.5)', // 50% transparent background
            position: 'relative', // Ensure absolute-positioned children are relative to the card
          }}
        >
          {/* Back arrow (inside card) */}
          <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              aria-label={t('common:aria.back')}
              sx={{ color: '#1976d2', '&:hover': { bgcolor: 'rgba(25,118,210,0.08)' } }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* Logo */}
          <Tooltip title={t('loginPage.home')}>
            <Box
              onClick={() => navigate('/')}
              sx={{
                cursor: 'pointer',
                width: '44.8%', 
                mt: 2,
                mb: 2,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Box
                  component="img"
                  src={logoSmallTransparent}
                  alt={t('common:alt.logo')}
                  sx={{
                    width: '100%', 
                    height: 'auto',
                    display: 'block',
                  }}
              />
            </Box>
          </Tooltip>

          <Typography component="h1" variant="h5" sx={{ mb: 1, color: 'primary.dark', fontSize: { xl: '1.8rem' } }}>
            {t('loginPage.title')}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              size="small" // Smaller field size
              required
              fullWidth
              id="email"
              label={isRtl ? `* ${t('loginPage.email')}` : t('loginPage.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              variant="filled"
              inputProps={{
                onInvalid: (e) => {
                  e.preventDefault();
                  e.target.setCustomValidity(t('loginPage.emailRequired'));
                },
                onChange: (e) => {
                  e.target.setCustomValidity('');
                }
              }}
              onInvalid={(e) => {
                e.preventDefault();
                e.target.setCustomValidity(t('loginPage.emailRequired'));
              }}
              sx={{
                direction: isRtl ? 'rtl' : 'ltr',
                bgcolor: 'primary.dark',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                '& .MuiInputBase-input': {
                  color: '#fff',
                  fontSize: { xl: '1.2rem' }, // Scale up font size
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr',
                  paddingRight: isRtl ? '14px' : '12px',
                  paddingLeft: isRtl ? '12px' : '14px',
                  '&::placeholder': {
                    textAlign: isRtl ? 'right' : 'left',
                  },
                },
                '& .MuiInputBase-input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                  caretColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                // Fix label positioning for RTL
                '& .MuiInputLabel-root': {
                  right: isRtl ? 0 : 'auto',
                  left: isRtl ? 'auto' : 0,
                  transformOrigin: isRtl ? 'top right' : 'top left',
                  maxWidth: 'calc(100% - 24px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: isRtl ? '24px' : '0',
                  '&.MuiInputLabel-shrink': {
                    transform: isRtl ? 'translate(12px, 7px) scale(0.75)' : 'translate(12px, 7px) scale(0.75)',
                    maxWidth: '130%',
                  },
                  ...(isRtl && {
                    '& .MuiInputLabel-asterisk': {
                      display: 'none',
                    }
                  }),
                },
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  '&:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.42)',
                  },
                  '&:hover:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.87)',
                  },
                  '&.Mui-focused:before': {
                    borderBottomColor: '#fff',
                  },
                },
              }}
              InputLabelProps={{
                style: { 
                  color: '#fff',
                  textAlign: isRtl ? 'right' : 'left',
                }, // Make label text white
              }}
            />
            <TextField
              margin="normal"
              size="small" // Smaller field size
              required
              fullWidth
              name="password"
              label={isRtl ? `* ${t('loginPage.password')}` : t('loginPage.password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              variant="filled"
              inputProps={{
                onInvalid: (e) => {
                  e.preventDefault();
                  e.target.setCustomValidity(t('loginPage.passwordRequired'));
                },
                onChange: (e) => {
                  e.target.setCustomValidity('');
                }
              }}
              onInvalid={(e) => {
                e.preventDefault();
                e.target.setCustomValidity(t('loginPage.passwordRequired'));
              }}
              sx={{
                direction: isRtl ? 'rtl' : 'ltr',
                bgcolor: 'primary.dark',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                '& .MuiInputBase-input': {
                  color: '#fff',
                  fontSize: { xl: '1.2rem' }, // Scale up font size
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr',
                  paddingRight: isRtl ? '14px' : '12px',
                  paddingLeft: isRtl ? '12px' : '14px',
                  '&::placeholder': {
                    textAlign: isRtl ? 'right' : 'left',
                  },
                },
                '& .MuiInputBase-input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                  caretColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:hover': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                '& .MuiInputBase-input:-webkit-autofill:active': {
                  WebkitBoxShadow: '0 0 0 1000px #1579BC inset',
                  WebkitTextFillColor: '#fff',
                },
                // Fix label positioning for RTL
                '& .MuiInputLabel-root': {
                  right: isRtl ? 0 : 'auto',
                  left: isRtl ? 'auto' : 0,
                  transformOrigin: isRtl ? 'top right' : 'top left',
                  maxWidth: 'calc(100% - 24px)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: isRtl ? '24px' : '0',
                  '&.MuiInputLabel-shrink': {
                    transform: isRtl ? 'translate(12px, 7px) scale(0.75)' : 'translate(12px, 7px) scale(0.75)',
                    maxWidth: '130%',
                  },
                  ...(isRtl && {
                    '& .MuiInputLabel-asterisk': {
                      display: 'none',
                    }
                  }),
                },
                '& .MuiFilledInput-root': {
                  overflow: 'hidden',
                  '&:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.42)',
                  },
                  '&:hover:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.87)',
                  },
                  '&.Mui-focused:before': {
                    borderBottomColor: '#fff',
                  },
                },
              }}
              InputLabelProps={{
                style: { 
                  color: '#fff',
                  textAlign: isRtl ? 'right' : 'left',
                }, // Make label text white
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2, 
                mb: 1, 
                py: { xs: 1, xl: 1.5 }, // Scale up padding
                bgcolor: '#673AB7 !important',      // Purple background
                color: '#ffffff !important',        // White text
                '&:hover': {
                  bgcolor: '#512DA8 !important',  // Darker purple on hover
                },
                fontSize: { xl: '1.2rem' } // Scale up font size
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CompactThinkingIndicator /> : t('loginPage.signIn')}
            </Button>
            {loginError && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'error.main', 
                  textAlign: 'center',
                  mt: 1,
                  mb: 1,
                  fontWeight: 500
                }}
              >
                {loginError}
              </Typography>
            )}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Typography variant="body2" sx={{ color: '#673AB7' }}>
                  {t('loginPage.noAccount')}{' '}
                  <Link component={RouterLink} to="/register" variant="body2" sx={{ color: '#673AB7', textDecoration: 'underline' }}>
                    {t('loginPage.signUp')}
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Clickable Logo at Top Left */}
      <Tooltip title={t('loginPage.home')}>
        <Box
          onClick={() => navigate('/')} // Navigate to landing page
          sx={{
            position: 'absolute',
            top: '20px',    // Changed position
            left: '20px',
            opacity: 0.75, // Changed opacity (25% transparent)
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            display: { xs: 'none', sm: 'block' }, // Hide logo on mobile
            '&:hover': {
              opacity: 1, // Transparency disappears on hover (unchanged)
            },
          }}
        >
          <Box
            component="img"
            src={logoLongTransparent} // Use direct path string
                          alt={t('common:alt.home')}
            sx={{ height: { sm: '50px', md: '100px' } }} // Made logo responsive
          />
        </Box>
      </Tooltip>

    </Box>
  );
}

export default LoginPage;
