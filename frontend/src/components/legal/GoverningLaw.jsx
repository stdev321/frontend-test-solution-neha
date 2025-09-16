import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function GoverningLaw() {
  const { t } = useTranslation('legal');
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.governingLaw.governingLaw')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.governingLaw.jurisdiction')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.governingLaw.arbitration')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.governingLaw.classAction')}
      </Typography>
    </>
  );
}

export default GoverningLaw;