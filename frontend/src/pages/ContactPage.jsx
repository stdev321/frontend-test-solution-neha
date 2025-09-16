// frontend/src/pages/ContactPage.jsx
// Placeholder page that redirects to the landing page.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for top-left logo navigation
import { useTranslation } from 'react-i18next';
import { Paper, Box, Typography, TextField, Button, Alert, CircularProgress, Tooltip, Link } from '@mui/material'; // Removed Container, Added Tooltip and Link
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext'; // To get user email if logged in
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext'; // RE-ADDED
import { API_BASE_URL } from '../services/api'; // Import API base URL
import backgroundImage from '../assets/images/beautiful_see_the_light.jpg';
// Use medium logo for contact page
import logoSmallTransparent from '../assets/branding/VMD_Logo_Transparent_medium.png';

// Basic email validation regex
const emailRegex = /^\S+@\S+\.\S+$/;

function ContactPage() {
  const { currentUser } = useAuth();
  const { setHeaderMode } = useHeaderVisibility();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('pages');
  const isRTL = i18n.language === 'he' || i18n.language === 'ar' || i18n.language === 'fa';

  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // New state to track if message is sent

  useEffect(() => {
    if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
    }
    window.scrollTo(0, 0);
  }, [currentUser, setHeaderMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !emailRegex.test(email)) {
      setError(t('contactPage.invalidEmail'));
      return;
    }
    if (!subject.trim()) {
      setError(t('contactPage.subjectRequired'));
      return;
    }
    if (!message.trim()) {
      setError(t('contactPage.messageRequired'));
      return;
    }

    setLoading(true);
    
    try {
      // Send data to the backend API endpoint
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, subject, message }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(data.message);
        setIsSent(true);
      } else {
        setError(
          <span>
            {t('contactPage.errorMessage')}{' '}
            <Link 
              href="mailto:info@virtualmd.app?subject=Contact%20VirtualMD.app"
              sx={{ color: 'primary.main', textDecoration: 'underline' }}
            >
              {t('contactPage.contactDirectly')}
            </Link>
          </span>
        );
      }
    } catch (err) {
      console.error('Error sending contact form:', err);
      setError(
        <span>
          {t('contactPage.errorMessage')}{' '}
          <Link 
            href="mailto:info@virtualmd.app?subject=Contact%20VirtualMD.app"
            sx={{ color: 'primary.main', textDecoration: 'underline' }}
          >
            {t('contactPage.contactDirectly')}
          </Link>
        </span>
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box // Main full-screen background container
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center', // Vertically center the form container box
          justifyContent: 'center', // Center the form container box
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          px: { xs: 2, sm: 3, md: 4 } // Add some padding to the edges of the screen
        }}
      >
        {/* Form Container Box - Handles positioning and responsive width */}
        <Box
          sx={{
            width: { xs: '100%', sm: '80%', md: '70%', lg: '60%' }, // Responsive width
            maxWidth: { xl: '900px' }, // Scale up on very large screens
            height: 'fit-content', // Let Paper determine height 
            my: 'auto', // Vertical centering
            display: 'flex',
            justifyContent: 'center' // Center Paper within this Box
          }}
        >
          <Paper 
            elevation={6}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: 2,
              width: '100%', // Paper takes full width of its container Box
              bgcolor: 'rgba(255, 255, 255, 0.95)', // Increased opacity for better readability
            }}
          >
            <Tooltip title={t('contactPage.home')}>
              <Box
                onClick={() => navigate('/')}
                sx={{
                  cursor: 'pointer',
                  mt: 2,
                  mb: 1,
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
                    width: 'auto',
                    height: { xs: '42px', sm: '50.4px', md: '58.8px' },
                    display: 'block',
                  }}
                />
              </Box>
            </Tooltip>
            <Typography component="h1" variant="h3" sx={{ mb: 1, color: 'primary.dark', fontWeight: 'bold', fontSize: { xl: '3rem' } }}>
              {t('contactPage.contactUs')}
            </Typography>
            {/* Introductory text: color explicitly dark, font size increased, new sentence added */}
            <Box>
              <Typography // Intro text - flex item
                variant="body1" 
                sx={{ 
                  mb: 2, 
                  textAlign: 'center', // Justify looks odd, back to center
                  color: 'rgba(0, 0, 0, 0.87)', 
                  fontSize: { xs: '0.9rem', xl: '1.1rem' }, // Scaled up font
                  px: {xs: 1, sm: 2} // Add some internal padding for justify
                }}
              > 
                {t('contactPage.contactDescription')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: 'text.secondary',
                  fontSize: '1.1rem',
                  unicodeBidi: 'isolate', // keep email order in RTL
                  textAlign: 'center',     // 1. Center justify the text
                }}
              >
                <span dangerouslySetInnerHTML={{ __html: t('contactPage.contactDirectly', { emailLink: `<a href="mailto:info@virtualmd.app" style="color: inherit;">info@virtualmd.app</a>` }) }} />
              </Typography>
            </Box>

            {/* Form Box - now a flex item that can grow and manage its internal scroll if needed */}
            <Box component="form" onSubmit={handleSubmit} 
              sx={{ 
                mt: 1, 
                width: '100%', 
                px:1, 
                display: 'flex', // ADDED
                flexDirection: 'column', // ADDED
                flexGrow: 1, // ADDED - Allows this box to take up remaining space
                overflowY: 'visible' // Changed from auto to visible
              }}
            >
              {/* Error and Success Alerts */}
              <Box> {/* Wrapper for alerts if needed, or they can be direct children */}
                {(error) && (
                  <Alert severity="error" sx={{ width: '100%', mb: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ width: '100%', mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                  </Alert>
                )}
              </Box>

              {/* TextFields - flex items within the form box */}
              {/* Reduced top margin (margin="dense") to help with compactness */}
              <TextField 
                margin="dense" 
                size="medium" 
                required
                fullWidth
                id="email"
                label={t('contactPage.yourEmail')}
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!error && error.includes('email')}
                disabled={loading || isSent}
                variant="outlined"
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                    backgroundColor: 'transparent',
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '0 4px',
                    }
                  },
                }}
                inputProps={{
                  onInvalid: (e) => {
                    e.target.setCustomValidity(t('contactPage.emailRequired'));
                  },
                  onInput: (e) => {
                    e.target.setCustomValidity('');
                  }
                }}
              />

              <TextField 
                margin="dense" 
                size="medium" 
                required
                fullWidth
                id="subject"
                label={isRTL ? (
                  <>
                    <span style={{ color: 'red' }}>*</span> {t('contactPage.subject')}
                  </>
                ) : t('contactPage.subject')}
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                error={!!error && error.includes('Subject')}
                disabled={loading || isSent}
                variant="outlined"
                sx={{ 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                    backgroundColor: 'transparent',
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '0 4px',
                    }
                  },
                }}
                inputProps={{
                  onInvalid: (e) => {
                    e.target.setCustomValidity(t('contactPage.subjectRequired'));
                  },
                  onInput: (e) => {
                    e.target.setCustomValidity('');
                  }
                }}
              />

              <TextField 
                margin="dense" 
                size="medium" 
                required
                fullWidth
                multiline
                rows={5}
                name="message"
                label={isRTL ? (
                  <>
                    <span style={{ color: 'red' }}>*</span> {t('contactPage.message')}
                  </>
                ) : t('contactPage.message')}
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                error={!!error && error.includes('Message')}
                disabled={loading || isSent}
                variant="outlined"
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  },
                  '& .MuiInputBase-input': {
                    color: 'text.primary',
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '1rem', xl: '1.1rem' },
                    backgroundColor: 'transparent',
                    '&.MuiInputLabel-shrink': {
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      padding: '0 4px',
                    }
                  },
                }}
                inputProps={{
                  onInvalid: (e) => {
                    e.target.setCustomValidity(t('contactPage.messageRequired'));
                  },
                  onInput: (e) => {
                    e.target.setCustomValidity('');
                  }
                }}
              />
              
              {/* Button Container - flex item, ensure it doesn't cause overflow by itself */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  pt: 1,
                  mt: 1
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 0,
                    py: 1.5,
                    fontSize: { xs: '1rem', xl: '1.2rem' }, // Increased font size and padding
                  }}
                  disabled={loading || isSent}
                  endIcon={
                    (loading && !isSent)
                      ? <CircularProgress size={24} color="inherit" />
                      : <SendIcon fontSize="medium" />
                  }
                >
                  {(loading && !isSent) ? t('contactPage.sending') : isSent ? t('contactPage.messageSent') : t('contactPage.sendMessage')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
  );
}

export default ContactPage; 