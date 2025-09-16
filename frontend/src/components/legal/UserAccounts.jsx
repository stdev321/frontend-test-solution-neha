import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};

function UserAccounts() {
  const { t } = useTranslation('legal');
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.userAccounts.registrationRequirements')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.userAccounts.accountSecurity')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.userAccounts.accountTermination')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.termsOfUse.userAccounts.singleAccount')}
      </Typography>
    </>
  );
}

export default UserAccounts;