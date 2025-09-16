import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Avatar, Paper, List, ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import translationService from '../../../../services/translationService';

// Image URL normalizer for sidebar tiles
// Always serve from frontend public folder and default to medium tier
const constructFullImageUrl = (imagePath) => {
  // Explicitly treat string values as empty
  if (imagePath === 'undefined' || imagePath === 'null') return null;
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null;

  // Pass-through absolute and data URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;

  // Normalize to filename only
  let filename = imagePath.trim().replace(/^\/?persona_images\/?/, '');
  if (filename.trim() === '') return null;

  // If already a sized variant, keep as-is; otherwise append _medium
  const hasSizeSuffix = /_(tiny|medium|high)\.png$/i.test(filename);
  const normalized = hasSizeSuffix
    ? filename.replace(/^[\/]+/, '')
    : filename.replace(/\.png$/i, '') + '_medium.png';

  return `/persona_images/${normalized}`;
};

const TileContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(1.5),
  padding: theme.spacing(0.5),
  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
}));

const FullWidthTileContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5),
}));

const PersonaTileStyled = styled(Paper)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '1 / 1.2',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  overflow: 'hidden',
  width: '100%',
}));

const FullWidthPersonaTile = styled(Paper)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
  width: '100%',
  minHeight: '80px',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300],
  }
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  flexGrow: 1,
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  padding: theme.spacing(0.5),
  boxSizing: 'border-box',
}));

const TextInfoBox = styled(Box)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(0.5),
  boxSizing: 'border-box',
  height: '45px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
}));

const NameTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '0.75rem',
  color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.common.black,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
}));

const SpecialtyTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.65rem',
  color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.grey[600],
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.2,
}));

// Import guest user image
import guestUserImage from '../../../../assets/images/guest-user_tiny.png';

const ActiveChatParticipantsPanel = ({ 
  conversationPersonas = [],
  currentUserProfile = null, 
  onParticipantClick,
  activeSpeakerId,
  onSendMessage, // New prop for sending "speak to" messages
  isGuestMode = false,
  allPersonas = [],
}) => {
  const { t, i18n } = useTranslation('chat');
  const theme = useTheme();
  const navigate = useNavigate();

  // State for translated personas
  const [translatedPersonas, setTranslatedPersonas] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Registration dialog state
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [selectedSpecialistName, setSelectedSpecialistName] = useState('');

  // Ensure persona translations are available when needed (no-op if already loaded)
  useEffect(() => {
    try {
      i18n.loadNamespaces([`ai_personas_${i18n.language}`]);
    } catch {}
  }, [i18n.language, i18n]);

  // Enrich/translate conversation personas for display
  useEffect(() => {
    const translatePersonas = async () => {
      console.log(`[ActiveChatParticipantsPanel] Translation triggered - personas:`, conversationPersonas?.length, 'language:', i18n.language);
      
      if (!conversationPersonas || conversationPersonas.length === 0) {
        setTranslatedPersonas([]);
        return;
      }

      console.log(`[ActiveChatParticipantsPanel] Enriching ${conversationPersonas.length} personas from allPersonas cache`);
      setIsTranslating(true);
      try {
        // Prefer the already-loaded personas list for the current language
        const enriched = conversationPersonas.map((persona) => {
          const match = Array.isArray(allPersonas)
            ? allPersonas.find(p => p.id === persona.id)
            : null;
          if (match) {
            return {
              ...persona,
              name: match.name || persona.name || persona.id,
              specialty: match.specialty || persona.specialty || '',
              image: match.image || persona.image,
              public_bio: match.public_bio || persona.public_bio,
            };
          }
          // Fallback: try to build a readable name from id
          const friendlyName = (persona.name && !/^ai_persona_/.test(persona.name))
            ? persona.name
            : (persona.id || '').replace(/^ai_persona_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return { ...persona, name: friendlyName };
        });
        setTranslatedPersonas(enriched);
      } catch (error) {
        console.error('Error enriching personas in ActiveChatParticipantsPanel:', error);
        setTranslatedPersonas(conversationPersonas);
      } finally {
        setIsTranslating(false);
      }
    };

    const translatePersonasGeneric = async () => {
      try {
        // Prepare texts for batch translation
        const textsToTranslate = [];
        conversationPersonas.forEach((persona, index) => {
          console.log(`[ActiveChatParticipantsPanel] Processing persona ${index}:`, { name: persona.name, specialty: persona.specialty });
          
          // Handle name translation - preserve "AI" prefix
          if (persona.name) {
            if (persona.name.startsWith('AI ')) {
              const nameWithoutAI = persona.name.substring(3); // Remove "AI " prefix
              textsToTranslate.push({
                type: 'name',
                index,
                text: nameWithoutAI,
                hasAIPrefix: true
              });
            } else {
              textsToTranslate.push({
                type: 'name',
                index,
                text: persona.name,
                hasAIPrefix: false
              });
            }
          }

          // Add specialty for translation
          if (persona.specialty) {
            textsToTranslate.push({
              type: 'specialty',
              index,
              text: persona.specialty
            });
          }
        });

        console.log(`[ActiveChatParticipantsPanel] Texts to translate:`, textsToTranslate);

        // Use existing batch translation service with current language
        const translations = await translationService.batchTranslate(
          textsToTranslate.map(item => item.text),
          i18n.language
        );

        console.log(`[ActiveChatParticipantsPanel] Translation results:`, translations);

        // Apply translations back to personas
        const translatedPersonasData = conversationPersonas.map((persona, index) => ({ ...persona }));

        translations.forEach((translation, translationIndex) => {
          const textItem = textsToTranslate[translationIndex];
          const personaIndex = textItem.index;

          if (translation.success) {
            if (textItem.type === 'name') {
              // Reconstruct name with AI prefix if it had one
              const newName = textItem.hasAIPrefix 
                ? `AI ${translation.translatedText}`
                : translation.translatedText;
              console.log(`[ActiveChatParticipantsPanel] Setting translated name:`, newName);
              translatedPersonasData[personaIndex].name = newName;
            } else if (textItem.type === 'specialty') {
              console.log(`[ActiveChatParticipantsPanel] Setting translated specialty:`, translation.translatedText);
              translatedPersonasData[personaIndex].specialty = translation.translatedText;
            }
          } else {
            console.warn(`[ActiveChatParticipantsPanel] Translation failed for:`, textItem.text, translation.error);
          }
        });

        console.log(`[ActiveChatParticipantsPanel] Final translated personas:`, translatedPersonasData);
        setTranslatedPersonas(translatedPersonasData);
      } catch (error) {
        console.error('Error translating personas generically:', error);
        setTranslatedPersonas(conversationPersonas);
      }
    };

    translatePersonas();
  }, [conversationPersonas, i18n.language, i18n, t, allPersonas]);

  // Use translated personas for display
  const displayPersonas = isTranslating ? conversationPersonas : translatedPersonas;

  // useEffect(() => {
  //   console.log("[ActiveChatParticipantsPanel] Props: conversationPersonas:", conversationPersonas);
  // }, [conversationPersonas]);

  let displayItems = [];

  // For guest mode, use guest user image and name
  if (isGuestMode) {
    displayItems.push({
      id: 'guest_user',
      name: t('common:guest.user', 'Guest User'),
      image: guestUserImage,
      specialty: t('common:you', 'You'),
      isUser: true,
    });
  } else if (currentUserProfile) {
    const userName = currentUserProfile.display_name || currentUserProfile.full_name || t('common:you', 'You');
    displayItems.push({
      id: currentUserProfile.user_id || 'current_user',
      name: userName,
      image: currentUserProfile.profile_picture,
      specialty: t('common:you', 'You'),
      isUser: true,
    });
  }

  // Add active personas
  displayPersonas.forEach(persona => {
    displayItems.push({
      ...persona,
      isUser: false,
      isActive: true,
    });
  });
  
  // For guest mode, add all other personas below the active ones
  let otherPersonas = [];
  if (isGuestMode && allPersonas && allPersonas.length > 0) {
    // Get IDs of active personas
    const activePersonaIds = new Set(displayPersonas.map(p => p.id));
    
    // Filter out active personas and get the rest
    const filteredPersonas = allPersonas.filter(persona => !activePersonaIds.has(persona.id));
    
    // Translate other personas if needed
    if (i18n.language !== 'en') {
      const personaNamespace = `ai_personas_${i18n.language}`;
      otherPersonas = filteredPersonas.map((persona) => {
        const personaKey = `personas.persona_${persona.id}`;
        const translatedPersona = t(`${personaNamespace}:${personaKey}`, { returnObjects: true });
        
        if (translatedPersona && typeof translatedPersona === 'object' && translatedPersona.name) {
          return {
            ...persona,
            name: translatedPersona.name,
            specialty: translatedPersona.specialty || persona.specialty,
            bio: translatedPersona.bio || persona.bio
          };
        }
        return persona;
      });
    } else {
      otherPersonas = filteredPersonas;
    }
    
    // Sort by last name
    otherPersonas.sort((a, b) => {
      // Extract last name for sorting
      const getLastName = (name) => {
        if (!name) return '';
        // Remove 'AI ' prefix if present
        const cleanName = name.startsWith('AI ') ? name.substring(3) : name;
        const parts = cleanName.trim().split(' ');
        return parts[parts.length - 1] || '';
      };
      
      const lastNameA = getLastName(a.name);
      const lastNameB = getLastName(b.name);
      return lastNameA.localeCompare(lastNameB);
    });
    
    // Add other personas as disabled items
    otherPersonas.forEach(persona => {
      displayItems.push({
        ...persona,
        isUser: false,
        isActive: false,
        isDisabled: true,
      });
    });
  }
  
  const finalDisplayItemsMap = new Map();
  displayItems.forEach(item => {
    if (!finalDisplayItemsMap.has(item.id)) {
      finalDisplayItemsMap.set(item.id, item);
    }
  });
  const finalDisplayItems = Array.from(finalDisplayItemsMap.values());

  // console.log("[ActiveChatParticipantsPanel] finalDisplayItems:", finalDisplayItems);

  if (finalDisplayItems.length === 0) {
    return <Typography sx={{p:2, textAlign: 'center', color: 'text.secondary'}}>{t('participants.noParticipants')}</Typography>;
  }

  return (
    <Box className="sidebar-scroll" sx={{ p:0.5, height: '100%', overflowY: 'auto', backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100] }}>
      <TileContainer>
        {finalDisplayItems.filter(item => !item.isDisabled).map(item => {
          // For guest user, use the image directly without constructFullImageUrl
          const imageUrl = item.id === 'guest_user' ? item.image : constructFullImageUrl(item.image);
          const isThisAileenCarol = item.id?.toLowerCase() === 'ai_persona_aileen_carol';
          const isActiveSpeaker = item.id === activeSpeakerId;
          let fallbackInitial = 'P';
          if (item.isUser) fallbackInitial = item.name ? item.name.charAt(0).toUpperCase() : 'U';

          return (
            <PersonaTileStyled 
              key={item.id}
              elevation={isActiveSpeaker ? 4 : 2}
              sx={{
                border: isActiveSpeaker ? `2px solid ${theme.palette.primary.main}` : `2px solid transparent`,
                boxShadow: isActiveSpeaker ? `0 0 8px ${theme.palette.primary.light}` : theme.shadows[2],
                position: 'relative',
              }}
            >
              <Tooltip title={!item.isUser ? t('sidebar.clickToSpeak') : ''} placement="top">
                <ImageContainer
                  onClick={() => {
                    if (!item.isUser) {
                      console.log('ActiveChatParticipantsPanel: Avatar clicked for', item.name);
                      console.log('ActiveChatParticipantsPanel: onSendMessage available?', !!onSendMessage);
                      if (onSendMessage) {
                        const message = t('chat:messages.requestToSpeak', { name: item.name, defaultValue: `Please let me speak to ${item.name}` });
                        console.log('ActiveChatParticipantsPanel: Sending message:', message);
                        onSendMessage(message);
                      } else {
                        console.log('ActiveChatParticipantsPanel: onSendMessage not available');
                      }
                    }
                  }}
                  sx={{
                    cursor: !item.isUser ? 'pointer' : 'default',
                  }}
                >
                <Avatar 
                  src={imageUrl} 
                  alt={item.name}
                  variant="square"
                  sx={{
                    width: '85%',
                    height: '85%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    bgcolor: item.isUser && !imageUrl ? 'primary.main' : undefined,
                    color: item.isUser && !imageUrl ? 'white' : undefined,
                    fontSize: item.isUser ? '1.5rem' : undefined,
                    borderRadius: item.isUser ? 1 : 0,
                    img: {
                      objectFit: item.isUser ? 'cover' : 'contain',
                      objectPosition: 'center',
                    }
                  }}
                >
                  {!imageUrl && fallbackInitial}
                </Avatar>
                </ImageContainer>
              </Tooltip>
              <Tooltip title={!item.isUser ? t('sidebar.clickForBio') : ''} placement="top">
                <TextInfoBox 
                  onClick={(e) => {
                    if (!item.isUser) {
                      e.stopPropagation();
                      console.log('ActiveChatParticipantsPanel: Name area clicked for bio', item.name);
                      if (onParticipantClick) {
                        onParticipantClick(item.id);
                      }
                    }
                  }}
                  sx={{
                    cursor: !item.isUser ? 'pointer' : 'default',
                    '&:hover': !item.isUser ? {
                      backgroundColor: theme.palette.action.hover,
                    } : {}
                  }}
                >
                  <NameTypography 
                    sx={isThisAileenCarol ? { color: '#AD55DA', fontWeight: 'bold', fontSize: '0.8rem'} : {fontSize: '0.75rem'}} >
                      {item.name}
                  </NameTypography>
                  {item.specialty && item.specialty !== t('common:you', 'You') && 
                    <SpecialtyTypography 
                      sx={isThisAileenCarol ? { color: theme.palette.primary.main, fontSize: '0.7rem' } : {fontSize: '0.65rem'}} >
                        {item.specialty}
                    </SpecialtyTypography>}
                </TextInfoBox>
              </Tooltip>
            </PersonaTileStyled>
          );
        })}
      </TileContainer>
      
      {/* Show other personas for guest mode */}
      {isGuestMode && otherPersonas.length > 0 && (
        <>
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 0.5, px:1, fontWeight:'bold' }}>{t('activeChat.guestMode.advisorsTitle', 'VirtualMD.app Health Advisors')}</Typography>
          <Typography variant="caption" sx={{ mb: 1.5, px:1, fontStyle: 'italic', color: 'text.secondary', display: 'block' }}>{t('activeChat.guestMode.registrationRequired', 'Registration required')}</Typography>
          <FullWidthTileContainer>
            {finalDisplayItems.filter(item => item.isDisabled).map(item => {
              // For guest user, use the image directly without constructFullImageUrl
              const imageUrl = item.id === 'guest_user' ? item.image : constructFullImageUrl(item.image);
              const isThisAileenCarol = item.id?.toLowerCase() === 'ai_persona_aileen_carol';
              let fallbackInitial = 'P';
              if (item.isUser) fallbackInitial = item.name ? item.name.charAt(0).toUpperCase() : 'U';

              return (
                <FullWidthPersonaTile
                  key={item.id} 
                    elevation={1}
                    onClick={() => {
                      // Show registration prompt
                      console.log('Guest clicked disabled persona:', item.name);
                      setSelectedSpecialistName(item.name);
                      setRegistrationDialogOpen(true);
                    }}
                    sx={{
                      // Remove opacity for guest mode - show personas clearly
                    }}
                  >
                  <Avatar 
                    src={imageUrl} 
                    alt={item.name}
                    variant="square"
                    sx={{
                      width: 60,
                      height: 60,
                      mr: 2,
                      img: {
                        objectFit: 'cover',
                        objectPosition: 'center top',
                      }
                    }}
                  >
                    {!imageUrl && fallbackInitial}
                  </Avatar>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body1"
                      sx={{
                        ...(isThisAileenCarol ? 
                          { color: '#AD55DA', fontWeight: 'bold' } : 
                          { fontWeight: 'medium' }),
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('ActiveChatParticipantsPanel: Name clicked for more info on', item.name);
                        setSelectedSpecialistName(item.name);
                        setRegistrationDialogOpen(true);
                      }}
                    >
                      {item.name}
                    </Typography>
                    {item.specialty && 
                      <Typography 
                        variant="body2"
                        color="text.secondary"
                        sx={isThisAileenCarol ? { color: theme.palette.primary.main } : {}}
                      >
                        {item.specialty}
                      </Typography>
                    }
                  </Box>
                </FullWidthPersonaTile>
              );
            })}
          </FullWidthTileContainer>
        </>
      )}
      
      {/* Registration Dialog */}
      <Dialog 
        open={registrationDialogOpen} 
        onClose={() => setRegistrationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('common:guest.registration.dialogTitle', { specialistName: selectedSpecialistName })}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {t('common:guest.registration.dialogDescription', { specialistName: selectedSpecialistName })}
          </Typography>
          <Typography variant="body2" paragraph>
            {t('common:guest.registration.benefitsTitle')}
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.access')}</Typography>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.personalized')}</Typography>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.saveConversations')}</Typography>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.uploadImages')}</Typography>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.customTeam')}</Typography>
            <Typography component="li" variant="body2">{t('common:guest.registration.benefits.availability')}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationDialogOpen(false)}>
            {t('common:guest.registration.buttons.maybeLater')}
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/register')}
          >
            {t('common:guest.registration.buttons.registerNow')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ActiveChatParticipantsPanel.propTypes = {
  conversationPersonas: PropTypes.array,
  currentUserProfile: PropTypes.object,
  onParticipantClick: PropTypes.func,
  activeSpeakerId: PropTypes.string,
  onSendMessage: PropTypes.func, // New prop for sending messages
};

export default ActiveChatParticipantsPanel; 