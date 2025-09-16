import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// VirtualMD's custom colorful glitter animation
const VirtualMDThinking = ({ sx, ...props }) => {
  const { t } = useTranslation();
  const [flowPhase, setFlowPhase] = React.useState(0);
  const theme = useTheme();
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setFlowPhase(prev => (prev + 1) % 8); // 8 phases for smooth flowing
    }, 250); // Faster flow animation
    
    return () => clearInterval(interval);
  }, []);

  const getSparkleStyle = (position, phase) => {
    // Create flowing wave from left to right
    const isActive = (position <= phase && position >= phase - 2) || 
                    (phase < 2 && position >= 6 + phase); // Wrap around
    
    const sparkleColor = theme.palette.mode === 'dark' 
      ? (position % 2 === 0 ? '#ffd700' : '#87ceeb') // Gold and sky blue for dark
      : (position % 2 === 0 ? '#ff6b35' : '#4a90e2'); // Orange and blue for light
    
    return {
      color: sparkleColor,
      opacity: isActive ? 1 : 0.2,
      transform: isActive ? 'scale(1.2)' : 'scale(1)',
      filter: isActive ? 'drop-shadow(0 0 4px currentColor)' : 'none',
      transition: 'all 0.25s ease-in-out',
    };
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.3, ...sx }} {...props}>
      {/* Flowing sparkles */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((position) => (
        <AutoAwesomeIcon
          key={position}
          sx={{
            fontSize: 10,
            ...getSparkleStyle(position, flowPhase)
          }}
        />
      ))}
      
      {/* Bright VirtualMD logo in center */}
      <Box
        component="img"
        src="/favicon.ico"
        alt={t('common:alt.logo')}
        sx={{
          width: 14,
          height: 14,
          opacity: 0.9,
          filter: 'brightness(1.3) contrast(1.2)', // Brighter and more vibrant
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

// Full thinking indicator with glitter + animated dots
const ThinkingIndicator = ({ showDots = true, dotColor = '#333333', sx, ...props }) => {
  const [dotCount, setDotCount] = React.useState(1);
  
  React.useEffect(() => {
    if (!showDots) return;
    const interval = setInterval(() => {
      setDotCount(prev => prev >= 5 ? 1 : prev + 1);
    }, 200);
    
    return () => clearInterval(interval);
  }, [showDots]);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', ...sx }} {...props}>
      <VirtualMDThinking />
      {showDots && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: dotColor,
            fontStyle: 'italic',
            fontWeight: 'bold',
            ml: 1,
            minWidth: '40px'
          }}
        >
          {'.'.repeat(dotCount)}
        </Typography>
      )}
    </Box>
  );
};

// Compact version - just the glitter without dots for smaller spaces
const CompactThinkingIndicator = ({ sx, ...props }) => {
  return <VirtualMDThinking sx={sx} {...props} />;
};

export { VirtualMDThinking, ThinkingIndicator, CompactThinkingIndicator };
export default ThinkingIndicator; 