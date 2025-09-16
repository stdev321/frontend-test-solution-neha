import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';

function TranslatedTermsContent() {
  const { t } = useTranslation('pages');
  
  // Get the terms data from i18n
  const termsData = t('legal.termsOfUse', { returnObjects: true });
  
  if (!termsData || typeof termsData !== 'object') {
    // Fallback if translation is not available
    return (
      <Box>
        <Typography paragraph>
          Terms of Use content is not available in your language.
        </Typography>
      </Box>
    );
  }

  const renderSection = (sectionKey, section) => {
    if (!section || typeof section !== 'object') return null;
    
    return (
      <Box key={sectionKey} sx={{ mb: 3 }}>
        {section.title && (
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
            {section.title}
          </Typography>
        )}
        
        {section.content && (
          <Typography 
            paragraph 
            sx={{ whiteSpace: 'pre-wrap', mb: 2 }}
          >
            {section.content}
          </Typography>
        )}
        
        {section.subsections && Object.entries(section.subsections).map(([subKey, subsection]) => (
          <Box key={subKey} sx={{ ml: 2, mb: 2 }}>
            {subsection.title && (
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {subsection.title}
              </Typography>
            )}
            {subsection.content && (
              <Typography 
                paragraph 
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {subsection.content}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" align="center" sx={{ mb: 1 }}>
        {termsData.header?.company || 'VirtualMD.app Website'}
      </Typography>
      <Typography variant="h6" align="center" sx={{ mb: 3 }}>
        {termsData.header?.llc || 'VirtualMD Technologies LLC'}
      </Typography>
      
      {/* Title */}
      <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
        {termsData.title || 'Terms of Use'}
      </Typography>
      
      {/* Welcome paragraph */}
      {termsData.welcome && (
        <Typography paragraph sx={{ mb: 3 }}>
          {termsData.welcome}
        </Typography>
      )}
      
      {/* Sections */}
      {termsData.sections && Object.entries(termsData.sections).map(([key, section]) => 
        renderSection(key, section)
      )}
    </Box>
  );
}

export default TranslatedTermsContent;