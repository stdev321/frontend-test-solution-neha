import React from 'react';
import { Typography, List, ListItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Consistent styles
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};
const subHeadingStyles = { ...paragraphStyles, fontWeight: 'bold', mt: 2, mb: 1 };

function PrivacyPolicyDetails() {
  const { t } = useTranslation('legal');
  
  // Get the purposes array with fallback
  const purposes = t('sections.privacyPolicy.infoCollection.howWeUse.purposes', { 
    returnObjects: true, 
    defaultValue: [] 
  });
  
  // Ensure purposes is an array
  const purposesArray = Array.isArray(purposes) ? purposes : [];
  
  return (
    <>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.content')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.accountInfo')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.userContent')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.usageInfo')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.cookies')}
      </Typography>
      
      <Typography component="div" sx={subHeadingStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeUse.title')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeUse.intro')}
      </Typography>
      <List sx={paragraphStyles}>
        {purposesArray.map((purpose, index) => (
          <ListItem key={index} sx={{ display: 'list-item', pl: 0 }}>
            {purpose}
          </ListItem>
        ))}
      </List>
      
      <Typography component="div" sx={subHeadingStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.title')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.vendors')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.legal')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.consent')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.businessTransfers')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.howWeShare.aggregated')}
      </Typography>
      
      <Typography component="div" sx={subHeadingStyles}>
        {t('sections.privacyPolicy.infoCollection.choices.title')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.choices.accountInfo')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.choices.deletion')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.choices.cookies')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.choices.promotional')}
      </Typography>
      
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.retention')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.international')}
      </Typography>
      <Typography sx={paragraphStyles}>
        {t('sections.privacyPolicy.infoCollection.children')}
      </Typography>
    </>
  );
}

export default PrivacyPolicyDetails;