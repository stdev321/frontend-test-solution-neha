import React from 'react';
import { Box, Paper, Typography, Grid, Card, CardActionArea, useTheme, Avatar } from '@mui/material';
import AddCommentIcon from '@mui/icons-material/AddComment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import GridViewIcon from '@mui/icons-material/GridView';
import { useTranslation } from 'react-i18next';
import { constructImageUrl } from '../../../utils/imageUtils';
import { API_BASE_URL } from '../../../services/api';
import VirtualMDLogo from '../../../assets/branding/full_logo_medium.png' // Medium for component;
import { getUserDisplayName } from '../../../utils/nameTransliteration';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Use medium size (256x256) for welcome screen cards
const aileenCarolStaticFallback = `/persona_images/aileen-carol_medium.png`;

export default function WelcomeScreen({ 
  username = 'there',
  currentUser = null,
  userProfile = null,
  aileenCarolImage = null,
  persona = null,
  onStartTeamChat, 
  onGoToEncyclopedia, 
  onGoToManageTeam, 
  onShowSpecialistsGrid,
  onGoToSavedConsultations,
}) {
  const theme = useTheme();
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar' || i18n.language === 'he' || i18n.language === 'fa';
  const isArabic = i18n.language === 'ar';
  
  console.log('[WelcomeScreen] Current language:', i18n.language, 'isArabic:', isArabic, 'isRTL:', isRTL);

  // Prefer frontend-served image paths to ensure alpha/transparency matches local files.
  // 1) Use provided path if it already points to frontend (/persona_images/...)
  // 2) Else, build a frontend-relative URL from the filename
  // 3) Else, use static fallback
  const rawPath = aileenCarolImage || persona?.image || null;
  const personaImage = (() => {
    if (!rawPath) return aileenCarolStaticFallback;
    if (typeof rawPath === 'string' && (
      rawPath.startsWith('/persona_images/') ||
      rawPath.startsWith('http://') ||
      rawPath.startsWith('https://') ||
      rawPath.startsWith('data:')
    )) {
      return rawPath;
    }
    const filename = String(rawPath).split('/').pop().replace(/\.png$/, '');
    return `/persona_images/${filename}_medium.png`;
  })();

  console.log('[WelcomeScreen] Database image path:', rawPath);
  console.log('[WelcomeScreen] Final image URL:', personaImage);

  const actions = [
    { label: t('sidebarHeader.panel'), icon: <GridViewIcon fontSize="large" />, onClick: onShowSpecialistsGrid || onGoToManageTeam, bg:'#1e7dd7' },
    { label: t('welcome.startTeamConsultation'), icon: <AddCommentIcon fontSize="large" />, onClick: onStartTeamChat, bg:'#4550b5' },
    { label: t('sidebarHeader.savedConsultations'), icon: <HistoryIcon fontSize="large" />, onClick: onGoToSavedConsultations, bg:'#7c4bcf' },
    { label: t('sidebarHeader.encyclopedia'), icon: <MenuBookIcon fontSize="large" />, onClick: onGoToEncyclopedia, bg:'#8d64d9' },
  ];

  const handleImageError = (e) => {
    console.warn('[WelcomeScreen] Image failed to load:', personaImage, 'falling back to static image');
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = aileenCarolStaticFallback; // Fallback to hardcoded static image
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        textAlign: 'center',
        width: '95%',
        // Let the panel scroll; avoid fixed 95% height which can cause overflow
        height: 'auto',
        maxWidth: 1000,
        mx: 'auto',
        bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300],
        color: theme.palette.getContrastText(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]),
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top section: avatar + bubble */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        {/* Dr Carol full image & title */}
        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', mr: isRTL ? 0 : 4, ml: isRTL ? 4 : 0 }}>
          <Box
            component="img"
            src={personaImage}
            onError={handleImageError}
            sx={{ height:{ xs: 240, md: 420 }, maxHeight: 450, objectFit:'contain', borderRadius:0, mt: 1 }}
          />
          <Typography variant="h4" sx={{ mt:1, fontWeight:700 }}>
            {persona?.name || t('personas.defaultName', 'Health Expert Aileen Carol')}
          </Typography>
          {persona?.specialty && (
            <Typography variant="h6" sx={{ mt:0.5, fontWeight:400, color: theme.palette.text.secondary }}>
              {persona.specialty}
            </Typography>
          )}
        </Box>

        {/* Speech bubble */}
        <Box sx={{ position: 'relative', flexBasis: '40%', mt: 0 }}>
          <Paper sx={{ p: 6, borderRadius: 2, bgcolor: '#fff', width:'100%', minHeight:220 }}>
            <Typography variant="h5" sx={{ fontStyle:'italic', lineHeight:1.6, color: theme.palette.primary.main }}>
              {t('welcome.greeting', { 
                username: currentUser && userProfile ? getUserDisplayName(currentUser, userProfile, i18n.language) : username 
              })}
            </Typography>
          </Paper>
          {/* bubble tail positioned for LTR (left side) or RTL (right side) */}
          <Box sx={{ 
            position:'absolute', 
            left: isRTL ? 'auto' : '-14px',
            right: isRTL ? '-14px' : 'auto',
            top:'15%', 
            width:28, 
            height:28, 
            bgcolor:'#fff', 
            transform:'rotate(45deg)' 
          }} />
        </Box>
      </Box>

      {/* Action cards */}
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {actions.map((action, idx) => (
          <Grid item xs={6} sm={3} key={action.label}>
            <Card
              sx={{
                height: 200,
                bgcolor: action.bg || (theme.palette.mode==='dark'? theme.palette.grey[900]: theme.palette.grey[200]),
                color:'#fff',
                display:'flex', justifyContent:'center', alignItems:'center'
              }}
            >
              <CardActionArea
                onClick={action.onClick}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {React.cloneElement(action.icon, {
                  sx: {
                    fontSize: 52,
                    color: idx === 0 ? theme.palette.primary.main : 'inherit',
                  },
                })}
                <Typography variant="h6" align="center" sx={{ mt: 1.5, fontWeight:600 }}>
                  {action.label}
                </Typography>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
} 