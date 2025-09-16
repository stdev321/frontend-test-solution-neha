import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function Termination() {
  const { t } = useTranslation('legal');

  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.termination.userTermination')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.termination.serviceTermination')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.termination.effectOfTermination')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.termination.noLiability')}
      </Typography>
    </>
  );
}

export default Termination; 