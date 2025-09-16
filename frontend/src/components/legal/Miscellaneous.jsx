import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function Miscellaneous() {
  const { t } = useTranslation('legal');
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.miscellaneous.entireAgreement')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.miscellaneous.severability')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.miscellaneous.waiver')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.otherLegal.miscellaneous.assignment')}
      </Typography>
    </>
  );
}

export default Miscellaneous;