import React from 'react';
import { Box, Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider, Link as MuiLink } from '@mui/material';
import { Gavel as GavelIcon, Security as SecurityIcon, GppGood as GppGoodIcon, Policy as PolicyIcon, InfoOutlined as InfoOutlinedIcon, LockOutlined as LockOutlinedIcon, ArticleOutlined as ArticleOutlinedIcon, WarningAmberOutlined as WarningAmberOutlinedIcon, BalanceOutlined as BalanceOutlinedIcon, CheckCircleOutline as CheckCircleOutlineIcon, AssignmentIndOutlined as AssignmentIndOutlinedIcon, IntegrationInstructionsOutlined as IntegrationInstructionsOutlinedIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

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

  return (
    <Container maxWidth="lg" sx={{ py: {xs: 3, md: 5} }}>
      <Typography variant="h1" component="h1" align="center" gutterBottom sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' }, fontWeight: 'bold', mb: 4 }}>
        VirtualMD.app Legal Terms & Privacy Policy
      </Typography>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="terms-of-use">
        <Typography variant="h2" component="h2" sx={h2Styles}><GavelIcon sx={{verticalAlign: 'middle', mr: 1}}/> Terms of Use</Typography>
        
        <Typography sx={paragraphStyles}>
          Welcome to VirtualMD.app (the "Service", "Site"), operated by VirtualMD Technologies, LLC ("VirtualMD", "we", "us", "our"). These Terms of Use ("Terms") govern your access to and use of our website, AI personas, content, and services. By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy, incorporated herein by reference. If you do not agree to these Terms, do not use the Service.
        </Typography>
        
        <Typography component="div" sx={h3Styles}>1. Service Description</Typography>
        <Typography sx={paragraphStyles}>
          VirtualMD.app provides access to advanced AI personas designed to offer health-related information and insights based on medical literature, clinical guidelines, and AI training data. The Service is intended for informational and educational purposes only.
        </Typography>
        
        <Typography component="div" sx={h3Styles}>2. Acceptance of Terms</Typography>
        <Typography sx={paragraphStyles}>
          By registering for, accessing, browsing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. You represent that you are of legal age to form a binding contract. Your use of the Service constitutes your electronic signature to these Terms.
        </Typography>

        {/* Placeholder for other standard Terms sections */}
        <Typography component="div" sx={h3Styles}>3. Eligibility</Typography>
        <Eligibility />

        <Typography component="div" sx={h3Styles}>4. User Accounts and Registration</Typography>
        <UserAccounts />

        <Typography component="div" sx={h3Styles}>5. Intellectual Property Rights</Typography>
        <IntellectualProperty />

        <Typography component="div" sx={{...h3Styles, color: 'text.secondary', fontStyle:'italic'}}>6. Fees and Payment (Placeholder)</Typography>
        <FeesAndPayment />
      </Paper>
      
      <Paper elevation={3} sx={sectionPaperSx(theme)} id="acceptable-use">
         <Typography variant="h2" component="h2" sx={h2Styles}><CheckCircleOutlineIcon sx={{verticalAlign: 'middle', mr: 1}}/> Acceptable Use Policy</Typography>
         <Typography sx={paragraphStyles}>
           You agree to use VirtualMD.app only for lawful purposes and in accordance with these Terms. You agree not to use the Service:
         </Typography>
         <List sx={listStyles}>
            <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="For any unlawful purpose" secondary="Including violating any applicable federal, state, local, or international law or regulation."/></ListItem>
            <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="To harm or attempt to harm minors" secondary="Or expose them to inappropriate content."/></ListItem>
            <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="To transmit, or procure the sending of, any advertising or promotional material" secondary="Without our prior written consent, including any 'junk mail', 'chain letter', 'spam', or any other similar solicitation."/></ListItem>
            <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="To impersonate or attempt to impersonate VirtualMD" secondary="A VirtualMD employee, another user, or any other person or entity."/></ListItem>
            <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="For nefarious purposes of any sort" secondary="You explicitly agree not to use the Service to seek information, guidance, or means related to causing harm to yourself or others. This includes, but is not limited to, researching methods of self-harm, violence, illegal activities, or any action that could endanger yourself or another person. Using the platform for such purposes is a violation of these Terms and may result in immediate account termination and reporting to relevant authorities if applicable."/></ListItem>
             <ListItem><ListItemIcon><WarningAmberOutlinedIcon sx={{color: 'error.light'}}/></ListItemIcon><ListItemText primary="In any way that interferes with the proper working of the Service" secondary="Including introducing viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful; attempting to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service."/></ListItem>
         </List>
      </Paper>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="disclaimers">
         <Typography variant="h2" component="h2" sx={h2Styles}><WarningAmberOutlinedIcon sx={{verticalAlign: 'middle', mr: 1}}/> Disclaimers and Limitation of Liability</Typography>
         
         <Typography component="div" sx={h3Styles}>1. Service Provided "AS IS"; ADVICE ONLY</Typography>
         <Typography sx={paragraphStyles}>
            The information and services provided by VirtualMD.app, including all content generated by AI personas, are provided on an "AS IS" and "AS AVAILABLE" basis for <strong style={strongTextStyles}>INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY</strong>. VirtualMD makes no representations or warranties of any kind, express or implied, as to the operation of the Service or the information, content, materials, or products included on the Service. You expressly agree that your use of the Service is at your sole risk.
         </Typography>
         <Typography sx={{...paragraphStyles, fontWeight: 'bold', color: 'error.main'}}>
            VirtualMD.app IS ADVICE ONLY. It is NOT a substitute for professional medical advice, diagnosis, or treatment from a qualified healthcare provider. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or interacted with on the Service.
         </Typography>
         <Typography sx={paragraphStyles}>
            VirtualMD does not provide medical diagnosis or treatment. AI-generated content may contain errors or omissions despite our validation processes. Medical advice requires personalized evaluation by licensed healthcare providers. Health information may become outdated. Your unique medical history requires professional evaluation.
         </Typography>
          <Typography sx={{...paragraphStyles, fontWeight: 'bold', color: 'error.main'}}>
            The Service, its content, and its AI personas are NOT approved by the U.S. Food and Drug Administration (FDA) or any other regulatory body as a medical device or for diagnostic or treatment purposes.
          </Typography>
          
         <Typography component="div" sx={h3Styles}>2. No HIPAA Compliance for General Use</Typography>
         <Typography sx={paragraphStyles}>
            You explicitly acknowledge and agree that VirtualMD.app, in its general consumer-facing service offering, is <strong style={strongTextStyles}>NOT A HIPAA-COMPLIANT SERVICE</strong> for the purposes of use by HIPAA Covered Entities or their Business Associates managing Protected Health Information (PHI) as defined under the Health Insurance Portability and Accountability Act of 1996 (HIPAA).
         </Typography>
          <Typography sx={paragraphStyles}>
             While VirtualMD implements strong security measures (detailed in the Privacy Policy section), the platform's architecture, data handling, and operational procedures for the general service <strong style={strongTextStyles}>do not meet the specific administrative, physical, and technical safeguard requirements mandated by the HIPAA Security Rule for handling PHI</strong> by Covered Entities or Business Associates acting on their behalf without a specific Business Associate Agreement (BAA) in place for a dedicated use case.
         </Typography>
         <Typography sx={paragraphStyles}>
            By using the Service, you agree that you will <strong style={strongTextStyles}>NOT</strong> use it to store, process, or transmit PHI in a manner that would require HIPAA compliance on the part of VirtualMD, unless you have entered into a separate, valid BAA with VirtualMD Technologies, LLC for a specific, agreed-upon purpose. You agree that the applicable data security standard for information you provide is that of <strong style={strongTextStyles}>reasonable business security practices within the United States</strong>, not the specific standards mandated by HIPAA for PHI.
         </Typography>
         
          <Typography component="div" sx={h3Styles}>3. Limitation of Liability Regarding Data Security</Typography>
          <Typography sx={paragraphStyles}>
             VirtualMD implements commercially reasonable security measures, including encryption and authentication protocols (as detailed in our Privacy Policy), to protect the information you provide to the Service. However, no security system is impenetrable.
         </Typography>
         <Typography sx={{...paragraphStyles, fontWeight: 'bold'}}>
            Therefore, by using this Site, you expressly acknowledge and agree that while VirtualMD will make reasonable efforts to protect your data consistent with standard business practices, <strong style={strongTextStyles}>WE DO NOT GUARANTEE THE ABSOLUTE SECURITY OF YOUR INFORMATION</strong>. You agree that you <strong style={strongTextStyles}>CANNOT AND WILL NOT SUE OR HOLD VirtualMD TECHNOLOGIES, LLC, ITS AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS LIABLE</strong> for any damages, losses, costs, or expenses arising out of or in connection with any unauthorized access, use, disclosure, alteration, or destruction of your information (including data breaches), provided that VirtualMD has implemented reasonable security measures. Your use of the Service constitutes your acceptance of this risk.
          </Typography>

         <Typography component="div" sx={h3Styles}>4. General Limitation of Liability</Typography>
          <LimitationOfLiability />

         <Typography component="div" sx={h3Styles}>5. Emergency Situations</Typography>
         <Typography sx={paragraphStyles}>
            VirtualMD.app <strong style={strongTextStyles}>CANNOT</strong> act on your behalf in an emergency. If the system suggests you call emergency services (e.g., 911, 999, 101, 000) or seek immediate medical attention, you are solely responsible for taking that action. The Service does not dispatch emergency services. Always rely on local emergency services for urgent medical needs.
         </Typography>
      </Paper>

      <Paper elevation={3} sx={sectionPaperSx(theme)} id="privacy-policy">
        <Typography variant="h2" component="h2" sx={h2Styles}><PolicyIcon sx={{verticalAlign: 'middle', mr: 1}}/> Privacy Policy</Typography>

        <Typography sx={paragraphStyles}>
          This Privacy Policy explains how VirtualMD Technologies, LLC collects, uses, and discloses information about you through our VirtualMD.app website and services. This policy is incorporated into our Terms of Use.
        </Typography>

        <Typography component="div" sx={h3Styles}>1. Our Data Privacy Pledge</Typography>
        <Typography sx={paragraphStyles}>
          At VirtualMD.app, the privacy and security of your personal information are paramount. We are committed to maintaining the confidentiality and integrity of the data you entrust to us. Our platform is designed with robust security measures to protect your information from unauthorized access, disclosure, alteration, and destruction.
        </Typography>
        <List sx={listStyles} dense>
           <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon><ListItemText primary="Security Efforts:" secondary="We employ industry-standard encryption protocols for data in transit and at rest, alongside multi-layered security architectures including mandatory 2FA."/></ListItem>
           <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon><ListItemText primary="No External Use of PII:" secondary="We do not use your information in any personally identifiable way for external purposes without your explicit consent."/></ListItem>
           <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon><ListItemText primary="No Sale of Personal Information:" secondary="We will never sell your personal information to third parties."/></ListItem>
            <ListItem><ListItemIcon><CheckCircleOutlineIcon sx={{color: 'success.light'}}/></ListItemIcon><ListItemText primary="Anonymized Data for Improvement:" secondary="We use rigorously anonymized and aggregated data (with all PII removed) to enhance the accuracy, efficacy, and safety of our AI models and platform features. This does not allow identification of any individual user."/></ListItem>
        </List>
        
        <Typography component="div" sx={h3Styles}>2. Information We Collect & Other Privacy Details</Typography>
         <PrivacyPolicyDetails />
         
        <Typography component="div" sx={h3Styles}>5. VirtualMD.app's Security Practices</Typography>
        <Typography sx={paragraphStyles}>
           We employ a multi-layered security strategy:
        </Typography>
        <List sx={listStyles}>
           <ListItem><ListItemIcon><LockOutlinedIcon/></ListItemIcon><ListItemText primary="Password Encryption:" secondary="Passwords are encrypted using industry-standard hashing algorithms."/></ListItem>
           <ListItem><ListItemIcon><LockOutlinedIcon/></ListItemIcon><ListItemText primary="Two-Factor Authentication (2FA):" secondary="Mandatory for all accounts, requiring verification via a second factor (e.g., code to email/phone)."/></ListItem>
           <ListItem><ListItemIcon><LockOutlinedIcon/></ListItemIcon><ListItemText primary="Three-Factor Authentication (3FA) Option:" secondary="Optional enhanced security requiring password, email code, AND SMS code."/></ListItem>
           <ListItem><ListItemIcon><SecurityIcon/></ListItemIcon><ListItemText primary="Data Encryption:" secondary="Information (including conversations) is encrypted at rest and in transit (TLS/SSL)."/></ListItem>
           <ListItem><ListItemIcon><GppGoodIcon/></ListItemIcon><ListItemText primary="Permanent Data Deletion:" secondary="You can permanently delete individual conversations or your entire account. Deleted information is irrecoverable from our primary systems."/></ListItem>
            <ListItem><ListItemIcon><PolicyIcon/></ListItemIcon><ListItemText primary="Access Controls:" secondary="Access to user database records by personnel is strictly controlled, limited, logged, and governed by internal policies. Routine browsing is prohibited."/></ListItem>
        </List>
        <Typography sx={paragraphStyles}>
          These measures provide robust account security, but remember no system is 100% secure.
        </Typography>
        
        <Typography component="div" sx={h3Styles}>6. VirtualMD.app & HIPAA Considerations (Reiteration)</Typography>
        <Typography sx={paragraphStyles}>
          As stated in the Disclaimers, the general VirtualMD.app service is <strong style={strongTextStyles}>NOT HIPAA compliant</strong> for Covered Entity / Business Associate use cases involving PHI without a specific BAA. While we implement strong security, our general service operates under standard business security practices, not the specific requirements of the HIPAA Security Rule for PHI managed by Covered Entities.
        </Typography>
         <Typography sx={{...paragraphStyles, fontWeight: 'bold', textDecoration: 'underline', color: 'warning.main', my: 2}}>
            Users requiring strict HIPAA compliance for PHI they manage should not use our general platform for such purposes without a BAA. Users must not input information traceable to individual patients in a context violating HIPAA without explicit, informed consent acknowledging the platform's non-HIPAA compliant status for that use.
         </Typography>
        
        <Typography component="div" sx={h3Styles}>7. Data Usage by Third-Party AI Engine Providers</Typography>
        <Typography sx={paragraphStyles}>
           VirtualMD integrates with leading AI model providers (e.g., OpenAI, Anthropic, Google).
        </Typography>
         <List sx={listStyles} dense>
           <ListItem><ListItemIcon><GppGoodIcon/></ListItemIcon><ListItemText primary="VirtualMD.app:" secondary="We only use anonymized, aggregated data for internal system improvement."/></ListItem>
            <ListItem><ListItemIcon><GppGoodIcon/></ListItemIcon><ListItemText primary="Third-Party AI API Providers:" secondary="Major providers accessed via API (like OpenAI, Anthropic) typically state in their policies that data submitted via API is NOT used to train their general foundation models. We configure our use of these services to align with these privacy-preserving options. Review their specific policies for details."/></ListItem>
         </List>
         
      </Paper>
      
      <Paper elevation={3} sx={sectionPaperSx(theme)} id="other-legal">
         <Typography variant="h2" component="h2" sx={h2Styles}><BalanceOutlinedIcon sx={{verticalAlign: 'middle', mr: 1}}/> Other Legal Provisions</Typography>
         
          <Typography component="div" sx={h3Styles}>Changes to These Terms and Policy</Typography>
           <ChangesToTerms />
           
          <Typography component="div" sx={h3Styles}>Termination</Typography>
           <Termination />
           
          <Typography component="div" sx={h3Styles}>Governing Law and Dispute Resolution</Typography>
           <GoverningLaw />
           
          <Typography component="div" sx={h3Styles}>Contact Information</Typography>
          <Typography sx={paragraphStyles}>
             If you have any questions about these Terms or the Privacy Policy, please contact us at: <MuiLink href="mailto:legal@virtualmd.app">legal@virtualmd.app</MuiLink> or via our Contact Us page.
           </Typography>

           <Typography component="div" sx={h3Styles}>Miscellaneous</Typography>
            <Miscellaneous />
            
           <Typography sx={{...paragraphStyles, mt: 3, fontSize: '0.75rem', textAlign: 'center'}}>
             Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
           </Typography>

      </Paper>
      
    </Container>
  );
}

export default LegalPage;

