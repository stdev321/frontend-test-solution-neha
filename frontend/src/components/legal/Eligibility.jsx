import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles (can be passed as props or defined locally if simple)
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function Eligibility() {
  const { t } = useTranslation('legal');

  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.eligibility.ageRequirement')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.eligibility.legalCapacity')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.eligibility.territorialRestrictions')}
      </Typography>
    </>
  );
}

export default Eligibility; 