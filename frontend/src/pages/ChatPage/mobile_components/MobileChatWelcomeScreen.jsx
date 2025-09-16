import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddCommentIcon from '@mui/icons-material/AddComment';
import GroupIcon from '@mui/icons-material/Group';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function MobileChatWelcomeScreen({
  currentUser,
  userProfile,
  onChatAreaStartTeamChat,
  onNavigateToTeam,
  onNavigateToHealthAdvisory,
  onNavigateToConsultations,
  onNavigateToEncyclopedia,
  onNavigateToProfile,
  onLogout
}) {
  const { t } = useTranslation(['chat', 'common']);
  const [touchedButton, setTouchedButton] = useState(null);

  const getUserFirstName = () => {
    return currentUser?.full_name || currentUser?.display_name || t('common:user.defaultName');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.default',
      position: 'relative',
      pt: 8 // Add padding to push content below header
    }}>
      {/* AI Health Expert Carol Header */}
      <Box sx={{ 
        p: 2,
        mx: 2, // Add horizontal margin
        textAlign: 'left',
        bgcolor: 'grey.600',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: '12px'
      }}>
        <Box sx={{ 
          width: 70,
          height: 85,
          flexShrink: 0,
          overflow: 'hidden',
          borderRadius: '6px'
        }}>
          <img 
            src="/persona_images/aileen-carol_medium.png"
                            alt={t('common:alt.aiDoctor')}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top'
            }}
          />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ 
            fontWeight: 'bold', 
            mb: 0.5, 
            color: 'white', 
            fontSize: '1rem' 
          }}>
            {t('mobileWelcome.greeting', { name: getUserFirstName() })}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'white', 
            opacity: 0.95, 
            fontSize: '0.85rem', 
            lineHeight: 1.3 
          }}>
            {t('mobileWelcome.aileenCarolIntro')}
          </Typography>
        </Box>
      </Box>

      {/* Six App Buttons Grid */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        mt: -2
      }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 3, // Increased spacing between squares
          maxWidth: '380px', // Slightly wider container
          mx: 'auto',
          mb: 2,
          px: 2 // Add horizontal padding
        }}>
          {/* Start Health Consultation */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onChatAreaStartTeamChat}
              onTouchStart={() => setTouchedButton('consultation')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'consultation' ? '#9c27b0' : '#1976d2',
                backgroundColor: touchedButton === 'consultation' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'consultation' ? '#9c27b0' : '#1976d2',
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              <AddCommentIcon sx={{ fontSize: '1.9rem' }} />
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.chat')}
            </Typography>
          </Box>

          {/* Health Advisory */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onNavigateToHealthAdvisory}
              onTouchStart={() => setTouchedButton('healthAdvisory')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'healthAdvisory' ? '#9c27b0' : '#AD55DA',
                backgroundColor: touchedButton === 'healthAdvisory' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(173, 85, 218, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'healthAdvisory' ? '#9c27b0' : '#AD55DA',
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              <MedicalServicesIcon sx={{ fontSize: '1.9rem' }} />
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.advisory')}
            </Typography>
          </Box>

          {/* My Team */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onNavigateToTeam}
              onTouchStart={() => setTouchedButton('team')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'team' ? '#9c27b0' : '#1976d2',
                backgroundColor: touchedButton === 'team' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'team' ? '#9c27b0' : '#1976d2',
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              <GroupIcon sx={{ fontSize: '1.9rem' }} />
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.myTeam')}
            </Typography>
          </Box>

          {/* Prior Consultations / History */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onNavigateToConsultations}
              onTouchStart={() => setTouchedButton('prior')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'prior' ? '#9c27b0' : '#1976d2',
                backgroundColor: touchedButton === 'prior' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'prior' ? '#9c27b0' : '#1976d2',
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              <ScheduleIcon sx={{ fontSize: '1.9rem' }} />
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.history')}
            </Typography>
          </Box>

          {/* Encyclopedia */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onNavigateToEncyclopedia}
              onTouchStart={() => setTouchedButton('encyclopedia')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'encyclopedia' ? '#9c27b0' : '#1976d2',
                backgroundColor: touchedButton === 'encyclopedia' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'encyclopedia' ? '#9c27b0' : '#1976d2',
                transition: 'all 0.2s ease-in-out',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              <MenuBookIcon sx={{ fontSize: '1.9rem' }} />
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.encyclopedia')}
            </Typography>
          </Box>

          {/* My Profile */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <IconButton
              onClick={onNavigateToProfile}
              onTouchStart={() => setTouchedButton('profile')}
              onTouchEnd={() => setTimeout(() => setTouchedButton(null), 1000)}
              onMouseLeave={() => setTouchedButton(null)}
              sx={{
                width: 72,
                height: 72,
                border: '2px solid',
                borderColor: touchedButton === 'profile' ? '#9c27b0' : '#1976d2',
                backgroundColor: touchedButton === 'profile' ? 'rgba(156, 39, 176, 0.1)' : 'rgba(25, 118, 210, 0.1)',
                borderRadius: '16px',
                color: touchedButton === 'profile' ? '#9c27b0' : '#1976d2',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                overflow: 'hidden',
                '&:active': {
                  transform: 'scale(0.9)'
                }
              }}
            >
              {/* Profile image or initials filling the entire square */}
              {userProfile?.profile_picture ? (
                <Box
                  component="img"
                  src={userProfile.profile_picture.startsWith('data:image') 
                    ? userProfile.profile_picture 
                    : `data:image/jpeg;base64,${userProfile.profile_picture}`}
                  alt={userProfile?.full_name || userProfile?.display_name || currentUser?.display_name || t('common:user.defaultAltText')}
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '16px'
                  }}
                />
              ) : (
                <Box
                  sx={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: touchedButton === 'profile' ? '#9c27b0' : '#1976d2',
                    color: 'white',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    borderRadius: '16px'
                  }}
                >
                  {userProfile?.full_name?.[0]?.toUpperCase() || 
                   userProfile?.display_name?.[0]?.toUpperCase() || 
                   currentUser?.display_name?.[0]?.toUpperCase() || 
                   currentUser?.email?.[0]?.toUpperCase() || 
                   t('common:user.defaultInitial')}
                </Box>
              )}
            </IconButton>
            <Typography variant="caption" sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'text.secondary'
            }}>
              {t('mobileWelcome.labels.myProfile')}
            </Typography>
          </Box>
        </Box>

      </Box>
      
      {/* Logout Button - positioned at bottom */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center'
      }}>
        <Typography 
          variant="body2" 
          onClick={onLogout}
          sx={{ 
            py: 0.8,
            px: 3,
            fontSize: '0.95rem',
            borderRadius: '20px',
            color: '#1976d2',
            cursor: 'pointer',
            display: 'inline-block',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.08)',
              textDecoration: 'underline'
            }
          }}
        >
          {t('mobileWelcome.logout')}
        </Typography>
      </Box>
    </Box>
  );
} 