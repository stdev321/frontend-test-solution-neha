import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Paper,
  Avatar,
  Divider,
  Alert,
  Tooltip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { styled } from '@mui/material/styles';

// Assuming constructFullImageUrl is available or will be passed/imported
// For now, defining a local version for standalone development.
const FRONTEND_BASE_URL = ''; // Empty string means relative to current origin (frontend)
const constructFullImageUrl = (imagePath, size = 'medium') => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  let filename = imagePath.trim().replace(/^\/?persona_images\/?/, '');
  if (filename.trim() === '') return null;
  
  // Remove any existing extension to add tier suffix
  const baseName = filename.replace(/\.png$/, '');
  // Add the tier suffix for medium quality (256x256 for cards)
  return `/persona_images/${baseName}_${size}.png`; // Serve from frontend public directory
};

const MAX_TEAM_MEMBERS = 5;

const PanelSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const ManageTeamPanel = ({
  myAdvisers = [], // From useMyAdvisers context
  allSystemPersonas = [], // All available personas from the system
  onAddAdviser, // func (personaId) => Promise (to add to user's team)
  onRemoveAdviser, // func (personaId) => Promise (to remove from user's team)
  isLoading, // General loading state for async operations
  error, // Error message for display
  aileenCarolId = 'ai_persona_aileen_carol' // AI Health Expert Carol's ID to exclude her from management
}) => {
  const { t } = useTranslation('chat');

  // Log the incoming persona lists to inspect image paths
  useEffect(() => {
    console.log("ManageTeamPanel: myAdvisers data:", JSON.stringify(myAdvisers, null, 2));
    console.log("ManageTeamPanel: allSystemPersonas data:", JSON.stringify(allSystemPersonas, null, 2));
  }, [myAdvisers, allSystemPersonas]);

  const aileenCarolPersona = allSystemPersonas.find(p => p.id === aileenCarolId);
  console.log("ManageTeamPanel: Found aileenCarolPersona:", aileenCarolPersona); // Log AI Health Expert Carol
  console.log("ManageTeamPanel: aileenCarolId used for find:", aileenCarolId);
  // console.log("ManageTeamPanel: allSystemPersonas for finding Carol:", JSON.stringify(allSystemPersonas, null, 2));

  const currentTeamIds = myAdvisers.map(p => p.id);
  
  // Ensure AI Health Expert Carol is not in the manageable list if she happens to be passed in myAdvisers by mistake
  const manageableMyAdvisers = myAdvisers.filter(p => p.id !== aileenCarolId);
  const manageableCurrentTeamIds = manageableMyAdvisers.map(p => p.id);

  const availableToAdd = allSystemPersonas.filter(
    p => p.id !== aileenCarolId && !manageableCurrentTeamIds.includes(p.id)
  );

  const canAddMore = manageableCurrentTeamIds.length < MAX_TEAM_MEMBERS;

  return (
    <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{px:2, pt:2}}>
        {t('common:manageTeam.title', { maxTeamMembers: MAX_TEAM_MEMBERS })}
      </Typography>

      {error && <Alert severity="error" sx={{mb: 2, mx:2}}>{typeof error === 'string' ? error : error.message}</Alert>}

      {/* Current Team Members Section */}
      <PanelSection elevation={1}>
        <Typography variant="subtitle1" gutterBottom>{t('common:manageTeam.currentTeamCount', { current: manageableMyAdvisers.length, max: MAX_TEAM_MEMBERS })}</Typography>
        {isLoading && <Typography sx={{my:1}}>{t('common:manageTeam.updatingTeam')}</Typography>}
        <List dense sx={{maxHeight: '200px', overflowY: 'auto'}}>
          {/* Display AI Health Expert Carol at the top if found, non-removable */}
          {aileenCarolPersona && (
            <ListItem key={aileenCarolPersona.id} sx={{opacity: 0.7}}>
              <ListItemIcon sx={{minWidth: 40}}><Avatar src={constructFullImageUrl(aileenCarolPersona.image, 'medium')} sx={{width: 32, height: 32, backgroundColor: 'transparent'}}/></ListItemIcon>
              <ListItemText primary={`${aileenCarolPersona.name}${t('common:manageTeam.coordinatorLabel')}`} secondary={aileenCarolPersona.specialty || t('common:manageTeam.alwaysIncluded')} />
              {/* No remove button for AI Health Expert Carol */}
            </ListItem>
          )}
          {manageableMyAdvisers.map(persona => (
            <ListItem
              key={persona.id}
              secondaryAction={
                <Tooltip title={t('team.removeFromTeam')}>
                  <span> 
                    <IconButton edge="end" onClick={() => onRemoveAdviser(persona.id)} disabled={isLoading}>
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              }
            >
              <ListItemIcon sx={{minWidth: 40}}><Avatar src={constructFullImageUrl(persona.image, 'medium')} sx={{width: 32, height: 32, backgroundColor: 'transparent'}}/></ListItemIcon>
              <ListItemText primary={persona.name} secondary={persona.specialty || t('common:manageTeam.specialistFallback')} />
            </ListItem>
          ))}
          {manageableMyAdvisers.length === 0 && !isLoading && (
            <Typography sx={{textAlign: 'center', my: 1, color: 'text.secondary'}}>{t('common:manageTeam.emptyTeamMessage')}</Typography>
          )}
        </List>
        {/* Moved and refined max specialists notification here */}
        {!canAddMore && (
          <Alert severity="info" sx={{mt:1, fontSize: '0.9rem'}}>
            {t('common:manageTeam.teamFullMessage', { maxTeamMembers: MAX_TEAM_MEMBERS })}
          </Alert>
        )}
      </PanelSection>

      <Divider sx={{my:1}} />

      {/* Available Specialists to Add Section - Renamed */}
      <PanelSection elevation={1} sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
        <Typography variant="subtitle1" gutterBottom>{t('common:manageTeam.otherSpecialistsTitle')}</Typography> 
        <Box sx={{flexGrow: 1, overflowY: 'auto'}}>
          <List dense>
            {availableToAdd.map(persona => (
              <ListItem
                key={persona.id}
                secondaryAction={
                  <Tooltip title={canAddMore ? t('common:manageTeam.addToTeamTooltip') : t('common:manageTeam.teamFullTooltip')}>
                    <span>
                      <IconButton 
                        edge="end" 
                        onClick={() => onAddAdviser(persona.id)} 
                        disabled={!canAddMore || isLoading}
                      >
                        <AddCircleOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                }
              >
                <ListItemIcon sx={{minWidth: 40}}><Avatar src={constructFullImageUrl(persona.image, 'medium')} sx={{width: 32, height: 32, backgroundColor: 'transparent'}}/></ListItemIcon>
                <ListItemText primary={persona.name} secondary={persona.specialty || t('common:manageTeam.systemSpecialistFallback')} />
              </ListItem>
            ))}
            {availableToAdd.length === 0 && (
              <Typography sx={{textAlign: 'center', my: 2, color: 'text.secondary'}}>{t('common:manageTeam.noSpecialistsAvailable')}</Typography>
            )}
          </List>
        </Box>
      </PanelSection>
    </Box>
  );
};

ManageTeamPanel.propTypes = {
  myAdvisers: PropTypes.array.isRequired,
  allSystemPersonas: PropTypes.array.isRequired,
  onAddAdviser: PropTypes.func.isRequired,
  onRemoveAdviser: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  aileenCarolId: PropTypes.string,
};

export default ManageTeamPanel; 