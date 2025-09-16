import React from 'react';
import { Typography, Link as MuiLink, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function SidebarFooter() {
  const { t } = useTranslation('chat');

  return (
    <Box sx={{ 
      p: 2, 
      borderTop: 1, 
      borderColor: 'divider', 
      flexShrink: 0 
    }}>
      <Typography 
        variant="caption" 
        display="block" 
        sx={{ 
          textAlign: 'justify', 
          lineHeight: 1.25,
          mb: 0.5
        }}
      >
        {t('sidebarFooter.disclaimerText')} {' '}
        <MuiLink component={RouterLink} to="/research/ai-accuracy" sx={{ fontWeight: 'bold', color: 'primary.main', textDecoration: 'underline' }}>
          {t('sidebarFooter.moreInformation')}
        </MuiLink>
        .
      </Typography>
      <Typography 
        variant="caption" 
        display="block" 
        sx={{ 
          textAlign: 'center',
          lineHeight: 1.25,
          fontWeight: 'bold', 
          fontStyle: 'italic',
          color: 'primary.main',
          mt: 1
        }}
      >
        {t('sidebarFooter.emergencyText')}
      </Typography>
    </Box>
  );
}

export default SidebarFooter;