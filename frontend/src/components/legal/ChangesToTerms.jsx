import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function ChangesToTerms() {
  const { t } = useTranslation('legal');
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.changesToTerms.content')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.changesToTerms.notice')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.changesToTerms.materialChanges')}
      </Typography>
    </>
  );
}

export default ChangesToTerms;