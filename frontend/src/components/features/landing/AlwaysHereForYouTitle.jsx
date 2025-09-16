//frontend/src/components/features/landing/AlwaysHereForYouTitle.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

function AlwaysHereForYouTitle() {
  const theme = useTheme();
  const { brandColors } = theme.palette;
  const [visibleWords, setVisibleWords] = useState([]);
  const { t, i18n } = useTranslation('common');

  // Get translated text and split into words
  const translatedText = t('landing.alwaysHereForYou', 'Always Here For You.');
  const TITLE_WORDS = translatedText.split(' ');
  
  // Debug logging
  console.log('AlwaysHereForYou - Language:', i18n.language);
  console.log('AlwaysHereForYou - Translated text:', translatedText);
  console.log('AlwaysHereForYou - Words:', TITLE_WORDS);
  
  // If no translation found, show default
  if (!translatedText || translatedText === 'landing.alwaysHereForYou') {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', md: '4rem', lg: '5rem' }, fontWeight: 'bold' }}>
          Always Here For You.
        </Typography>
      </Box>
    );
  }

  // Dynamic color assignment based on word count
  const getWordColor = (index) => {
    const colors = [
      brandColors?.lightPurple || '#9D69FA',  // First word - purple
      brandColors?.purple || '#6741D9',       // Second word - purple
      brandColors?.darkBlue || '#356AC3',     // Remaining words - blue
      brandColors?.darkBlue || '#356AC3',
      brandColors?.darkBlue || '#356AC3',
    ];
    return colors[Math.min(index, colors.length - 1)];
  };

  // Create color mapping for all words (handle duplicates by using index)
  const TITLE_COLORS = {};
  const WORD_KEYS = [];
  TITLE_WORDS.forEach((word, index) => {
    const key = `${word}-${index}`;
    WORD_KEYS.push(key);
    TITLE_COLORS[key] = getWordColor(index);
  });

  const ANIMATION_DELAY = 600; // ms - EXACT same timing

  // Effect for title animation - EXACT same logic
  useEffect(() => {
    // Reset visible words when language or text changes
    setVisibleWords([]);
    
    // Start the animation
    const timers = [];
    WORD_KEYS.forEach((key, index) => {
      const timer = setTimeout(() => {
        setVisibleWords(prev => [...prev, key]);
      }, ANIMATION_DELAY * index);
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [i18n.language, translatedText]); // Re-run when language changes

  return (
    // EXACT same container styling
    <Box sx={{ 
      width: '95%', // Increased width to use more of the screen
      maxWidth: { md: '1280px', xl: '1536px' }, // Restore maxWidth to constrain the component
      mx: 'auto',
      my: { xs: 2, sm: 3, md: 1, xl: 8 }, // Reduced margin for mobile
    }}>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem', xl: '7rem' }, // Smaller on mobile
            textShadow: '1px 1px 4px rgba(0,0,0,0.1)',
            lineHeight: { xs: 1.1, sm: 1.2 }, // Tighter line height on mobile
            width: '100%',
            mb: { xs: 0, sm: 1 },
            overflow: 'visible',
            textAlign: 'center', // Center the text container
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1.5, md: 3.5 }, // Reduced gap on mobile
            }}
          >
            {TITLE_WORDS.map((word, index) => {
              const key = `${word}-${index}`;
              return (
                <Box
                  component="span"
                  key={key}
                  sx={{
                    display: 'inline-block',
                    color: TITLE_COLORS[key],
                    opacity: visibleWords.includes(key) ? 1 : 0,
                    transform: visibleWords.includes(key) ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                    letterSpacing: '0.03em',
                    // Handle punctuation marks
                    ...(word.match(/^[.!?،。]$/) && { ml: -0.3 }),
                  }}
                >
                  {word}
                </Box>
              );
            })}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

export default AlwaysHereForYouTitle; 