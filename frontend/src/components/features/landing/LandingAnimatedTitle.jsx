//frontend/src/components/features/landing/LandingAnimatedTitle.jsx

import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import FullLogo from '../../../assets/branding/full_logo_medium.png' // Medium for component;

function LandingAnimatedTitle() {
  const theme = useTheme();
  const { brandColors } = theme.palette;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n } = useTranslation();
  const [visibleWords, setVisibleWords] = useState([]);
  const [appPinkHex, setAppPinkHex] = useState('#FF00C8'); // fallback

  // Get current language for font scaling
  const currentLang = i18n.language || 'en';
  
  // Scale fonts to 80% for German, Dutch, Spanish, Portuguese, and Italian
  const needsScaling = ['de', 'nl', 'es', 'pt', 'it'].includes(currentLang);
  const fontScale = needsScaling ? 0.8 : 1.0;

  // Get translated words
  const TITLE_WORDS = [
    t('animation.title.simply'),
    t('animation.title.better'), 
    t('animation.title.health'),
    t('animation.title.period')
  ];

  // On mobile, sample the exact .app color from the logo to avoid any mismatch
  useEffect(() => {
    if (!isMobile) return;
    const img = new Image();
    img.src = FullLogo;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h || !ctx) return;
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0);

        // Heuristic: sample central-right area where ".app" sits in the full logo
        const startX = Math.floor(w * 0.65);
        const endX = Math.floor(w * 0.95);
        const startY = Math.floor(h * 0.35);
        const endY = Math.floor(h * 0.75);

        const colorCounts = new Map();
        for (let y = startY; y < endY; y += 3) {
          for (let x = startX; x < endX; x += 3) {
            const data = ctx.getImageData(x, y, 1, 1).data;
            const [r, g, b, a] = data;
            if (a < 200) continue; // ignore transparent
            // ignore near-white and near-black
            if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) continue;
            // prefer pinkish hues: R dominant, B high-ish, G lower
            const isPinkish = r > 170 && b > 120 && g < r - 40;
            if (!isPinkish) continue;
            const hex = `#${r.toString(16).padStart(2, '0')}${g
              .toString(16)
              .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
            colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
          }
        }
        if (colorCounts.size > 0) {
          const [topHex] = [...colorCounts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
          if (topHex) setAppPinkHex(topHex);
        }
      } catch (e) {
        // Ignore; fallback remains
      }
    };
  }, [isMobile]);

  // Animation colors
  // Mobile: Simply = exact .app pink, Better = same blue as Health, Health/period = exact logo blue
  // Desktop: keep existing scheme (Better purple), to avoid unintended desktop changes
  const TITLE_COLORS = isMobile
    ? {
        [TITLE_WORDS[0]]: appPinkHex, // Simply (.app exact)
        [TITLE_WORDS[1]]: '#0008FF', // Better (match Health)
        [TITLE_WORDS[2]]: '#0008FF', // Health
        [TITLE_WORDS[3]]: '#0008FF', // period
      }
    : {
        [TITLE_WORDS[0]]: '#FF00C8',
        [TITLE_WORDS[1]]: (brandColors?.purple || '#6741D9'),
        [TITLE_WORDS[2]]: '#0008FF',
        [TITLE_WORDS[3]]: '#0008FF',
      };

  const ANIMATION_DELAY = 600; // ms

  // Reset animation when language changes
  useEffect(() => {
    setVisibleWords([]);
  }, [i18n.language]);

  // Effect for title animation
  useEffect(() => {
    if (visibleWords.length < TITLE_WORDS.length) {
      const timer = setTimeout(() => {
        setVisibleWords(prev => [...prev, TITLE_WORDS[prev.length]]);
      }, ANIMATION_DELAY);
      return () => clearTimeout(timer);
    }
  }, [visibleWords, TITLE_WORDS]);

  return (
    // Use exact same 80% width as header and hero section
    <Box sx={{ 
      width: '95%', // Increased width to use more of the screen
      maxWidth: { md: '1280px', xl: '1536px' }, // Restore maxWidth to constrain the component
      mx: 'auto',
      mt: { xs: 0.5, md: 1, xl: 8 }, // Even less vertical margin for mobile
      mb: { xs: 0, md: 0, xl: 4 }, // Reduced bottom margin to bring text closer to cards
    }}>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          mt: { xs: -1, sm: 0 } // nudge title up on mobile
        }}
      >
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontWeight: 'bold',
            fontSize: { 
              xs: `${2 * fontScale}rem`, 
              sm: `${4.25 * fontScale}rem`, 
              md: `${5 * fontScale}rem`, 
              lg: `${6 * fontScale}rem`, 
              xl: `${8 * fontScale}rem` 
            },
            textShadow: '1px 1px 4px rgba(0,0,0,0.1)',
            lineHeight: 1.2, // Adjust line height for potential wrapping
            width: '100%',
            mb: { xs: 0.5, sm: 1 },
            overflow: 'visible',
            textAlign: 'center', // Center the text container
            whiteSpace: { xs: 'nowrap', sm: 'normal' }, // Prevent wrapping on mobile
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'row', // Keep as row on all screen sizes for 1-2 lines
              flexWrap: 'wrap', // Allow wrapping for smaller screens
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 0.5, sm: 1.5, md: 2 }, // Smaller gap on mobile
            }}
          >
            {[TITLE_WORDS[0], TITLE_WORDS[1]].map((word) => (
              <Box
                component="span"
                key={word}
                sx={{
                  display: 'inline-block',
                  color: TITLE_COLORS[word],
                  opacity: visibleWords.includes(word) ? 1 : 0,
                  transform: visibleWords.includes(word) ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                  letterSpacing: '0.03em',
                }}
              >
                {word}
              </Box>
            ))}
            <Box sx={{ display: 'inline-flex', alignItems: 'baseline' }}>
              {[TITLE_WORDS[2], TITLE_WORDS[3]].map((word) => (
                <Box
                  component="span"
                  key={word}
                  sx={{
                    display: 'inline-block',
                    color: TITLE_COLORS[word],
                    opacity: visibleWords.includes(word) ? 1 : 0,
                    transform: visibleWords.includes(word) ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                    letterSpacing: '0.03em',
                  }}
                >
                  {word}
                </Box>
              ))}
            </Box>
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

export default LandingAnimatedTitle;
