import React from 'react';
import { Box, Container, Typography, Paper, Link, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/images/beautiful_see_the_light.jpg';

export default function NoteFromFounders() {
  const theme = useTheme();
  const { t } = useTranslation('pages');
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      flex: 1, // Take up available space in the flex container
      width: '100%',
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: '60% center', // Move image 10% to the right to center sun between columns
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
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        pointerEvents: 'none',
      }
    }}>
      <Container maxWidth="xl" sx={{ 
        flex: 1, // Take up available space
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 4, sm: 6, md: 8 }, // Reduced padding top for better fit
        pb: 2, // Reduced padding bottom
        position: 'relative',
        zIndex: 1,
        px: { xs: 2, sm: 3, md: 6 }
      }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, // Further reduced font size
          color: theme.palette.primary.main,
          mb: { xs: 1, md: 2 }, // Reduced margin
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(255,255,255,0.8)'
        }}>
          {t('founders.title', 'A Note from the Founders')}
        </Typography>

        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2, md: 4 }, // Reduced gap
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          mb: 2, // Reduced margin
          // Ensure content is scrollable if needed but try to fit in viewport
          maxHeight: { xs: 'none', md: 'calc(100vh - 320px)' }
        }}>
          <Box>
            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.paragraph1', 'We built this app with one hope: to help make the world a healthier place by offering access to trustworthy medical guidance—powered by technology that only recently became possible. It\'s the result of collaboration between a scientist and a rabbi, both longtime developers who understand both the promise and the responsibility of this new era of AI.')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.paragraph2', 'Our goal is to provide free and full access to the platform for our first one million users. We believe health should be available to all—not just to those who can afford it. As the platform grows, we may introduce fees for certain premium features. But right now, we\'re focused on getting this into the hands of those who need it most.')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.paragraph3', 'Alongside the latest in medical science, we\'ve made it possible to engage with AI personas inspired by healing traditions from around the world—including Eastern and African systems that are too often overlooked. We don\'t promote any single path. Instead, we offer tools that let individuals explore a range of perspectives and integrate what feels most meaningful to them.')}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.paragraph4', 'We understand that this approach will meet resistance. Some of it will be valid—concerns about accuracy are real, and we take them seriously. Other criticism will come from discomfort with change. But healthcare is evolving, whether the establishment welcomes it or not. Our goal is to guide that change with care, humility, and transparency.')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.paragraph5', 'AI is powerful, but still imperfect. These aren\'t just legal disclaimers—they\'re part of our ethical responsibility to you and to public health. Please use this tool as a supplement, not a substitute, for licensed medical care.')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.closing', 'Thank you for being here. We hope you use it in good health.')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 1.5, lineHeight: 1.5, fontSize: { xs: '0.9rem', md: '1rem' }, color: 'text.primary' }}>
              {t('founders.supportText', 'If you believe in what we\'re building and want to help us keep it going, we do need your support. You can contribute by clicking on the link below.')}
            </Typography>

            <Typography variant="body1" sx={{ 
              fontStyle: 'italic',
              color: theme.palette.text.secondary,
              mt: 2,
              fontSize: { xs: '1rem', md: '1.15rem' }
            }}>
              {t('founders.signature', '– Ron Rubin & Sandy Miles, Creators')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2,
          pt: 2,
          mt: 'auto'
        }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)}
            sx={{ 
              minWidth: 120,
              borderColor: 'primary.main',
              color: 'primary.main',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'primary.dark'
              }
            }}
          >
            {t('common:back', 'Back')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => { window.open('https://buy.stripe.com/dRmdR307g4iH7ZCblp3gk01', '_blank', 'noopener,noreferrer'); }}
            sx={{ 
              minWidth: 120,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark'
              }
            }}
          >
            {t('founders.supportButton', 'Support Us')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}