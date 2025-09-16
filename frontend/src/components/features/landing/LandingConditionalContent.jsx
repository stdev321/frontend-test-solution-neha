//frontend/src/components/features/landing/LandingConditionalContent.jsx

import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Helper function passed as prop or defined here if simple enough
// const getProviderImage = (providerType) => { /* ... */ };

// Props definition for clarity:
// - activeUserType: 'patient' | 'provider' | null
// - providerType: string
// - getProviderImage: (providerType: string) => string

function LandingConditionalContent({ activeUserType, providerType, getProviderImage }) {
  const navigate = useNavigate(); // Hook for navigation

  if (!activeUserType) {
    return null; // Render nothing if no type is selected
  }

  const isPatient = activeUserType === 'patient';
  const imageSrc = isPatient ? "/images/athlete.jpg" : getProviderImage(providerType);
  const imageAlt = isPatient ? "Patient care" : `${providerType} care`;
  const textContent = isPatient
      ? "For patients, we provide clarity in moments of uncertainty, translating complex medical information into understandable guidance while ensuring they receive the highest standard of care. Our AI doesn't replace the critical human elements of healthcare—it enhances them, creating a symphony of technological precision and human compassion that leads to demonstrably better outcomes."
      : `For ${providerType.toLowerCase()}s, our system serves as an intelligent collaborative partner, analyzing complex medical data in seconds and offering evidence-based insights drawn from the latest research and clinical guidelines. This allows ${providerType.toLowerCase()}s to focus more deeply on the art of medicine—the human connection and intuitive decision-making that technology cannot replace.`;
  const buttonText = isPatient ? 'Learn More About Patient Solutions' : `Learn More About ${providerType} Solutions`;
  const buttonPath = isPatient ? '/patients' : '/providers'; // Placeholder paths

  return (
    // This Box needs the ID in the parent for scrolling
    <Box id="user-content-area" sx={{ minHeight: '200px', scrollMarginTop: '80px' }}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '8px',
          opacity: activeUserType ? 1 : 0, // Use prop directly
          transform: activeUserType ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out',
          maxWidth: '1100px',
          mx: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 3 }}>
          {/* Image */}
          <Box
            component="img"
            src={imageSrc}
            alt={imageAlt}
            sx={{
              width: { xs: '100%', sm: '200px', md: '240px' },
              height: { xs: 'auto', sm: '200px', md: '240px' },
              maxHeight: '240px',
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: 2,
              flexShrink: 0,
            }}
          />
          {/* Text Content */}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" sx={{ textAlign: 'justify', lineHeight: 1.7, mb: 2 }}>
              {textContent}
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(buttonPath)}
              sx={{
                borderRadius: '20px',
                padding: '8px 20px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                }
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default LandingConditionalContent;
