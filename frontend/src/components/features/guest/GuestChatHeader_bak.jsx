import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Tooltip,
  Paper,
  Typography,
  useTheme,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  Chat as ChatIcon,
  LocalHospital as HospitalIcon,
  Psychology as PsychologyIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  ExitToApp as ExitIcon,
  AccountCircle as AccountIcon,
  Group as TeamIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Lightbulb as TipIcon,
  AttachFile as FileUploadIcon,
  Mic as VoiceIcon,
  AutoAwesome as AdvancedIcon,
  Star as StarIcon,
  CloudUpload as CloudIcon,
  RecordVoiceOver as VoiceOverIcon,
  Analytics as AnalyticsIcon,
  Translate as TranslateIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
// Use tiny logo for guest chat header
import logoImageSmall from '../../../assets/branding/VMD_Logo_Transparent_tiny.png';

// Dr. Carol avatar for tooltips
// Use tiny size for header avatar
const DR_CAROL_AVATAR = '/persona_images/aileen-carol_tiny.png';

// Custom tooltip component with Dr. Carol's speech bubble
const CarolTooltip = ({ title, children }) => {
  const theme = useTheme();
  
  return (
    <Tooltip
      title={
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1 }}>
          <Avatar
            src={DR_CAROL_AVATAR}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${theme.palette.primary.main}`,
              flexShrink: 0
            }}
          />
          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              bgcolor: 'primary.main',
              color: 'white',
              p: 1.5,
              borderRadius: 2,
              maxWidth: 250,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: 12,
                width: 0,
                height: 0,
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderRight: `8px solid ${theme.palette.primary.main}`,
              }
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
              {title}
            </Typography>
          </Paper>
        </Box>
      }
      placement="bottom"
      arrow={false}
      enterDelay={200}
      leaveDelay={100}
      TransitionComponent={Zoom}
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'transparent',
            boxShadow: 4,
            borderRadius: 2,
            p: 0
          }
        }
      }}
    >
      {children}
    </Tooltip>
  );
};

const GuestChatHeader = ({ isInChat = false, onExitChat }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [featureDialog, setFeatureDialog] = useState({ open: false, feature: null });

  // Premium features configuration
  const premiumFeatures = {
    fileUpload: {
      id: 'fileUpload',
      title: 'Medical Document Upload',
      icon: <CloudIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      description: 'Upload your medical records, lab results, X-rays, and prescriptions for comprehensive analysis.',
      benefits: [
        'Secure document storage',
        'AI analysis of medical images',
        'Lab result interpretation',
        'Prescription tracking',
        'Medical history timeline'
      ]
    },
    voice: {
      id: 'voice',
      title: 'Voice Consultation',
      icon: <VoiceOverIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />,
      description: 'Talk naturally with our AI doctors using advanced voice recognition and natural speech synthesis.',
      benefits: [
        'Hands-free consultation',
        'Natural conversation flow',
        'Multi-language support',
        'Voice symptom detection',
        'Accessibility features'
      ]
    },
    advanced: {
      id: 'advanced',
      title: 'Advanced AI Features',
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
      description: 'Access cutting-edge AI capabilities for personalized health insights and predictive analytics.',
      benefits: [
        'Personalized health predictions',
        'Drug interaction checker',
        'Symptom pattern analysis',
        'Health trend monitoring',
        'Specialist referral network'
      ]
    }
  };

  const handleFeatureClick = (feature) => {
    setFeatureDialog({ open: true, feature: premiumFeatures[feature] });
  };

  // Define navigation items based on chat state
  const navigationItems = isInChat ? [
    {
      id: 'fileUpload',
      icon: <FileUploadIcon />,
      tooltip: "Upload medical documents and images - Sign up to unlock this feature!",
      onClick: () => handleFeatureClick('fileUpload'),
      color: theme.palette.primary.main,
      isPremium: true
    },
    {
      id: 'voice',
      icon: <VoiceIcon />,
      tooltip: "Enable voice consultation - Sign up to talk naturally with our AI doctors!",
      onClick: () => handleFeatureClick('voice'),
      color: theme.palette.success.main,
      isPremium: true
    },
    {
      id: 'advanced',
      icon: <AdvancedIcon />,
      tooltip: "Unlock advanced AI features - Get personalized health insights!",
      onClick: () => handleFeatureClick('advanced'),
      color: theme.palette.secondary.main,
      isPremium: true
    },
    {
      id: 'team',
      icon: <TeamIcon />,
      tooltip: "I'm here with our medical team! Click to see which specialists are helping you today.",
      onClick: () => console.log('Show team'),
      color: theme.palette.primary.main
    },
    {
      id: 'exit',
      icon: <ExitIcon />,
      tooltip: "Leaving already? Sign up to save your conversation history!",
      onClick: onExitChat,
      color: theme.palette.error.main
    }
  ] : [
    {
      id: 'home',
      icon: <HomeIcon />,
      tooltip: "Welcome! Click here to return to the main page anytime.",
      onClick: () => navigate('/'),
      color: theme.palette.primary.main
    },
    {
      id: 'chat',
      icon: <ChatIcon />,
      tooltip: "Ready to start? Let's have a conversation about your health concerns!",
      onClick: () => console.log('Start chat'),
      color: theme.palette.success.main
    },
    {
      id: 'specialists',
      icon: <HospitalIcon />,
      tooltip: "Meet our AI medical specialists - each expert in their field and ready to help!",
      onClick: () => console.log('Show specialists'),
      color: theme.palette.info.main
    },
    {
      id: 'how-it-works',
      icon: <PsychologyIcon />,
      tooltip: "Curious how I work? Let me explain our AI-powered health consultation process!",
      onClick: () => console.log('Show how it works'),
      color: theme.palette.secondary.main
    },
    {
      id: 'help',
      icon: <HelpIcon />,
      tooltip: "Need assistance? I'm here to guide you through using VirtualMD!",
      onClick: () => console.log('Show help'),
      color: theme.palette.warning.main
    }
  ];

  return (
    <>
      <Box
      sx={{
        position: 'relative',
        height: 64,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 1,
        flexShrink: 0
      }}
    >
      {/* Left side - Logo and Navigation icons */}
      <Box sx={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
        {/* VirtualMD Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            mr: 2,
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          <img 
            src={logoImageSmall} 
            alt="VirtualMD" 
            style={{ 
              height: '40px',
              width: 'auto'
            }} 
          />
        </Box>
        
        {/* Navigation Icons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
        {navigationItems.map((item, index) => (
          <Fade key={item.id} in timeout={300 + (index * 100)}>
            <Box sx={{ position: 'relative' }}>
              <CarolTooltip title={item.tooltip}>
                <IconButton
                  onClick={item.onClick}
                  onMouseEnter={() => setHoveredIcon(item.id)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: hoveredIcon === item.id ? `${item.color}15` : 'transparent',
                    color: hoveredIcon === item.id ? item.color : 'text.secondary',
                    border: `2px solid ${hoveredIcon === item.id ? item.color : 'transparent'}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: `${item.color}15`,
                      borderColor: item.color
                    }
                  }}
                >
                  {item.icon}
                </IconButton>
              </CarolTooltip>
              {item.isPremium && (
                <StarIcon 
                  sx={{ 
                    position: 'absolute', 
                    top: -4, 
                    right: -4, 
                    fontSize: 16, 
                    color: theme.palette.warning.main,
                    bgcolor: 'background.paper',
                    borderRadius: '50%',
                    padding: '2px'
                  }} 
                />
              )}
            </Box>
          </Fade>
        ))}
        </Box>
      </Box>

      {/* Right side - User profile */}
      <Fade in timeout={800}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CarolTooltip title="You're using our guest experience! Sign up anytime to save your conversations and unlock all features.">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 20,
                bgcolor: 'grey.100',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'grey.200',
                  transform: 'translateY(-2px)',
                  boxShadow: 2
                }
              }}
              onClick={() => navigate('/register')}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '1.2rem',
                  fontWeight: 'bold'
                }}
              >
                G
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  Guest User
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                  Click to sign up
                </Typography>
              </Box>
            </Box>
          </CarolTooltip>
        </Box>
      </Fade>
      </Box>

      <Dialog 
      open={featureDialog.open} 
      onClose={() => setFeatureDialog({ open: false, feature: null })}
      maxWidth="sm"
      fullWidth
    >
      {featureDialog.feature && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Box sx={{ mb: 2 }}>
              {featureDialog.feature.icon}
            </Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              {featureDialog.feature.title}
            </Typography>
            <Chip 
              label="Premium Feature" 
              color="warning" 
              size="small" 
              icon={<StarIcon />}
              sx={{ mt: 1 }}
            />
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body1" paragraph sx={{ textAlign: 'center', color: 'text.secondary' }}>
              {featureDialog.feature.description}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                What you'll get with a full account:
              </Typography>
              <Grid container spacing={2}>
                {featureDialog.feature.benefits.map((benefit, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StarIcon sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
                      <Typography variant="body2">{benefit}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Card sx={{ mt: 3, bgcolor: theme.palette.primary.light + '20', border: `2px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  🎉 Special Offer for Guest Users
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Sign up now and get 30 days of unlimited access to all premium features!
                </Typography>
              </CardContent>
            </Card>
          </DialogContent>
          
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setFeatureDialog({ open: false, feature: null })}
            >
              Maybe Later
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/register')}
              startIcon={<StarIcon />}
              sx={{ ml: 2 }}
            >
              Sign Up Now
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
    </>
  );
};

export default GuestChatHeader;