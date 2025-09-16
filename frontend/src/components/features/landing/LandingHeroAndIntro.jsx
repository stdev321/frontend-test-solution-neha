// frontend/src/components/features/landing/LandingHeroAndIntro.jsx
// Text and Button section for the landing page (Hero image moved to layout).

import React from 'react';
import { Box, Typography, Container, Paper, Grid, useTheme, Button, Stack, useMediaQuery } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { useTranslation } from 'react-i18next';
// Removed HeroImage import

function LandingHeroAndIntro() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { brandColors } = theme.palette;
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get current language for font scaling
  const currentLang = i18n.language || 'en';
  
  // Scale fonts to 80% for German, Dutch, Spanish, Portuguese, and Italian
  const needsScaling = ['de', 'nl', 'es', 'pt', 'it'].includes(currentLang);
  const fontScale = needsScaling ? 0.8 : 1.0;
  
  // Languages that need text wrapping on mobile due to longer translations
  const needsWrapping = ['ar', 'fa', 'he'].includes(currentLang);
  const mobileWhiteSpace = needsWrapping ? 'normal' : 'nowrap';

  return (
    // Removed outer Box wrapper
    // Removed Hero Section Box entirely
    
    // Container for text and button, centered
    <Container maxWidth="lg" sx={{ textAlign: 'center', mt: 0, mb: 0 }}> {/* Restored constrained width */}
      
      {/* Text content - Back to original position */}
      <Stack spacing={0.5} sx={{ mb: { xs: 0.5, sm: 1 } }}> {/* Tighter spacing on mobile */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: { 
              xs: `${0.95 * fontScale}rem`, 
              sm: `${1.5 * fontScale}rem`, 
              md: `${1.9 * fontScale}rem`, 
              lg: `${2.2 * fontScale}rem`, 
              xl: `${2.8 * fontScale}rem` 
            }, // Smaller on mobile to fit on one line, scaled for certain languages
            fontWeight: 700,
            color: brandColors?.darkBlue || '#356AC3',
            mb: { xs: 0.5, sm: 1 }, // Smaller margin on mobile
            textAlign: 'center', // Ensure text is centered even when wrapping
            whiteSpace: { xs: mobileWhiteSpace, sm: 'normal' }, // Allow wrapping for RTL languages
            lineHeight: { xs: 1.2, sm: 1.3 },
          }}
        >
          {isMobile ? (
            // Mobile-specific text
            t('hero.subtitleMobile')
          ) : (
            // Desktop text
            <>
              {t('hero.subtitle')}
              <Box component="span" sx={{ display: { xs: 'block', md: 'inline', xl: 'block' } }}>
                {' '}{t('hero.poweredBy')}
              </Box>
            </>
          )}
        </Typography>
      </Stack>

      {/* Button - REMOVED from here */}

    </Container>
  );
}

export default LandingHeroAndIntro;
