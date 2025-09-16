import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Link as MuiLink } from '@mui/material';
import { Gavel as GavelIcon, Security as SecurityIcon, GppGood as GppGoodIcon, Policy as PolicyIcon, InfoOutlined as InfoOutlinedIcon, LockOutlined as LockOutlinedIcon, ArticleOutlined as ArticleOutlinedIcon, WarningAmberOutlined as WarningAmberOutlinedIcon, BalanceOutlined as BalanceOutlinedIcon, CheckCircleOutline as CheckCircleOutlineIcon, AssignmentIndOutlined as AssignmentIndOutlinedIcon, IntegrationInstructionsOutlined as IntegrationInstructionsOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useTranslation, Trans } from 'react-i18next';

// Import the new legal section components
import Eligibility from '../components/legal/Eligibility';
import UserAccounts from '../components/legal/UserAccounts';
import IntellectualProperty from '../components/legal/IntellectualProperty';
import FeesAndPayment from '../components/legal/FeesAndPayment';
import LimitationOfLiability from '../components/legal/LimitationOfLiability';
import PrivacyPolicyDetails from '../components/legal/PrivacyPolicyDetails';
import ChangesToTerms from '../components/legal/ChangesToTerms';
import Termination from '../components/legal/Termination';
import GoverningLaw from '../components/legal/GoverningLaw';
import Miscellaneous from '../components/legal/Miscellaneous';

// Define consistent styles
const sectionPaperSx = (theme) => ({
  p: { xs: 2, sm: 3, md: 4 },
  mb: 4,
  bgcolor: 'background.paper',
  borderRadius: theme.shape.borderRadius * 2,
});

const h2Styles = { 
  textAlign: 'center', 
  fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }, 
  mb: 3, 
  fontWeight: 'bold', 
  color: 'primary.main'
};
const h3Styles = { 
  fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' }, 
  mt: 3, 
  mb: 2, 
  fontWeight: 'bold', 
  color: 'primary.light'
};
// Apply small font size base style here
const paragraphStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  lineHeight: 1.6, 
  mb: 1.5 
};
const listStyles = { 
  fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }, 
  '.MuiListItemText-secondary': { fontSize: 'inherit', color: 'text.secondary' },
  '.MuiListItemText-primary': { fontSize: 'inherit', fontWeight: 'bold' },
  pl: 2
};
const strongTextStyles = { fontWeight: 'bold' };

function LegalPage() {
  const theme = useTheme();
  const { t, i18n } = useTranslation('pages');

  // Format the current date according to locale
  const lastUpdatedDate = new Date().toLocaleDateString(i18n.language, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Container maxWidth="lg" sx={{ py: {xs: 3, md: 5} }}>
      <Typography variant="h1" component="h1" align="center" gutterBottom sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, fontWeight: 'bold', mb: 4 }}>
        {t('legal.pageTitle')}
      </Typography>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="terms-of-use">
        <Typography variant="h2" component="h2" sx={h2Styles}>
          <GavelIcon sx={{verticalAlign: 'middle', mr: 1}}/>
          {t('legal.sections.termsOfUse.title')}
        </Typography>
        
        <Typography sx={paragraphStyles}>
          {t('legal.sections.termsOfUse.welcome')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.termsOfUse.serviceDescription.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.termsOfUse.serviceDescription.content')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.termsOfUse.acceptanceOfTerms.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.termsOfUse.acceptanceOfTerms.content')}
        </Typography>

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.termsOfUse.eligibility.title')}
        </Typography>
        <Eligibility />

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.termsOfUse.userAccounts.title')}
        </Typography>
        <UserAccounts />

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.termsOfUse.intellectualProperty.title')}
        </Typography>
        <IntellectualProperty />

        <Typography component="div" sx={{...h3Styles, color: 'text.secondary', fontStyle:'italic'}}>
          {t('legal.sections.termsOfUse.feesAndPayment.title')}
        </Typography>
        <FeesAndPayment />
      </Paper>
      
      <Paper elevation={3} sx={sectionPaperSx(theme)} id="acceptable-use">
        <Typography variant="h2" component="h2" sx={h2Styles}>
          <CheckCircleOutlineIcon sx={{verticalAlign: 'middle', mr: 1}}/>
          {t('legal.sections.acceptableUse.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.acceptableUse.intro')}
        </Typography>
        <List sx={listStyles}>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.unlawful.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.unlawful.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.harmMinors.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.harmMinors.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.advertising.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.advertising.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.impersonate.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.impersonate.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.nefarious.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.nefarious.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.acceptableUse.prohibitions.interference.title')}
              secondary={t('legal.sections.acceptableUse.prohibitions.interference.description')}
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="disclaimers">
        <Typography variant="h2" component="h2" sx={h2Styles}>
          <WarningAmberOutlinedIcon sx={{verticalAlign: 'middle', mr: 1}}/>
          {t('legal.sections.disclaimers.title')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.disclaimers.asIs.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.disclaimers.asIs.content" t={t}>
            The information and services provided by VirtualMD.app, including all content generated by AI personas, are provided on an "AS IS" and "AS AVAILABLE" basis for <strong style={strongTextStyles}>INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY</strong>. MindScript makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included on the Service. You expressly agree that your use of the Service is at your sole risk.
          </Trans>
        </Typography>
        <Typography sx={{...paragraphStyles, fontWeight: 'bold', color: 'error.main'}}>
          {t('legal.sections.disclaimers.asIs.warning')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.disclaimers.asIs.limitations')}
        </Typography>
        <Typography sx={{...paragraphStyles, fontWeight: 'bold', color: 'error.main'}}>
          {t('legal.sections.disclaimers.asIs.fdaWarning')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.disclaimers.noHipaa.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.disclaimers.noHipaa.content" t={t}>
            You explicitly acknowledge and agree that VirtualMD.app, in its general consumer-facing service offering, is <strong style={strongTextStyles}>NOT A HIPAA-COMPLIANT SERVICE</strong> for the purposes of use by HIPAA Covered Entities or their Business Associates managing Protected Health Information (PHI) as defined under the Health Insurance Portability and Accountability Act of 1996 (HIPAA).
          </Trans>
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.disclaimers.noHipaa.details" t={t}>
            While MindScript implements strong security measures (detailed in the Privacy Policy section), the platform's architecture, data handling, and operational procedures for the general service <strong style={strongTextStyles}>do not meet the specific administrative, physical, and technical safeguard requirements mandated by the HIPAA Security Rule for handling PHI</strong> by Covered Entities or Business Associates acting on their behalf without a specific Business Associate Agreement (BAA) in place for a dedicated use case.
          </Trans>
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.disclaimers.noHipaa.agreement" t={t}>
            By using the Service, you agree that you will <strong style={strongTextStyles}>NOT</strong> use it to store, process, or transmit PHI in a manner that would require HIPAA compliance on the part of MindScript, unless you have entered into a separate, valid BAA with MindScript Technologies, LLC for a specific, agreed-upon purpose. You agree that the applicable data security standard for information you provide is that of <strong style={strongTextStyles}>reasonable business security practices within the United States</strong>, not the specific standards mandated by HIPAA for PHI.
          </Trans>
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.disclaimers.dataSecurity.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.disclaimers.dataSecurity.content')}
        </Typography>
        <Typography sx={{...paragraphStyles, fontWeight: 'bold'}}>
          <Trans i18nKey="legal.sections.disclaimers.dataSecurity.warning" t={t}>
            Therefore, by using this Site, you expressly acknowledge and agree that while MindScript will make reasonable efforts to protect your data consistent with standard business practices, <strong style={strongTextStyles}>WE DO NOT GUARANTEE THE ABSOLUTE SECURITY OF YOUR INFORMATION</strong>. You agree that you <strong style={strongTextStyles}>CANNOT AND WILL NOT SUE OR HOLD MINDSCRIPT TECHNOLOGIES, LLC, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS LIABLE</strong> for any damages, losses, costs, or expenses arising out of or in connection with any unauthorized access, use, disclosure, alteration, or destruction of your information (including data breaches), provided that MindScript has implemented reasonable security measures. Your use of the Service constitutes your acceptance of this risk.
          </Trans>
        </Typography>

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.disclaimers.generalLiability.title')}
        </Typography>
        <LimitationOfLiability />

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.disclaimers.emergency.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.disclaimers.emergency.content" t={t}>
            VirtualMD.app <strong style={strongTextStyles}>CANNOT</strong> act on your behalf in an emergency. If the system suggests you call emergency services (e.g., 911, 999, 101, 000) or seek immediate medical attention, you are solely responsible for taking that action. The Service does not dispatch emergency services. Always rely on local emergency services for urgent medical needs.
          </Trans>
        </Typography>
      </Paper>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="privacy-policy">
        <Typography variant="h2" component="h2" sx={h2Styles}>
          <PolicyIcon sx={{verticalAlign: 'middle', mr: 1}}/>
          {t('legal.sections.privacyPolicy.title')}
        </Typography>

        <Typography sx={paragraphStyles}>
          {t('legal.sections.privacyPolicy.intro')}
        </Typography>

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.privacyPolicy.dataPledge.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.privacyPolicy.dataPledge.content')}
        </Typography>
        <List sx={listStyles} dense>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.dataPledge.items.security.title')}
              secondary={t('legal.sections.privacyPolicy.dataPledge.items.security.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.dataPledge.items.noPII.title')}
              secondary={t('legal.sections.privacyPolicy.dataPledge.items.noPII.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.dataPledge.items.noSale.title')}
              secondary={t('legal.sections.privacyPolicy.dataPledge.items.noSale.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.dataPledge.items.anonymized.title')}
              secondary={t('legal.sections.privacyPolicy.dataPledge.items.anonymized.description')}
            />
          </ListItem>
        </List>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.privacyPolicy.infoCollection.title')}
        </Typography>
        <PrivacyPolicyDetails />
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.privacyPolicy.securityPractices.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.privacyPolicy.securityPractices.intro')}
        </Typography>
        <List sx={listStyles}>
          <ListItem>
            <ListItemIcon><LockOutlinedIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.password.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.password.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><LockOutlinedIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.twoFactor.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.twoFactor.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><LockOutlinedIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.threeFactor.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.threeFactor.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><SecurityIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.dataEncryption.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.dataEncryption.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><GppGoodIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.deletion.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.deletion.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><PolicyIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.securityPractices.items.access.title')}
              secondary={t('legal.sections.privacyPolicy.securityPractices.items.access.description')}
            />
          </ListItem>
        </List>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.privacyPolicy.securityPractices.conclusion')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.privacyPolicy.hipaaReiteration.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans i18nKey="legal.sections.privacyPolicy.hipaaReiteration.content" t={t}>
            As stated in the Disclaimers, the general VirtualMD.app service is <strong style={strongTextStyles}>NOT HIPAA compliant</strong> for Covered Entity / Business Associate use cases involving PHI without a specific BAA. While we implement strong security, our general service operates under standard business security practices, not the specific requirements of the HIPAA Security Rule for PHI managed by Covered Entities.
          </Trans>
        </Typography>
        <Typography sx={{...paragraphStyles, fontWeight: 'bold', textDecoration: 'underline', color: 'warning.main', my: 2}}>
          {t('legal.sections.privacyPolicy.hipaaReiteration.warning')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.privacyPolicy.thirdParty.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          {t('legal.sections.privacyPolicy.thirdParty.intro')}
        </Typography>
        <List sx={listStyles} dense>
          <ListItem>
            <ListItemIcon><GppGoodIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.thirdParty.items.mindscript.title')}
              secondary={t('legal.sections.privacyPolicy.thirdParty.items.mindscript.description')}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon><GppGoodIcon/></ListItemIcon>
            <ListItemText 
              primary={t('legal.sections.privacyPolicy.thirdParty.items.providers.title')}
              secondary={t('legal.sections.privacyPolicy.thirdParty.items.providers.description')}
            />
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={3} sx={sectionPaperSx(theme)} id="other-legal">
        <Typography variant="h2" component="h2" sx={h2Styles}>
          <BalanceOutlinedIcon sx={{verticalAlign: 'middle', mr: 1}}/>
          {t('legal.sections.otherLegal.title')}
        </Typography>
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.otherLegal.changesToTerms.title')}
        </Typography>
        <ChangesToTerms />
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.otherLegal.termination.title')}
        </Typography>
        <Termination />
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.otherLegal.governingLaw.title')}
        </Typography>
        <GoverningLaw />
        
        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.otherLegal.contact.title')}
        </Typography>
        <Typography sx={paragraphStyles}>
          <Trans 
            i18nKey="legal.sections.otherLegal.contact.content" 
            t={t}
            values={{ email: 'legal@virtualmd.app' }}
            components={{
              emailLink: <MuiLink href="mailto:legal@virtualmd.app" />
            }}
          >
            If you have any questions about these Terms or the Privacy Policy, please contact us at: <emailLink>legal@virtualmd.app</emailLink> or via our Contact Us page.
          </Trans>
        </Typography>

        <Typography component="div" sx={h3Styles}>
          {t('legal.sections.otherLegal.miscellaneous.title')}
        </Typography>
        <Miscellaneous />
        
        <Typography sx={{...paragraphStyles, mt: 3, fontSize: '0.75rem', textAlign: 'center'}}>
          {t('legal.lastUpdated', { date: lastUpdatedDate })}
        </Typography>
      </Paper>
    </Container>
  );
}

export default LegalPage;