import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Button,
  Paper,
  Avatar,
  Link,
  Tooltip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

// Helper to construct image URL (can be imported from a shared util later if it isn't already)
const FRONTEND_BASE_URL = ''; // Empty string means relative to current origin (frontend)
const constructFullImageUrl = (imagePath) => {
  const isAileenCarolImage = typeof imagePath === 'string' && imagePath.includes('aileen-carol'); // Updated to match new naming
  if (isAileenCarolImage) {
    console.log(`[constructFullImageUrl] Input for AI Health Expert Carol image processing: "${imagePath}" (type: ${typeof imagePath})`);
  }

  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    if (isAileenCarolImage) console.log('[constructFullImageUrl] For AI Health Expert Carol, returning null due to: !imagePath || not string || empty trim');
    return null;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    if (isAileenCarolImage) console.log(`[constructFullImageUrl] For AI Health Expert Carol, returning as-is (already full URL): "${imagePath}"`);
    return imagePath;
  }
  let filename = imagePath.trim().replace(/^\/?persona_images\/?/, '');
  if (isAileenCarolImage) console.log(`[constructFullImageUrl] For AI Health Expert Carol, filename after regex strip: "${filename}"`);

  if (filename.trim() === '') {
    if (isAileenCarolImage) console.log('[constructFullImageUrl] For AI Health Expert Carol, returning null due to: filename empty after strip');
    return null;
  }
  const result = `/persona_images/${filename}`; // Serve from frontend public directory
  if (isAileenCarolImage) {
    console.log(`[constructFullImageUrl] For AI Health Expert Carol, final constructed URL: "${result}"`);
  }
  return result;
};

const AileenCarolInfoText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
}));

const ChatConfiguratorPanel = ({
  // allPersonas = [], // No longer receiving allPersonas directly for finding AI Health Expert Carol
  myAdvisers = [], 
  aileenCarolDetails, // New prop: AI Health Expert Carol's persona object (or null)
  onStartWithAileenCarolOnly,
  onStartWithSingleSpecialist,
  onStartWithSpecialistsAndAileenCarol,
  isCreatingConversation = false,
  // aileenCarolId = 'aileencarol', // No longer primary way to get her; details are passed directly
  onNavigateToManageTeam,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  console.log("[ChatConfiguratorPanel] theme.palette.primary.contrastText:", theme.palette.primary.contrastText);
  const [selectedOtherAdviserIds, setSelectedOtherAdviserIds] = useState({});
  const aileenCarolId = 'ai_persona_aileen_carol'; // Keep a local const for her canonical ID if needed for logic

  useEffect(() => {
    // console.log("[ChatConfiguratorPanel] Received myAdvisers (JSON):", JSON.stringify(myAdvisers, null, 2));
    console.log("[ChatConfiguratorPanel] Received aileenCarolDetails:", JSON.stringify(aileenCarolDetails, null, 2));
  }, [myAdvisers, aileenCarolDetails]);

  // aileenCarolPersonaFromAll is now directly from the prop
  const aileenCarolPersonaFromAll = aileenCarolDetails; 
  // console.log("[ChatConfiguratorPanel] Using aileenCarolDetails as aileenCarolPersonaFromAll:", JSON.stringify(aileenCarolPersonaFromAll, null, 2));

  let tempDisplayPersonas = [];
  const aileenCarolDisplayName = t('configurator.defaultPersona.name');
  const aileenCarolDisplaySpecialty = t('configurator.defaultPersona.role');

  const aileenCarolDisplayObject = {
    id: aileenCarolId, // Use the canonical ID for key and internal logic
    name: aileenCarolDisplayName, 
    specialty: aileenCarolDisplaySpecialty, 
    image: aileenCarolPersonaFromAll?.image || null, 
    isAileenCarolItem: true,
    isDataFound: !!aileenCarolPersonaFromAll // This now directly reflects if aileenCarolDetails was passed
  };
  if (aileenCarolPersonaFromAll && aileenCarolPersonaFromAll.name && aileenCarolPersonaFromAll.name !== "AI Health Expert Carol") {
    aileenCarolDisplayObject.name = aileenCarolPersonaFromAll.name;
  }
  // Only add AI Health Expert Carol to display if her details were actually found and passed
  if (aileenCarolPersonaFromAll) { 
    tempDisplayPersonas.push(aileenCarolDisplayObject);
  }

  const otherAdvisers = myAdvisers.filter(adv => adv.id?.toLowerCase() !== aileenCarolId.toLowerCase());
  tempDisplayPersonas = [...tempDisplayPersonas, ...otherAdvisers.map(adv => ({...adv, isAileenCarolItem: false, isDataFound: true}))];
  
  const displayPersonas = tempDisplayPersonas;
  // console.log("[ChatConfiguratorPanel] Constructed displayPersonas:", JSON.stringify(displayPersonas, null, 2));

  const handleToggleOtherAdviser = useCallback((personaId) => {
    setSelectedOtherAdviserIds(prev => ({
      ...prev,
      [personaId]: !prev[personaId]
    }));
  }, []);

  const getSelectedOtherAdviserIdsArray = useCallback(() => {
    return Object.keys(selectedOtherAdviserIds).filter(id => selectedOtherAdviserIds[id]);
  }, [selectedOtherAdviserIds]);

  const selectedOtherCount = getSelectedOtherAdviserIdsArray().length;
  const isAileenCarolProgrammaticallySelected = (selectedOtherCount === 0 || selectedOtherCount >= 2);

  const handleStartChat = () => {
    const finalSelectedOtherIds = getSelectedOtherAdviserIdsArray();
    const count = finalSelectedOtherIds.length;
    if (count === 0) { 
      onStartWithAileenCarolOnly();
    } else if (count === 1) { 
      onStartWithSingleSpecialist(finalSelectedOtherIds[0]);
    } else { 
      onStartWithSpecialistsAndAileenCarol(finalSelectedOtherIds); 
    }
  };
  
  const hasSelectableAdvisers = myAdvisers.filter(p => p.id?.toLowerCase() !== aileenCarolId?.toLowerCase()).length > 0;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        overflowY: 'auto'
      }}
    >
      <Typography variant="h6" gutterBottom>{t('configurator.title')}</Typography>
      
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
        <Typography variant="subtitle1" gutterBottom component="div">
          {t('configurator.subtitle')}
        </Typography>
        <Link 
          component="button" 
          variant="body2" 
          onClick={onNavigateToManageTeam}
          sx={{cursor: 'pointer'}}
        >
          {t('configurator.changeTeam')}
        </Link>
      </Box>

      <Box sx={{ overflowY: 'auto', mb: 2 }}>
        <List dense>
          {displayPersonas.map((persona) => {
            const isThisAileenCarol = persona.isAileenCarolItem;
            let isChecked, isDisabled, currentOpacity, avatarSrc;

            if (isThisAileenCarol) {
              isChecked = isAileenCarolProgrammaticallySelected;
              isDisabled = true; 
              currentOpacity = isAileenCarolProgrammaticallySelected ? 1 : 0.7;
              avatarSrc = constructFullImageUrl(persona.image);
              console.log(`[ChatConfiguratorPanel] AI Health Expert CAROL ITEM in map: persona.image = "${persona.image}", constructed avatarSrc = "${avatarSrc}"`);
            } else {
              isChecked = !!selectedOtherAdviserIds[persona.id];
              isDisabled = false; 
              currentOpacity = 1;
              avatarSrc = constructFullImageUrl(persona.image);
            }

            return (
              <ListItem 
                key={persona.id} 
                onClick={!isDisabled ? () => handleToggleOtherAdviser(persona.id) : undefined}
                button={!isDisabled}
                secondaryAction={
                  <Checkbox 
                    edge="end"
                    checked={isChecked} 
                    disabled={isDisabled} 
                    tabIndex={-1} 
                  />
                }
                sx={{
                  mb: 0.5, 
                  borderRadius: 1, 
                  '&:hover': !isDisabled ? { bgcolor: 'action.hover' } : {},
                  cursor: isDisabled ? 'default' : 'pointer',
                  opacity: currentOpacity,
                  backgroundColor: undefined, 
                  border: undefined, 
                }}
              >
                <ListItemIcon 
                  sx={{
                    minWidth: 40, 
                    mr: isThisAileenCarol ? 1.5 : 1,
                  }}
                >
                  <Avatar 
                    src={avatarSrc} 
                    alt={persona.name || 'Avatar'} 
                    sx={{
                      width: isThisAileenCarol ? 38 : 32, 
                      height: isThisAileenCarol ? 38 : 32,
                      bgcolor: isThisAileenCarol ? theme.palette.primary.light : undefined,
                      color: (isThisAileenCarol && !avatarSrc) ? theme.palette.primary.contrastText : undefined,
                    }}
                  >
                    {(isThisAileenCarol && !avatarSrc) ? 'C' : null}
                  </Avatar>
                </ListItemIcon>
                <ListItemText 
                    primaryTypographyProps={isThisAileenCarol ? { sx: { color: '#AD55DA', fontWeight: 'bold', fontSize: '1.05em' } } : {}}
                    secondaryTypographyProps={isThisAileenCarol ? { sx: { color: theme.palette.primary.main } } : {}}
                    primary={persona.name} 
                    secondary={persona.specialty}
                />
              </ListItem>
            );
          })}
          {!hasSelectableAdvisers && !aileenCarolPersonaFromAll && (
            <Typography sx={{textAlign: 'center', mt: 2, color: 'text.secondary'}}>
              {t('configurator.emptyTeam')}. <Link component="button" onClick={onNavigateToManageTeam} sx={{cursor: 'pointer'}}>{t('configurator.addSpecialists')}</Link>.
            </Typography>
          )}
           {!hasSelectableAdvisers && aileenCarolPersonaFromAll && (
            <Typography sx={{textAlign: 'center', mt: 2, color: 'text.secondary'}}>
              {t('configurator.noOtherSpecialists')} <Link component="button" onClick={onNavigateToManageTeam} sx={{cursor: 'pointer'}}>{t('configurator.addSpecialistsLink')}</Link>.
            </Typography>
          )}
        </List>
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <AileenCarolInfoText>
          <b>{t('configurator.carolNote.title')}</b><br />
          {t('configurator.carolNote.ruleA')}<br />
          {t('configurator.carolNote.ruleB')}
        </AileenCarolInfoText>

        <Button 
          variant="contained" 
          color="primary"
          onClick={handleStartChat} 
          disabled={isCreatingConversation}
          fullWidth
          sx={{ 
            mt: 1, 
            color: '#FFFFFF !important'
          }}
        >
          {isCreatingConversation ? t('configurator.starting') : t('configurator.startConsult')}
        </Button>
      </Box>
    </Paper>
  );
};

ChatConfiguratorPanel.propTypes = {
  // allPersonas: PropTypes.array, // Removed for now
  myAdvisers: PropTypes.array.isRequired,
  aileenCarolDetails: PropTypes.object, // New prop for AI Health Expert Carol's object
  onStartWithAileenCarolOnly: PropTypes.func.isRequired,
  onStartWithSingleSpecialist: PropTypes.func.isRequired,
  onStartWithSpecialistsAndAileenCarol: PropTypes.func.isRequired,
  isCreatingConversation: PropTypes.bool,
  // aileenCarolId: PropTypes.string, // Removed as direct prop for finding her
  onNavigateToManageTeam: PropTypes.func.isRequired,
};

export default ChatConfiguratorPanel; 