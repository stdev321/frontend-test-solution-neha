import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useTranslation } from 'react-i18next';

export default function InitialLoadingMessage() {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  const messages = [
    t('loading.preparingHealthTeam', 'Preparing your AI health team...'),
    t('loading.connectingSpecialists', 'Connecting to medical specialists...'),
    t('loading.initializingSystem', 'Initializing your personalized health system...'),
    t('loading.almostReady', 'Almost ready to assist you...'),
  ];
  
  // Pick a random message
  const [message] = React.useState(() => 
    messages[Math.floor(Math.random() * messages.length)]
  );
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%',
        minHeight: 200,
        p: 3
      }}
    >
      <ThinkingIndicator />
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 2, 
          color: theme.palette.text.secondary,
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}