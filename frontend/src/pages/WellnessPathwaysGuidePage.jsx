import React, { useEffect } from 'react';
import { Container, Typography, Box, Paper, Divider } from '@mui/material';
import { useHeaderVisibility, HEADER_MODES } from '../contexts/HeaderVisibilityContext';
import { useTranslation } from 'react-i18next';

function WellnessPathwaysGuidePage() {
  const { setHeaderMode } = useHeaderVisibility();
  const { t } = useTranslation('pages');

  useEffect(() => {
    setHeaderMode(HEADER_MODES.VISIBLE);
    window.scrollTo(0, 0);
  }, [setHeaderMode]);

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t('wellnessPathwaysPage.title')}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Always Consult a Human Healthcare Provider
          </Typography>
          <Typography variant="body1" paragraph>
            While VirtualMD's AI-powered health consultation system provides valuable health information, it is critical to always consult with qualified human healthcare providers for any health concerns. Our board-certified healthcare team developed this system to complement, not replace, professional medical advice.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>In a medical emergency:</strong>
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>United States: Dial 911</li>
            <li>Canada: Dial 911</li>
            <li>United Kingdom: Dial 999 or 112</li>
            <li>Australia: Dial 000 or 112</li>
            <li>Israel: Dial 101 ()</li>
            <li>Other locations: Contact your local emergency services immediately</li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            If you're experiencing chest pain, difficulty breathing, severe bleeding, signs of stroke, or any other serious symptoms—do not wait. Seek emergency care now.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            VirtualMD's Advanced Health AI Technology
          </Typography>
          <Typography variant="body1" paragraph>
            VirtualMD employs patent-pending algorithms developed by our team of Harvard-trained healthcare professionals and AI experts to deliver exceptionally accurate health information. Our AI health advisor personas are trained on extensive health literature, clinical guidelines, and real-world health scenarios to provide insights that closely mirror those of board-certified specialists.
          </Typography>
          <Typography variant="body1" paragraph>
            In controlled side-by-side comparisons for diagnostic accuracy, our system has demonstrated remarkable performance, often matching or exceeding the insights of experienced clinicians. Our AI personas can process thousands of health research papers, guidelines, and clinical protocols in seconds—accessing knowledge beyond what any single human healthcare provider could retain.
          </Typography>
          <Typography variant="body1" paragraph>
            While we strive for exceptional accuracy and our healthcare-led team continuously improves the system, health and wellness is complex and individual health situations are unique. That's why we've designed our platform to augment—not replace—the invaluable expertise of human healthcare providers.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h5" gutterBottom color="error">
            Use At Your Own Risk
          </Typography>
          <Typography variant="body1" paragraph>
            The information provided by VirtualMD and its AI health advisor personas is for informational and educational purposes only. By using this service, you acknowledge and agree that:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>VirtualMD does not provide health diagnosis or treatment</li>
            <li>AI-generated content may contain errors or omissions despite our robust validation processes</li>
            <li>Medical advice requires personalized evaluation by licensed healthcare providers</li>
            <li>Health information may become outdated as health knowledge evolves</li>
            <li>Your unique health history, conditions, and circumstances require professional evaluation</li>
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            While VirtualMD employs sophisticated technology to deliver valuable health insights, users assume all responsibility for how they utilize this information.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold', mt: 3 }}>
            VirtualMD's team has developed this technology because we believe in democratizing access to world-class health knowledge and supporting better health decisions. Our AI system represents a revolutionary advance in health information technology that, when used properly alongside professional care, can help you make more informed health choices and have more productive conversations with your healthcare providers. Not using such advanced technology when available would be foregoing an opportunity to access potentially life-changing health knowledge.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default WellnessPathwaysGuidePage; 