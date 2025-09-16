import React from 'react';
import { Box, Typography } from '@mui/material';

// Simple fallback thinking indicator without i18n dependencies
const ThinkingIndicator = ({ showDots = true, sx, ...props }) => {
  const [dotCount, setDotCount] = React.useState(1);
  
  React.useEffect(() => {
    if (!showDots) return;
    const interval = setInterval(() => {
      setDotCount(prev => prev >= 3 ? 1 : prev + 1);
    }, 500);
    
    return () => clearInterval(interval);
  }, [showDots]);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }} {...props}>
      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
        Thinking{showDots ? '.'.repeat(dotCount) : ''}
      </Typography>
    </Box>
  );
};

// Compact version
const CompactThinkingIndicator = ({ sx, ...props }) => {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ...sx }} {...props}>
      <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
        ...
      </Typography>
    </Box>
  );
};

// Alias for backwards compatibility
const VirtualMDThinkingAnimation = CompactThinkingIndicator;

export { VirtualMDThinkingAnimation, ThinkingIndicator, CompactThinkingIndicator };
export default ThinkingIndicator;