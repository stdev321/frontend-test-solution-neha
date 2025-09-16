import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function FeesAndPayment() {
  const { t } = useTranslation('legal');

  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.feesAndPayment.currentlyFree')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.feesAndPayment.futureFeesNotice')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.feesAndPayment.paymentTerms')}
      </Typography>
    </>
  );
}

export default FeesAndPayment; 