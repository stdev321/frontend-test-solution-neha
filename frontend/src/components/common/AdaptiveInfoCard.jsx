import React, { useState, useEffect, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  useTheme,
  Link as MuiLink,
  alpha
} from '@mui/material';

export default function AdaptiveInfoCard({
  icon,
  title,
  description,
  citation,
  color = '#4385F4',
  circleColor,
  link,
  onClick,
  sizeMultiplier = 1
}) {
  const theme = useTheme();
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  
  // Dynamic font sizing based on card width
  
  const isInternalLink = !onClick && link && link?.startsWith('/');
  
  let actionAreaProps = {};
  if (onClick) {
    actionAreaProps.onClick = onClick;
  } else if (isInternalLink) {
    actionAreaProps.component = RouterLink;
    actionAreaProps.to = link;
  } else if (link) {
    actionAreaProps.component = MuiLink;
    actionAreaProps.href = link;
    actionAreaProps.target = '_blank';
    actionAreaProps.rel = 'noopener noreferrer';
  }

  useEffect(() => {
    if (!contentRef.current || !titleRef.current) return;

    const adjustFontSizes = () => {
      // Get card width for responsive scaling
      const card = contentRef.current?.closest('.MuiCard-root');
      if (!card) return;
      
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      
      // Get current language for font size adjustments
      const currentLang = document.documentElement.lang || 'en';
      
      // Language-specific scaling factors
      const langScaleFactors = {
        // Compact languages - normal size
        'en': 1.0,
        'zh': 1.0,
        'ja': 1.0,
        'ko': 1.0,
        // Slightly smaller for longer text
        'de': 0.95,
        'ru': 0.95,
        'nl': 0.95,
        'pl': 0.95,
        'tr': 0.95,
        'pt': 0.95,
        // Smaller for very long text
        'fil': 0.9,
        'am': 0.9,
        // Default for unlisted languages
        'default': 1.0
      };
      
      const langScale = langScaleFactors[currentLang] || langScaleFactors['default'];
      
      // Calculate font sizes as percentage of card dimensions
      // This ensures proportional scaling
      let titleSize, descSize;
      
      if (cardWidth < 200) {
        // Very small screens
        titleSize = cardWidth * 0.08; // 8% of card width
        descSize = cardWidth * 0.06; // 6% of card width
      } else if (cardWidth < 300) {
        // Medium mobile screens
        titleSize = cardWidth * 0.07; // 7% of card width
        descSize = cardWidth * 0.055; // 5.5% of card width
      } else {
        // Larger screens
        titleSize = cardWidth * 0.06; // 6% of card width
        descSize = cardWidth * 0.045; // 4.5% of card width
      }
      
      // Apply language scaling FIRST - this is what the user wants!
      // German should be 95% of English size, Filipino 90%, etc.
      titleSize = titleSize * langScale;
      descSize = descSize * langScale;
      
      // Apply minimum and maximum constraints (with optional external multiplier)
      // Desktop-only bump for better readability on large screens
      const isDesktop = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1200px)').matches;
      // Slightly increase computed sizes on desktop to better fill the card
      if (isDesktop) {
        titleSize = titleSize * 1.12;
        descSize = descSize * 1.12;
      } else {
        // Mobile: aggressively fill the card while maintaining small margins
        titleSize = titleSize * 1.2;
        descSize = descSize * 1.2;
      }
      // Apply external multiplier (used by mobile landing page only)
      if (sizeMultiplier && typeof sizeMultiplier === 'number') {
        titleSize = titleSize * sizeMultiplier;
        descSize = descSize * sizeMultiplier;
      }
      const minTitle = isDesktop ? 28 : 20;
      const maxTitle = isDesktop ? 56 : 40;
      const minDesc = isDesktop ? 16 : 16;
      const maxDesc = isDesktop ? 32 : 30;
      titleSize = Math.max(minTitle, Math.min(maxTitle, titleSize));
      descSize = Math.max(minDesc, Math.min(maxDesc, descSize));
      
      // Apply scaled sizes
      if (titleRef.current) {
        titleRef.current.style.fontSize = `${titleSize}px`;
      }
      if (descRef.current) {
        descRef.current.style.fontSize = `${descSize}px`;
      }
      
      // Check if text fits and adjust if needed
      const checkAndAdjust = () => {
        if (!contentRef.current) return;
        
        const contentHeight = contentRef.current.offsetHeight;
        const titleHeight = titleRef.current?.scrollHeight || 0;
        const descHeight = descRef.current?.scrollHeight || 0;
        const totalHeight = titleHeight + descHeight + 16;
        
        // If content overflows, reduce font sizes (use px to avoid rem inflation)
        if (totalHeight > contentHeight * 0.9) {
          const currentTitleSizePx = parseFloat(titleRef.current?.style.fontSize || `${titleSize}px`);
          const currentDescSizePx = parseFloat(descRef.current?.style.fontSize || `${descSize}px`);

          let newTitle = currentTitleSizePx;
          let newDesc = currentDescSizePx;
          let safety = 0;
          while ((titleRef.current?.scrollHeight || 0) + (descRef.current?.scrollHeight || 0) + 16 > contentRef.current.offsetHeight * 0.9 && safety < 6) {
            newTitle = Math.max(12, newTitle * 0.9);
            newDesc = Math.max(10, newDesc * 0.9);
            if (titleRef.current) titleRef.current.style.fontSize = `${newTitle}px`;
            if (descRef.current) descRef.current.style.fontSize = `${newDesc}px`;
            safety += 1;
          }
        }
      };
      
      // Check after a small delay to ensure layout is complete
      setTimeout(checkAndAdjust, 100);
    };

    const timeoutId = setTimeout(adjustFontSizes, 50);
    window.addEventListener('resize', adjustFontSizes);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', adjustFontSizes);
    };
  }, [title, description]);

  return (
    <Card
      elevation={4}
      sx={{
        width: '100%', // Always full width
        maxWidth: 'none', // No max width - let grid control size
        aspectRatio: '1 / 1', // Force square aspect ratio
        borderRadius: '16px',
        background: `linear-gradient(145deg, ${color}15 0%, ${color}05 100%)`,
        border: `2px solid ${color}`,
        transition: 'box-shadow 0.3s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: theme.shadows[16],
          background: `linear-gradient(145deg, ${color}25 0%, ${color}10 100%)`,
        },
      }}
    >
      <CardActionArea
        {...actionAreaProps}
        sx={{
          height: '100%',
          overflow: 'visible',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-start',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 0.5, sm: 4 }, // Minimal padding for more text space
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: '100%',
            pt: { xs: 2, sm: 5 }, // Push content down a bit on mobile so it isn't bunched at top
          }}
        >
          <Box
            sx={{
              mt: { xs: 0.75, sm: 0 },
              mb: { xs: 0.75, sm: 3 }, // Balanced margin for text space
              p: { xs: 1.5, sm: 3 }, // Less padding on mobile
              borderRadius: '50%',
              bgcolor: circleColor || color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 20px ${alpha(circleColor || color, 0.4)}`,
              color: 'white',
              width: { xs: '14vmin', sm: 80 }, // shift icon down slightly by reducing circle size
              height: { xs: '14vmin', sm: 80 },
              flexShrink: 0,
              overflow: 'hidden', // Ensure content is clipped to circle
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 22, sm: 48 } } })}
          </Box>
          <CardContent 
            ref={contentRef}
            sx={{ 
              p: 0, 
              px: { xs: 0.25, sm: 2 }, // Reduce side padding further on mobile to allow larger text
              pb: { xs: 0.25, sm: 2 }, // Slightly smaller bottom padding
              textAlign: 'center', 
              maxWidth: '100%', 
              overflow: 'visible',
              height: 'auto', // Always auto height
              flex: 1, // Take remaining space
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', // Center content vertically
            }}
          >
            {typeof title === 'string' ? (
              <Typography 
                ref={titleRef}
                variant="h4"
                className="info-card-title" 
                sx={{ 
                  color: color, 
                  fontWeight: 700, 
                  mb: { xs: 0.25, sm: 2 }, // Very tight spacing for mobile
                  fontSize: 'inherit', // Let dynamic sizing handle it
                  lineHeight: 1.1,
                  whiteSpace: 'normal', // Allow text wrapping for long titles
                  overflow: 'visible', // Show full text
                  wordBreak: 'break-word', // Break long words if needed
                  textAlign: 'center', // Ensure center alignment
                  display: 'block', // Block display for proper centering
                  width: '100%', // Full width for centering
                }}
              >
                {title}
              </Typography>
            ) : (
              <Box ref={titleRef} sx={{ 
                color: color, 
                fontWeight: 700, 
                mb: { xs: 0.25, sm: 2 },
                fontSize: 'inherit', // Let dynamic sizing handle it
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                {title}
              </Box>
            )}
            {React.isValidElement(description) ? (
              description
            ) : (
              <Typography
                ref={descRef}
                variant="body1"
                className="info-card-description"
                sx={{
                  color: '#6741D9',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  maxWidth: '95%',
                  mx: 'auto',
                  lineHeight: 1.15,
                  overflow: 'visible', // Show full text
                  fontWeight: 600,
                  fontSize: 'inherit', // Let dynamic sizing handle it
                  textAlign: 'center',
                }}
              >
                {description || citation}
              </Typography>
            )}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
}