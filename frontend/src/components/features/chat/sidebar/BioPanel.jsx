// BioPanel.jsx - Simplified version that displays pre-translated persona data
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Define the base URL for the images
// Use high quality for bio panel (512x512)
const femaleDoctorImage = `/persona_images/aileen-carol_high.png`;

// Helper: always serve from frontend public path; default to _high.png for bio
const constructFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return null;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  let filename = imagePath.trim();

  // Remove common prefixes to get to the actual filename
  if (filename.startsWith('/persona_images/')) {
    filename = filename.substring('/persona_images/'.length);
  } else if (filename.startsWith('persona_images/')) {
    filename = filename.substring('persona_images/'.length);
  } else if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }
  
  if (filename.trim() === '') return null;
  // Normalize to high-res for bio panel unless an explicit suffix is present
  if (!/_((tiny)|(medium)|(high))\.png$/i.test(filename)) {
    filename = filename.replace(/\.png$/i, '') + '_high.png';
  }
  return `/persona_images/${filename}`;
};

// BioPanel Component - Now displays pre-translated content
function BioPanel({ data, onReturnToPanel }) {
  const { t, i18n } = useTranslation('chat');
  const theme = useTheme();

  console.log("[BioPanel] Received data prop:", JSON.stringify(data, null, 2));

  if (!data) return <Typography sx={{p:2}}>{t('bioPanel.loadingBio')}</Typography>;

  // The 'image' field from persona details
  const rawImagePath = data.image || data.image_url_or_path;
  const constructedImageUrl = constructFullImageUrl(rawImagePath);

  console.log(`[BioPanel] For persona: ${data.name}, rawImagePath: "${rawImagePath}", constructedImageUrl: "${constructedImageUrl}"`);

  // Use the bio that comes from the pre-translated files
  // The personaI18nService already provides the correct translated content
  const { name, specialty } = data;
  const bioTextToDisplay = data.public_bio || data.bio || '';

  // Default image if specific one isn't available for the persona
  const imageToDisplay = constructedImageUrl || femaleDoctorImage; 

  // Determine background color based on theme mode
  const bioPanelBgColor = theme.palette.mode === 'dark' 
    ? theme.palette.primary.main // Darker blue for dark mode
    : theme.palette.primary.light; // Light blue for light mode

  const specialtyColor = '#FFFFFF'; // Always white
  const bioContentColor = theme.palette.mode === 'light' ? '#FFFFFF' : theme.palette.text.primary;

  // Check if current language is RTL
  const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);
  
  // Debug logging
  console.log(`[BioPanel] Language: ${i18n.language}, isRTL: ${isRTL}`);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        bgcolor: bioPanelBgColor,
        overflowY: 'auto',
        borderRadius: '8px',
      }}
    > 
      {/* Image displayed larger, above the text */} 
      {imageToDisplay && (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            component="img"
            src={imageToDisplay}
            alt={`${name || t('guest.personas.defaultSpecialist', 'AI Specialist')} avatar`}
            sx={{
              width: '150px',
              height: '150px',
              objectFit: 'contain',
              borderRadius: '8px',
              display: 'inline-block'
            }}
            onError={(e) => { 
              e.target.onerror = null; // prevent loops
              e.target.src = femaleDoctorImage; // Fallback to default local image
            }}
          />
        </Box>
      )}
      
      {/* Name and Specialty */} 
      <Box sx={{ mb: 2, textAlign: 'center' }}> 
        <Typography variant="h5" component="div">{name || t('common.personas.defaultSpecialist')}</Typography>
        {specialty && 
          <Typography 
            variant="subtitle1" 
            sx={{ color: specialtyColor }}
          >
            {specialty}
          </Typography>}
      </Box>

      {/* Biography Text */} 
      {bioTextToDisplay && (
        <Typography 
          variant="body2" 
          sx={{ 
            lineHeight: 1.6, 
            whiteSpace: 'pre-wrap',
            color: bioContentColor,
          }}
        >
          {bioTextToDisplay}
        </Typography>
      )}

      {/* Return Button - only show if onReturnToPanel is provided */}
      {onReturnToPanel && (
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={onReturnToPanel}
            sx={{ 
              color: '#FFFFFF', 
              borderColor: '#FFFFFF',
              '&:hover': {
                borderColor: theme.palette.primary.light,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            {t('bioPanel.returnToPanel')}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

BioPanel.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    bio: PropTypes.string,
    public_bio: PropTypes.string,
    specialty: PropTypes.string,
    image: PropTypes.string,
    image_url_or_path: PropTypes.string,
    voice: PropTypes.string,
    gender: PropTypes.string
  }),
  onReturnToPanel: PropTypes.func,
};

export default BioPanel;