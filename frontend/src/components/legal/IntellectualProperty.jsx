import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function IntellectualProperty() {
  const { t } = useTranslation('legal');
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.intellectualProperty.ownershipRights')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.intellectualProperty.limitedLicense')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.intellectualProperty.prohibitedUses')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.intellectualProperty.userContent')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.intellectualProperty.feedback')}
      </Typography>
    </>
  );
}

export default IntellectualProperty;