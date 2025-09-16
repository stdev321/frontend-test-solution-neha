import React, { useState } from 'react';
import SiteMeta from '../components/seo/SiteMeta';
import { 
  Box, 
  Container, 
  Typography, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import backgroundImage from '../assets/images/beautiful_see_the_light.jpg';

export default function FAQPage() {
  const theme = useTheme();
  const { t } = useTranslation('pages');
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      id: 'faq1',
      question: t('faqPage.questions.whatIsVirtualMD'),
      answer: t('faqPage.answers.whatIsVirtualMD')
    },
    {
      id: 'faq2',
      question: t('faqPage.questions.replacementForDoctor'),
      answer: t('faqPage.answers.replacementForDoctor')
    },
    {
      id: 'faq3',
      question: t('faqPage.questions.howItWorks'),
      answer: t('faqPage.answers.howItWorks')
    },
    {
      id: 'faq4',
      question: t('faqPage.questions.healthInfoSecure'),
      answer: t('faqPage.answers.healthInfoSecure')
    },
    {
      id: 'faq5',
      question: t('faqPage.questions.tryWithoutAccount'),
      answer: t('faqPage.answers.tryWithoutAccount')
    },
    {
      id: 'faq6',
      question: t('faqPage.questions.supportedLanguages'),
      answer: t('faqPage.answers.supportedLanguages')
    },
    {
      id: 'faq7',
      question: t('faqPage.questions.uploadDocuments'),
      answer: t('faqPage.answers.uploadDocuments')
    },
    {
      id: 'faq8',
      question: t('faqPage.questions.aiAccuracy'),
      answer: t('faqPage.answers.aiAccuracy')
    },
    {
      id: 'faq9',
      question: t('faqPage.questions.conversationHistory'),
      answer: t('faqPage.answers.conversationHistory')
    },
    {
      id: 'faq10',
      question: t('faqPage.questions.voiceSupport'),
      answer: t('faqPage.answers.voiceSupport')
    },
    {
      id: 'faq11',
      question: t('faqPage.questions.whatMakesDifferent'),
      answer: t('faqPage.answers.whatMakesDifferent')
    },
    {
      id: 'faq12',
      question: t('faqPage.questions.cost'),
      answer: t('faqPage.answers.cost')
    }
  ];

  return (
    <>
      <SiteMeta
        title={t('faqPage.seoTitle', 'FAQ — Frequently Asked Questions | VirtualMD')}
        description={t('faqPage.seoDescription', 'Find answers to common questions about VirtualMD AI healthcare platform, virtual consultations, privacy, and health guidance. Get help with our FAQ.')}
        keywords={[
          'VirtualMD FAQ', 'virtual health advisor questions', 'AI healthcare help',
          'telemedicine FAQ', 'health AI questions', 'healthcare platform support'
        ]}
        philippinesOptimized={true}
        breadcrumbs={[
          { name: 'Home', url: 'https://virtualmd.app' },
          { name: 'FAQ', url: 'https://virtualmd.app/faq' }
        ]}
      />
      <Box sx={{ 
        flex: 1,
        width: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        pointerEvents: 'none',
      }
    }}>
        <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 4
              }}
            >
              {t('faqPage.title', 'Frequently Asked Questions')}
            </Typography>
            
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ mb: 4, color: theme.palette.text.secondary }}
            >
              {t('faqPage.subtitle', 'Everything you need to know about VirtualMD')}
            </Typography>

            <Box sx={{ mt: 4 }}>
              {faqs.map((faq) => (
                <Accordion
                  key={faq.id}
                  expanded={expanded === faq.id}
                  onChange={handleChange(faq.id)}
                  sx={{ 
                    mb: 2, 
                    '&:before': { display: 'none' },
                    boxShadow: expanded === faq.id ? 2 : 1
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        margin: '12px 0',
                      },
                    }}
                  >
                    <Typography variant="h6">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            <Box sx={{ mt: 6, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {t('faqPage.stillHaveQuestions', 'Still have questions? Try our AI health assistant!')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/guest-chat')}
                sx={{ mr: 2 }}
              >
                {t('faqPage.tryNow', 'Try Now')}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/contact')}
              >
                {t('faqPage.contactUs', 'Contact Us')}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};
