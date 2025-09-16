import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};
const strongTextStyles = { fontWeight: 'bold' };

function LimitationOfLiability() {
  const { t } = useTranslation('legal');
  
  return (
    <Typography sx={paragraphStyles}>
      {t('sections.disclaimers.generalLiability.content')}
    </Typography>
  );
}

export default LimitationOfLiability;