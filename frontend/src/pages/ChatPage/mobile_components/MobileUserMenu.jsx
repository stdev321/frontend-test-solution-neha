import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
  ListSubheader
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import NoteIcon from '@mui/icons-material/Note';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ScienceIcon from '@mui/icons-material/Science';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import AddCommentIcon from '@mui/icons-material/AddComment';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function MobileUserMenu({
  currentUser,
  userProfile,
  onLogout,
  mode,
  toggleColorMode,
  conversationId,
  onExitChat,
  onNavigateToDashboard,
  onNavigateToHome,
  onNavigateToChat,
  onNavigateToTeam,
  onNavigateToHealthAdvisory,
  onNavigateToEncyclopedia,
  onNavigateToHistory,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToAITeamBuilder,
  currentView // Pass current view to highlight active screen
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['common', 'header', 'chat']);
  
  // Determine current screen based on path or currentView prop
  const getCurrentScreen = () => {
    const path = location.pathname;
    if (currentView) return currentView; // Use prop if provided
    
    // Check path to determine current screen
    if (path === '/') return 'home';
    if (path === '/chat' && !conversationId) return 'dashboard';
    if (path.startsWith('/chat') && conversationId) return 'chat';
    if (path === '/health-advisory') return 'advisory';
    if (path.includes('encyclopedia')) return 'encyclopedia';
    if (path.includes('team-builder')) return 'teamBuilder';
    if (path.includes('team')) return 'team';
    if (path.includes('history') || path.includes('consultation')) return 'history';
    if (path.includes('profile')) return 'profile';
    if (path === '/about-us') return 'about';
    if (path === '/founders-note') return 'founders';
    if (path === '/faq') return 'faq';
    if (path === '/legal') return 'legal';
    if (path === '/data-privacy') return 'privacy';
    if (path === '/contact') return 'contact';
    if (path.includes('accuracy')) return 'accuracy';
    if (path.includes('empower')) return 'empower';
    if (path.includes('research')) return 'research';
    return null;
  };
  
  const currentScreen = getCurrentScreen();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    console.log('MobileUserMenu: handleMenuItemClick called with action:', action);
    handleClose();
    if (action) {
      console.log('MobileUserMenu: Executing action...');
      action();
    } else {
      console.log('MobileUserMenu: No action provided');
    }
  };

  // Get user initials or use avatar
  const getUserDisplay = () => {
    if (userProfile?.profile_picture) {
      return (
        <Avatar 
          src={userProfile.profile_picture.startsWith('data:image') 
            ? userProfile.profile_picture 
            : `data:image/jpeg;base64,${userProfile.profile_picture}`}
          alt={userProfile?.full_name || userProfile?.display_name || currentUser?.displayName || t('common:user.defaultAltText')}
          sx={{ width: 32, height: 32 }}
        />
      );
    }
    
    const initials = userProfile?.full_name?.[0]?.toUpperCase() || 
                    userProfile?.display_name?.[0]?.toUpperCase() || 
                    currentUser?.displayName?.[0]?.toUpperCase() || 
                    currentUser?.email?.[0]?.toUpperCase() || 'U';
    return (
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
        {initials}
      </Avatar>
    );
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {getUserDisplay()}
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        key={location.pathname}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 260,
            mt: 1.5,
            maxHeight: '80vh',
            overflowY: 'auto',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1
            },
            '& .MuiListSubheader-root': {
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              backgroundColor: 'background.paper',
              lineHeight: '32px',
              px: 2
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User info header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.primary" fontWeight="bold">
            {currentUser?.displayName || currentUser?.email}
          </Typography>
          {currentUser?.email && (
            <Typography variant="caption" color="text.secondary">
              {currentUser.email}
            </Typography>
          )}
        </Box>

        {/* Priority item - Advisory */}
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToHealthAdvisory || (() => navigate('/health-advisory')))}
          selected={currentScreen === 'advisory'}
          sx={{
            backgroundColor: currentScreen === 'advisory' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <MedicalServicesIcon fontSize="small" color={currentScreen === 'advisory' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('footer.advisory')} />
        </MenuItem>

        <Divider />

        {/* Primary Navigation */}
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToDashboard || (() => navigate('/chat')))}
          selected={currentScreen === 'dashboard'}
          sx={{
            backgroundColor: currentScreen === 'dashboard' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" color={currentScreen === 'dashboard' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('header:dashboard', 'Dashboard')} />
        </MenuItem>
        
        {/* Chat Actions - conditional based on conversation state */}
        {(window.location.pathname.split('/').length > 2 && window.location.pathname.startsWith('/chat/')) ? (
          <>
            <MenuItem 
              onClick={() => handleMenuItemClick(onNavigateToChat)}
              selected={currentScreen === 'chat'}
              sx={{
                backgroundColor: currentScreen === 'chat' ? 'action.selected' : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }
              }}
            >
              <ListItemIcon>
                <ChatIcon fontSize="small" color={currentScreen === 'chat' ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary={t('header:returnToConsult', 'Return to Consult')} />
            </MenuItem>
            
            <MenuItem onClick={() => handleMenuItemClick(onExitChat)}>
              <ListItemIcon>
                <CloseIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primary={t('header:endConsult', 'End Consult')} />
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => handleMenuItemClick(onNavigateToChat || (() => navigate('/chat')))}>
            <ListItemIcon>
              <AddCommentIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('chat:startConsultation', 'Start Consultation')} />
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToHome || (() => navigate('/')))}
          selected={currentScreen === 'home'}
          sx={{
            backgroundColor: currentScreen === 'home' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <HomeIcon fontSize="small" color={currentScreen === 'home' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.home')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* FUNCTIONALITY SECTION */}
        <ListSubheader>{t('common:navigation.sections.functionality')}</ListSubheader>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToHistory || (() => navigate('/chat')))}
          selected={currentScreen === 'history'}
          sx={{
            backgroundColor: currentScreen === 'history' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" color={currentScreen === 'history' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.priorChats')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToProfile || (() => navigate('/profile')))}
          selected={currentScreen === 'profile'}
          sx={{
            backgroundColor: currentScreen === 'profile' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <PersonIcon fontSize="small" color={currentScreen === 'profile' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.myProfile')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToTeam || (() => navigate('/chat')))}
          selected={currentScreen === 'team'}
          sx={{
            backgroundColor: currentScreen === 'team' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <GroupIcon fontSize="small" color={currentScreen === 'team' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.myTeam')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToAITeamBuilder || (() => navigate('/chat')))}
          selected={currentScreen === 'teamBuilder'}
          sx={{
            backgroundColor: currentScreen === 'teamBuilder' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <AutoAwesomeIcon fontSize="small" color={currentScreen === 'teamBuilder' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('chat:sidebar.teamBuilder')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(onNavigateToEncyclopedia || (() => navigate('/about-VirtualMD-health-encyclopedia')))}
          selected={currentScreen === 'encyclopedia'}
          sx={{
            backgroundColor: currentScreen === 'encyclopedia' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <MenuBookIcon fontSize="small" color={currentScreen === 'encyclopedia' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.healthEncyclopedia')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* REQUIRED DOCUMENTS SECTION */}
        <ListSubheader>{t('common:navigation.sections.requiredDocuments')}</ListSubheader>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/legal'))}
          selected={currentScreen === 'legal'}
          sx={{
            backgroundColor: currentScreen === 'legal' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <GavelIcon fontSize="small" color={currentScreen === 'legal' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('footer.legal')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/data-privacy-whitepaper'))}
          selected={currentScreen === 'privacy'}
          sx={{
            backgroundColor: currentScreen === 'privacy' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <SecurityIcon fontSize="small" color={currentScreen === 'privacy' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.dataPrivacy')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* ABOUT US DOCUMENTS SECTION */}
        <ListSubheader>{t('common:navigation.sections.aboutUs')}</ListSubheader>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/about-us'))}
          selected={currentScreen === 'about'}
          sx={{
            backgroundColor: currentScreen === 'about' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <InfoIcon fontSize="small" color={currentScreen === 'about' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.aboutUs')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/founders-note'))}
          selected={currentScreen === 'founders'}
          sx={{
            backgroundColor: currentScreen === 'founders' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <NoteIcon fontSize="small" color={currentScreen === 'founders' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.noteFromFounders')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/faq'))}
          selected={currentScreen === 'faq'}
          sx={{
            backgroundColor: currentScreen === 'faq' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <QuestionAnswerIcon fontSize="small" color={currentScreen === 'faq' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.faq')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/contact'))}
          selected={currentScreen === 'contact'}
          sx={{
            backgroundColor: currentScreen === 'contact' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <ContactMailIcon fontSize="small" color={currentScreen === 'contact' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.contactUs')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* RESEARCH DOCUMENTS SECTION */}
        <ListSubheader>{t('common:navigation.sections.research')}</ListSubheader>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/research/ai-accuracy'))}
          selected={currentScreen === 'accuracy'}
          sx={{
            backgroundColor: currentScreen === 'accuracy' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <AssessmentIcon fontSize="small" color={currentScreen === 'accuracy' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.aiAccuracyStudies')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/your-health-your-hands'))}
          selected={currentScreen === 'empower'}
          sx={{
            backgroundColor: currentScreen === 'empower' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <EmojiObjectsIcon fontSize="small" color={currentScreen === 'empower' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.empowerYourself')} />
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMenuItemClick(() => navigate('/research'))}
          selected={currentScreen === 'research'}
          sx={{
            backgroundColor: currentScreen === 'research' ? 'action.selected' : 'transparent',
            '&.Mui-selected': {
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }}
        >
          <ListItemIcon>
            <ScienceIcon fontSize="small" color={currentScreen === 'research' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary={t('common:navigation.deepResearch')} />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* Settings items */}
        <MenuItem onClick={() => handleMenuItemClick(toggleColorMode)}>
          <ListItemIcon>
            {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText primary={t(mode === 'dark' ? 'common:settings.lightMode' : 'common:settings.darkMode')} />
        </MenuItem>
        
        {onNavigateToSettings && (
          <MenuItem onClick={() => handleMenuItemClick(onNavigateToSettings)}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t('chat:actions.settings')} />
          </MenuItem>
        )}

        <Divider />

        {/* Logout */}
        <MenuItem onClick={() => {
          console.log('MobileUserMenu: Logout MenuItem clicked, onLogout prop:', onLogout);
          handleMenuItemClick(onLogout);
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary={t('common:auth.logout')} primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
    </>
  );
}