// frontend/src/pages/RegisterPage.jsx
// This page is the register page for the application, styled to match LoginPage.
// It uses the useAuth hook to get the register function and error state.
// It also uses the useNavigate hook to navigate after successful registration.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  Grid,
  InputLabel,
  Tooltip,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import { CompactThinkingIndicator } from '../components/common/ThinkingIndicator';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

// Import the modal and translated terms component
import TermsAgreementModal from '../components/layout/TermsAgreementModal';
import TranslatedTermsContent from '../components/legal/TranslatedTermsContent';

// Import images for proper bundling
import beautifulSeeTheLightImage from '../assets/images/beautiful_see_the_light.jpg';
// Use appropriate logo sizes for register page
import logoSmallTransparent from '../assets/branding/VMD_Logo_Transparent_medium.png'; // 256x256 for register
import logoLongTransparent from '../assets/branding/full_logo_high.png'; // 512x512 for prominent display

function RegisterPage() {
  console.log('RegisterPage RENDERED / MOUNTED'); // Diagnostic log

  useEffect(() => {
    console.log('RegisterPage MOUNT effect executed'); // Diagnostic log
    return () => {
      console.log('RegisterPage UNMOUNTED'); // Diagnostic log for cleanup
    };
  }, []); // Empty dependency array means this runs on mount and cleanup on unmount

  // State from original RegisterPage
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Renamed from isSubmitting for clarity
  const [error, setError] = useState(''); // General form errors
  const [passwordValError, setPasswordValError] = useState(''); // Specific for password validation
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // New state for terms agreement
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [showTermsTooltip, setShowTermsTooltip] = useState(false); // State for tooltip visibility

  // Auth context hooks from original RegisterPage
  const { register, authError, clearAuthError, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false); // Ref to prevent multiple navigations
  const { t, i18n } = useTranslation('pages');
  const isRtl = ['ar', 'he', 'fa'].includes(i18n.language);

  // New state for email conflict modal
  const [isEmailInUseModalOpen, setIsEmailInUseModalOpen] = useState(false);

  // Effect to redirect newly registered (and logged-in) users AFTER initial load
  useEffect(() => {
    // Only navigate if auth state is confirmed, user exists, AND we haven't navigated yet
    if (!authLoading && currentUser && !hasNavigated.current) {
      console.log("RegisterPage: Auth loaded, currentUser detected, navigating ONCE to /chat");
      hasNavigated.current = true; // Mark as navigated
      navigate('/chat', { replace: true });
    }
    // If loading finishes and there's NO user, reset the flag
    if (!authLoading && !currentUser) {
        hasNavigated.current = false;
    }

  }, [currentUser, authLoading, navigate]); // Add authLoading to dependency array

  const handleOpenTermsModal = () => setIsTermsModalOpen(true);
  const handleCloseTermsModal = () => setIsTermsModalOpen(false);
  const handleAgreeToTerms = () => {
    setHasAgreedToTerms(true);
    setIsTermsModalOpen(false);
  };

  const handleTermsCheckboxChange = (event) => {
    if (!event.target.checked) { // If user unchecks it
        setHasAgreedToTerms(false); // This will disable the checkbox and require re-agreement via modal
    }
    // If they check it, it must have been after agreeing in modal, so state is already true.
    // The disabled={!hasAgreedToTerms} handles enabling it only after modal agreement.
  };

  const validatePasswordComplexity = (currentPassword) => {
    if (!currentPassword) {
      setPasswordValError(t('registerPage.passwordRequired'));
      return false;
    }
    if (currentPassword.length < 6) {
      setPasswordValError(t('registerPage.passwordMinLength'));
      return false;
    }
    if (!/[A-Za-z]/.test(currentPassword)) {
      setPasswordValError(t('registerPage.passwordNeedsLetter'));
      return false;
    }
    if (!/[0-9]/.test(currentPassword)) {
      setPasswordValError(t('registerPage.passwordNeedsNumber'));
      return false;
    }
    if (!/[!@#$%^&*()]/.test(currentPassword)) {
      setPasswordValError(t('registerPage.passwordNeedsSpecial'));
      return false;
    }
    if (/\s/.test(currentPassword)) {
      setPasswordValError(t('registerPage.passwordNoSpaces'));
      return false;
    }
    setPasswordValError('');
    return true;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePasswordComplexity(newPassword); // Check complexity on change
    // Check match with confirm password
    if (confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError(t('registerPage.passwordsDoNotMatch'));
    } else if (confirmPassword && newPassword === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    if (newConfirmPassword && newConfirmPassword !== password) {
      setConfirmPasswordError(t('registerPage.passwordsDoNotMatch'));
    } else {
      setConfirmPasswordError(''); // Clears if empty or if it matches
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearAuthError();
    setError('');

    // Final validation checks before submitting
    const isComplexityValid = validatePasswordComplexity(password);
    let doPasswordsMatch = (password === confirmPassword);
    if (!doPasswordsMatch) {
      setConfirmPasswordError(t('registerPage.passwordsDoNotMatch'));
    } else {
      setConfirmPasswordError(''); // Clear if they match on submit
    }

    if (!hasAgreedToTerms) {
      setError(t('registerPage.mustAgreeToTerms'));
      // Do not return immediately if other validation errors should also be shown
    }

    if (!isComplexityValid || !doPasswordsMatch || !hasAgreedToTerms) {
      return; // Stop submission if any validation fails
    }

    const emailParts = email.split('@');
    const tempDisplayName = emailParts[0] || `user_${Date.now()}`;
    setLoading(true);
    try {
      await register(email, password, tempDisplayName);
      // On success, navigate('/chat') is handled by the useEffect watching currentUser
    } catch (err) {
      console.error("Registration failed on page:", err); // Good for debugging
      if (err.code === 'auth/email-already-in-use') {
        setError(t('registerPage.emailInUseError'));
        // setIsEmailInUseModalOpen(true); // Removed: Modal for this is not implemented
      } else if (err.message) {
        // For other errors caught here, display their message using local error state
        setError(err.message);
      } else {
        // Fallback if the caught error has no message property
        setError(t('registerPage.unexpectedError'));
      }
      // authError from context might also be set by the register function.
      // The Alert component will display the local `error` if set, otherwise `authError` from context.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError('');
  }, [email, password, confirmPassword]);

  useEffect(() => {
    clearAuthError();
    return () => clearAuthError();
  }, [clearAuthError]);
  
  const passwordHelperText = t('registerPage.passwordHelperText');

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // --- Start Structure/Styling copied from LoginPage.jsx ---
  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Align form to center
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${beautifulSeeTheLightImage})`, // Check path
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Container for the form area */}
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
            position: 'relative', // Anchor back arrow to the card
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
          {/* Logo - Copied from LoginPage */}
          <Tooltip title={t('registerPage.home')}>
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

          {/* Title - Adapted from LoginPage */}
          <Typography component="h1" variant="h5" sx={{ mb: 1, color: 'primary.dark', fontSize: { xl: '1.8rem' }, textAlign: 'center' }}>
            {t('registerPage.title')}
          </Typography>

          {/* Form - Copied structure from LoginPage, adapted fields/submit */}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {/* Error Alert - Combined local and auth errors */}
            {(error || authError || passwordValError || confirmPasswordError) && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => { setError(''); clearAuthError(); setPasswordValError(''); setConfirmPasswordError(''); }}>
                {error || authError || passwordValError || confirmPasswordError}
              </Alert>
            )}

            {/* Email Field - Using LoginPage approach */}
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              id="email"
              label={isRtl ? `* ${t('registerPage.email')}` : t('registerPage.email')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              variant="filled"
              sx={{
                direction: isRtl ? 'rtl' : 'ltr',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                '& .MuiFilledInput-root': {
                  backgroundColor: 'primary.dark',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'primary.dark',
                  },
                  '&.MuiFilledInput-inputAdornedEnd': {
                     backgroundColor: 'primary.dark',
                  },
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
                '& .MuiInputBase-input': {
                  color: '#fff',
                  fontSize: { xl: '1.2rem' },
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr',
                  paddingRight: isRtl ? '14px' : '12px',
                  paddingLeft: isRtl ? '12px' : '14px',
                  '&::placeholder': {
                    textAlign: isRtl ? 'right' : 'left',
                  },
                  '&:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #0A2D5C inset',
                    WebkitTextFillColor: '#fff',
                    caretColor: '#fff' 
                  },
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
              }}
              InputLabelProps={{ 
                style: { 
                  color: '#fff',
                  textAlign: isRtl ? 'right' : 'left',
                }
              }}
              inputProps={{
                onInvalid: (e) => {
                  e.target.setCustomValidity(t('registerPage.emailRequired'));
                },
                onInput: (e) => {
                  e.target.setCustomValidity('');
                }
              }}
            />

            {/* Password Field - Using LoginPage approach */}
            <Tooltip title={passwordHelperText} placement="top-end" arrow>
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                name="password"
                label={isRtl ? `* ${t('registerPage.password')}` : t('registerPage.password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={handlePasswordChange}
                disabled={loading}
                error={!!passwordValError}
                helperText={passwordValError}
                variant="filled"
                sx={{
                  direction: isRtl ? 'rtl' : 'ltr',
                  borderRadius: 1,
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'primary.dark', 
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'primary.dark',
                    },
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
                  '& .MuiInputBase-input': {
                    color: '#fff',
                    fontSize: { xl: '1.2rem' },
                    textAlign: isRtl ? 'right' : 'left',
                    direction: isRtl ? 'rtl' : 'ltr',
                    paddingRight: isRtl ? '14px' : '12px',
                    paddingLeft: isRtl ? '12px' : '14px',
                    '&::placeholder': {
                      textAlign: isRtl ? 'right' : 'left',
                    },
                    '&:-webkit-autofill': {
                      WebkitBoxShadow: '0 0 0 1000px #0A2D5C inset', 
                      WebkitTextFillColor: '#fff',
                      caretColor: '#fff' 
                    },
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
                }}
                InputLabelProps={{ 
                  style: { 
                    color: '#fff',
                    textAlign: isRtl ? 'right' : 'left',
                  }
                }} 
                inputProps={{
                  onInvalid: (e) => {
                    e.target.setCustomValidity(t('registerPage.passwordRequired'));
                  },
                  onInput: (e) => {
                    e.target.setCustomValidity('');
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t('common:aria.togglePassword')}
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: '#fff' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Tooltip>

            {/* Confirm Password Field - Using LoginPage approach */}
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              name="confirmPassword"
              label={isRtl ? `* ${t('registerPage.confirmPassword')}` : t('registerPage.confirmPassword')}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={loading}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
              variant="filled"
              sx={{
                direction: isRtl ? 'rtl' : 'ltr',
                borderRadius: 1,
                position: 'relative',
                overflow: 'hidden',
                '& .MuiFilledInput-root': {
                  backgroundColor: 'primary.dark',
                  color: '#fff',
                  '&:hover': { backgroundColor: 'primary.dark' },
                  '&.Mui-focused': { backgroundColor: 'primary.dark' },
                  '&:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.42)',
                  },
                  '&:hover:before': {
                    borderBottomColor: 'rgba(255, 255, 255, 0.87)',
                  },
                  '&.Mui-focused:before': {
                    borderBottomColor: '#fff',
                  },
                  ...(confirmPassword && password === confirmPassword && !confirmPasswordError && {
                    '&:not(.Mui-error):after': {
                      borderBottomColor: 'success.main',
                    },
                  }),
                },
                '& .MuiInputBase-input': { 
                  color: '#fff',
                  fontSize: { xl: '1.2rem' },
                  textAlign: isRtl ? 'right' : 'left',
                  direction: isRtl ? 'rtl' : 'ltr',
                  paddingRight: isRtl ? '14px' : '12px',
                  paddingLeft: isRtl ? '12px' : '14px',
                  '&::placeholder': {
                    textAlign: isRtl ? 'right' : 'left',
                  },
                  '&:-webkit-autofill': { 
                    WebkitBoxShadow: '0 0 0 1000px #0A2D5C inset', 
                    WebkitTextFillColor: '#fff', 
                    caretColor: '#fff' 
                  },
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
                ...(confirmPassword && password === confirmPassword && !confirmPasswordError && {
                  '& label.Mui-focused:not(.Mui-error)': {
                    color: 'success.main',
                  },
                }),
              }}
              InputLabelProps={{ 
                style: { 
                  color: (confirmPassword && password === confirmPassword && !confirmPasswordError && password && confirmPassword.length > 0) ? 'success.main' : '#fff',
                  textAlign: isRtl ? 'right' : 'left',
                }
              }}
              inputProps={{
                onInvalid: (e) => {
                  e.target.setCustomValidity(t('registerPage.passwordRequired'));
                },
                onInput: (e) => {
                  e.target.setCustomValidity('');
                }
              }}
            />

            {/* Terms and Conditions Checkbox and Link */}
            <FormControlLabel
                control={
                  !hasAgreedToTerms ? (
                    <Tooltip
                      title={t('registerPage.agreeToTermsModal')}
                      arrow
                      placement="top"
                      open={showTermsTooltip} // Controlled by state
                    >
                      {/* Span wrapper is crucial for Tooltip, and for mouse events */}
                      <span 
                        style={{ display: 'inline-block', cursor: 'pointer' }} 
                        onMouseEnter={() => setShowTermsTooltip(true)}
                        onMouseLeave={() => setShowTermsTooltip(false)}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenTermsModal(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenTermsModal(); } }}
                        role="button"
                        tabIndex={0}
                        aria-label={t('registerPage.termsAndConditions')}
                      > 
                        <Checkbox
                            checked={hasAgreedToTerms} // This will be false here
                            onChange={handleTermsCheckboxChange}
                            // Checkbox is effectively not interactive until terms are agreed via modal,
                            // at which point 'hasAgreedToTerms' becomes true and this Tooltip + Checkbox version isn't rendered.
                            // However, to prevent direct interaction if it somehow became enabled before agreement:
                            disabled={!hasAgreedToTerms} 
                            name="termsAgreement"
                            size="small"
                            sx={{
                              pointerEvents: 'none',
                              // Ensure the checkbox icon is the desired blue color
                              '& .MuiSvgIcon-root': { // Target the icon itself
                                fill: '#1976d2 !important', // Blue color for unchecked state
                              },
                              '&.Mui-checked .MuiSvgIcon-root': { // Target the icon when checked
                                fill: '#1976d2 !important', // Blue color for checked state
                              },
                              '&:hover': {
                                // Optional: if you want a hover effect on the checkbox area itself
                                backgroundColor: 'rgba(25, 118, 210, 0.08)', // Light blue hover over the checkbox square
                              }
                            }}
                        />
                      </span>
                    </Tooltip>
                  ) : (
                    // Render a normal Checkbox without Tooltip once terms are agreed
                    <Checkbox
                        checked={hasAgreedToTerms} // This will be true here
                        onChange={handleTermsCheckboxChange}
                        disabled={!hasAgreedToTerms} // This will be false, so it's enabled
                        name="termsAgreement"
                        size="small"
                        sx={{
                          '&.Mui-checked': {
                            color: 'primary.main',
                          },
                        }}
                    />
                  )
                }
                label={
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                        {t('registerPage.agreeToTermsLabel')}{' '}
                        <Link 
                            component="span" 
                            onClick={handleOpenTermsModal} 
                            sx={{ cursor: 'pointer', textDecoration: 'underline', color: '#1976d2' }}
                        >
                            {t('registerPage.termsAndConditions')}
                        </Link>
                    </Typography>
                }
                sx={{ mt: 1, mb: 1, alignSelf: 'flex-start' }} 
            />

            {/* Submit Button - Copied from LoginPage, text changed */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: { xl: '1.2rem' } }}
              disabled={loading || !hasAgreedToTerms} // Disable if loading or terms not agreed
            >
              {loading ? <CompactThinkingIndicator /> : t('registerPage.register')}
            </Button>

            {/* Link to Login Page - Copied from LoginPage, text changed */}
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Typography variant="body2" sx={{ color: '#673AB7' }}>
                  {t('registerPage.alreadyHaveAccount')}{' '}
                  <Link component={RouterLink} to="/login" variant="body2" sx={{ color: '#673AB7', textDecoration: 'underline' }}>
                    {t('registerPage.login')}
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>

      {/* Clickable Logo at Top Left */}
      <Tooltip title={t('registerPage.home')}>
        <Box
          onClick={() => navigate('/')} // Navigate to landing page
          sx={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            opacity: 0.75,
            transition: 'opacity 0.3s ease',
            cursor: 'pointer',
            display: { xs: 'none', sm: 'block' }, // Hide logo on mobile
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <Box
            component="img"
            src={logoLongTransparent}
                          alt={t('common:alt.home')}
            sx={{ height: { sm: '50px', md: '100px' } }} // Made logo responsive
          />
        </Box>
      </Tooltip>

      {/* Terms Agreement Modal */}
      <TermsAgreementModal 
        open={isTermsModalOpen} 
        onClose={handleCloseTermsModal} 
        onAgree={handleAgreeToTerms}
        termsContent={<TranslatedTermsContent />}
      />

    </Box>
  );
  // --- End Structure/Styling copied from LoginPage.jsx ---
}

export default RegisterPage;
