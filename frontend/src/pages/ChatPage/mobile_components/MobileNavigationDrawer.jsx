import React, { useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  ListSubheader,
  Divider
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserDisplayName } from '../../../utils/nameTransliteration';
// Icons for navigation
import CloseIcon from '@mui/icons-material/Close';
import GridViewIcon from '@mui/icons-material/GridView';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoIcon from '@mui/icons-material/Info';
import NoteIcon from '@mui/icons-material/Note';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import ScienceIcon from '@mui/icons-material/Science';
import AddCommentIcon from '@mui/icons-material/AddComment';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatSidebar from '../../../components/features/chat/sidebar';
import { ConversationPersistence } from '../../../hooks/useConversationPersistence';

export default function MobileNavigationDrawer({
  open,
  onClose,
  onOpen,
  conversationId,
  onExitChat,
  onNavigateToView,
  isSpeakerEnabled,
  onSpeakerToggle,
  onCameraClick,
  sidebarProps = {},
  isAuthenticated = false,
  currentUser = null,
  userProfile = null,
  onLogout,
  mode = 'light',
  toggleColorMode,
  currentMobileView = 'chat'
}) {
  const { t, i18n } = useTranslation(['chat', 'common', 'header']);
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  // Log the navigation handler we received
  useEffect(() => {
    console.log('📋 [DRAWER] MobileNavigationDrawer mounted');
    console.log('📋 [DRAWER] onNavigateToView type:', typeof onNavigateToView);
    console.log('📋 [DRAWER] onNavigateToView is defined:', onNavigateToView !== undefined);
    console.log('📋 [DRAWER] Current location:', location.pathname);
  }, [onNavigateToView]);
  
  // Always check for saved conversation to maintain context
  const savedConversationId = ConversationPersistence.get();
  const currentConversationId = conversationId || savedConversationId;

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && sidebarProps.onFilesSelectedForContext) {
      sidebarProps.onFilesSelectedForContext(files);
    }
    onClose();
  };
  
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
        capture="environment"
      />
      <SwipeableDrawer
        anchor="left"
        open={open}
        onClose={onClose}
        onOpen={onOpen}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: '85vw', 
            maxWidth: 400,
            // Position drawer below the fixed header on mobile
            top: { xs: '60px', sm: '60px', md: '64px' },
            height: { xs: 'calc(100% - 60px)', sm: 'calc(100% - 60px)', md: 'calc(100% - 64px)' }
          } 
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Header with user info if authenticated */}
          {isAuthenticated && currentUser && (
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {getUserDisplayName(currentUser, userProfile, i18n.language)}
              </Typography>
              {currentUser?.email && (
                <Typography variant="caption" color="text.secondary">
                  {currentUser.email}
                </Typography>
              )}
            </Box>
          )}


          {/* Main navigation list */}
          <List sx={{ flexGrow: 1, pt: 1 }}>
            {/* Priority Section - Advisory */}
            <ListItemButton 
              onClick={() => {
                console.log('🔴 [ADVISORY CLICK] Advisory button clicked!');
                console.log('🔴 [ADVISORY CLICK] onNavigateToView exists?', !!onNavigateToView);
                if (onNavigateToView) {
                  console.log('🔴 [ADVISORY CLICK] Calling onNavigateToView with health-advisory');
                  onNavigateToView('health-advisory');
                } else {
                  console.log('🔴 [ADVISORY CLICK] No onNavigateToView, using direct navigation');
                  onClose();
                  navigate('/health-advisory');
                }
              }}
            >
              <ListItemIcon>
                <MedicalServicesIcon />
              </ListItemIcon>
              <ListItemText primary={t('header:advisory', 'Health Advisory')} />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            {/* Primary Navigation */}
            {isAuthenticated && (
              <>
                <ListItemButton 
                  onClick={() => {
                    console.log('🍔 [HAMBURGER] User clicked on Dashboard');
                    console.log('🍔 [HAMBURGER] Current URL before navigation:', window.location.pathname);
                    onClose();
                    console.log('🍔 [HAMBURGER] Calling onNavigateToView with "dashboard"');
                    onNavigateToView('dashboard');
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('common:navigation.dashboard')} />
                </ListItemButton>

                {/* Always show current chat if there's any conversation context */}
                {currentConversationId ? (
                  <>
                    <ListItemButton 
                      onClick={() => {
                        onClose();
                        // Navigate directly to conversation with new route
                        navigate(`/conversation/${currentConversationId}`);
                      }}
                      sx={{ 
                        bgcolor: 'action.selected',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemIcon>
                        <ChatIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={t('common:navigation.returnToChat')} 
                        secondary={t('common:navigation.continueConsultation')}
                      />
                    </ListItemButton>

                    <ListItemButton 
                      onClick={() => {
                        onClose();
                        onExitChat();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <ListItemIcon>
                        <CloseIcon sx={{ color: 'error.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={t('common:navigation.exitConsultation')} />
                    </ListItemButton>
                  </>
                ) : (
                  <ListItemButton 
                    onClick={() => {
                      onClose();
                      navigate('/dashboard');
                    }}
                  >
                    <ListItemIcon>
                      <AddCommentIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('common:navigation.startNewConsultation')} />
                  </ListItemButton>
                )}
              </>
            )}

            {/* Chat Tools (always show when there's conversation context) */}
            {currentConversationId && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.chatTools')}</ListSubheader>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('team'); }}>
                  <ListItemIcon><GridViewIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.myTeam')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('summary'); }}>
                  <ListItemIcon><SummarizeIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.summary')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('differentialOpinion'); }}>
                  <ListItemIcon><PsychologyIcon /></ListItemIcon>
                  <ListItemText primary={t('common:sidebar.differentialOpinion')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('transcript'); }}>
                  <ListItemIcon><DescriptionIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.transcript')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('encyclopedia'); }}>
                  <ListItemIcon><SearchIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.encyclopedia')} />
                </ListItemButton>
              </>
            )}

            {/* Functionality Section */}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.functionality')}</ListSubheader>
                
                <ListItemButton onClick={() => { 
                  onClose(); 
                  onNavigateToView('consultations');
                }}>
                  <ListItemIcon><HistoryIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.priorChats')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { onClose(); onNavigateToView('profile'); }}>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.myProfile')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { 
                  onClose(); 
                  onNavigateToView('team');
                }}>
                  <ListItemIcon><GroupIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.myTeam')} />
                </ListItemButton>
                
                <ListItemButton onClick={() => { 
                  onClose(); 
                  onNavigateToView('encyclopedia');
                }}>
                  <ListItemIcon><MenuBookIcon /></ListItemIcon>
                  <ListItemText primary={t('common:navigation.healthEncyclopedia')} />
                </ListItemButton>
              </>
            )}

            {/* About Us Section */}
            <Divider sx={{ my: 1 }} />
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.aboutUs')}</ListSubheader>
            
            <ListItemButton 
              onClick={() => {
                onClose();
                navigate('/');
              }}
            >
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={t('common:navigation.home')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/why-virtualmd'); }}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.aboutUs')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/note-from-founders'); }}>
              <ListItemIcon><NoteIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.noteFromFounders')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/faq'); }}>
              <ListItemIcon><QuestionAnswerIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.faq')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/how-to'); }}>
              <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
              <ListItemText primary={t('common:howToUse')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/contact'); }}>
              <ListItemIcon><ContactMailIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.contactUs')} />
            </ListItemButton>

            {/* Legal Section */}
            <Divider sx={{ my: 1 }} />
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.requiredDocuments')}</ListSubheader>
            
            <ListItemButton onClick={() => { onClose(); navigate('/legal'); }}>
              <ListItemIcon><GavelIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.legal')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/data-privacy-whitepaper'); }}>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.dataPrivacy')} />
            </ListItemButton>

            {/* Research Section */}
            <Divider sx={{ my: 1 }} />
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.research')}</ListSubheader>
            
            <ListItemButton onClick={() => { onClose(); navigate('/research/ai-accuracy'); }}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.aiAccuracyStudies')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/your-health-your-hands'); }}>
              <ListItemIcon><EmojiObjectsIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.empowerYourself')} />
            </ListItemButton>
            
            <ListItemButton onClick={() => { onClose(); navigate('/about-VirtualMD-health-encyclopedia'); }}>
              <ListItemIcon><ScienceIcon /></ListItemIcon>
              <ListItemText primary={t('common:navigation.deepResearch')} />
            </ListItemButton>

            {/* Controls Section (when in conversation context) */}
            {currentConversationId && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.controls')}</ListSubheader>
                
                <ListItemButton onClick={onSpeakerToggle}>
                  <ListItemIcon>
                    {isSpeakerEnabled ? (
                      <VolumeUpIcon sx={{ color: 'primary.main' }} />
                    ) : (
                      <VolumeOffIcon sx={{ color: 'grey.500' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('common:controls.aiSpeaker')} 
                    secondary={isSpeakerEnabled ? t('common:controls.status.enabled') : t('common:controls.status.disabled')}
                  />
                </ListItemButton>

                <ListItemButton onClick={handleCameraClick}>
                  <ListItemIcon>
                    <PhotoCameraIcon sx={{ color: 'primary.main' }} />
                  </ListItemIcon>
                  <ListItemText primary={t('common:controls.cameraUpload')} />
                </ListItemButton>
              </>
            )}

            {/* Settings */}
            <Divider sx={{ my: 1 }} />
            <ListSubheader disableSticky sx={{ bgcolor: 'transparent' }}>{t('common:navigation.sections.settings')}</ListSubheader>
            
            <ListItemButton onClick={() => { 
              console.log('Dark mode toggle clicked. Mode:', mode, 'toggleColorMode:', typeof toggleColorMode);
              if (toggleColorMode) {
                toggleColorMode();
              } else {
                console.error('toggleColorMode is not defined!');
              }
              onClose(); 
            }}>
              <ListItemIcon>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </ListItemIcon>
              <ListItemText primary={mode === 'dark' ? t('common:settings.lightMode') : t('common:settings.darkMode')} />
            </ListItemButton>

            {/* Logout */}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItemButton onClick={() => { onLogout && onLogout(); onClose(); }}>
                  <ListItemIcon>
                    <LogoutIcon sx={{ color: 'error.main' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={t('common:auth.logout')} 
                    primaryTypographyProps={{ color: 'error.main' }}
                  />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
} 