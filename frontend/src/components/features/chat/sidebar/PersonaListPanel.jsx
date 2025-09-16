// PersonaListPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  ListItemSecondaryAction,
  Tooltip,
  Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useI18nPersonas } from '../../../../hooks/useI18nPersonas';
import { useMemo } from 'react';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import { constructImageUrl } from '../../../../utils/imageUtils';
import translationService from '../../../../services/translationService';

const PersonaListPanel = ({
  personas = [],
  onSelectPersona,
  activePersonaId,
  onRemovePersona,
  nonRemovableIds = [],
  showRemoveIcon = true,
  onSendMessage, // New prop for sending "speak to" messages
}) => {
    const { t, i18n } = useTranslation(['chat', 'common']);
    const { personas: localizedPersonas } = useI18nPersonas();
    const localizedNameById = useMemo(() => {
        const map = {};
        for (const p of localizedPersonas || []) {
            if (p && p.id) map[p.id] = p.name;
        }
        return map;
    }, [localizedPersonas]);
    
    // Personas are already pre-translated from i18n JSON files
    // No need for additional translation state

    // Personas are already translated - no need for cache key
    // The personas come from personaI18nService which loads the correct language

    // No translation needed - personas are already loaded in the correct language
    // from personaI18nService which reads from /i18n/locales/{language}/ai_personas_{language}.json

    // Use personas directly - they're already in the correct language
    const displayPersonas = personas;

    // Helper to parse image data URI from database (handles potential JSON) - NO LONGER USED FOR PATHS
    // const parseImageData = (imageData) => { ... }; // Commented out or remove

    if (!displayPersonas || displayPersonas.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                {t('common:personaList.noSpecialistsFound')}
            </Typography>
        );
    }
    console.log("PersonaListPanel: Rendering with translated personas:", displayPersonas); // Log all personas data

    return (
        <List disablePadding>
            {displayPersonas.map(persona => {
                const displayName = localizedNameById[persona.id] || persona.name;
                const isPersonaActive = persona.id === activePersonaId;
                
                let imagePath = null;
                if (persona.image && typeof persona.image === 'string') {
                    const trimmed = persona.image.trim();

                    // ── Legacy JSON-string format ──────────────────────
                    if (trimmed.startsWith('{')) {
                        try {
                            const imageData = JSON.parse(trimmed);
                            if (imageData.light && typeof imageData.light === 'string' && imageData.light.trim() !== '') {
                                imagePath = imageData.light;
                            } else if (imageData.path && typeof imageData.path === 'string' && imageData.path.trim() !== '') {
                                imagePath = imageData.path;
                            } else {
                               console.warn(`PersonaListPanel: Persona ${persona.id} has JSON image data but no 'light' or 'path' key:`, persona.image);
                            }
                        } catch (e) {
                            console.error(`PersonaListPanel: Failed to parse persona.image JSON for ${persona.id}:`, persona.image, e);
                        }

                    // ── Current plain-string path format ──────────────
                    } else {
                        imagePath = trimmed; // e.g. "/persona_images/aileen-carol" (suffix added by constructImageUrl)
                    }

                } else if (persona.image && typeof persona.image === 'object' && persona.image !== null) {
                    // If persona.image is already an object (e.g., from myAdvisers context which might pre-process it)
                    if (persona.image.light && typeof persona.image.light === 'string') {
                        imagePath = persona.image.light;
                    } else if (persona.image.path && typeof persona.image.path === 'string') {
                        imagePath = persona.image.path;
                    } else if (typeof persona.image.src === 'string'){ // another common pattern
                        imagePath = persona.image.src;
                    } else {
                        console.warn(`PersonaListPanel: Persona ${persona.id} has object image data with unknown structure:`, persona.image);
                    }
                }

                console.log(`PersonaListPanel: Persona ID: ${persona.id}, original persona.image:`, JSON.stringify(persona.image), `, derived imagePath: ${imagePath}`);
                const imageUrl = constructImageUrl(imagePath);
                console.log(`PersonaListPanel: Persona ID: ${persona.id}, constructed imageUrl: ${imageUrl}`);

                return (
                    <ListItem key={persona.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton 
                            onClick={() => {
                                console.log('PersonaListPanel: Card clicked for', displayName);
                                // In pre-consultation mode, clicking the card shows the bio
                                if (!onSendMessage) {
                                    console.log('PersonaListPanel: Pre-consultation mode, showing bio');
                                    onSelectPersona(persona.id);
                                } else {
                                    // During active chat, send "speak to" message
                                    console.log('PersonaListPanel: Active chat mode, sending speak to message');
                                    const message = t(['chat:mobileChat.requestToSpeakToAI','chat:messages.requestToSpeak'], { name: displayName });
                                    console.log('PersonaListPanel: Sending message:', message);
                                    onSendMessage(message);
                                }
                            }}
                            selected={isPersonaActive}
                            sx={{ 
                                borderRadius: 1,
                                position: 'relative',
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                    {imageUrl ? (
                                        <img 
                                            src={imageUrl}
                                            alt={displayName}
                                            width="100%" 
                                            height="100%" 
                                            style={{ 
                                                objectFit: 'cover', 
                                                objectPosition: 'center top',
                                                borderRadius: '50%' 
                                            }}
                                            onError={(e) => {
                                                console.error(`PersonaListPanel: Error loading image for ${persona.id}: ${imageUrl}`, e);
                                                e.target.onerror = null; 
                                                // Replace with a visible icon placeholder inside Avatar
                                                const avatarNode = e.target.parentNode;
                                                if(avatarNode) {
                                                    e.target.style.display = 'none'; // Hide broken img
                                                    // Check if MedicalServicesIcon already there (to avoid duplicates if onError fires multiple times)
                                                    if (!avatarNode.querySelector('.mui-fallback-icon')) {
                                                        const icon = document.createElement('span');
                                                        icon.className = 'mui-fallback-icon'; // for querySelector check
                                                        // Can't directly render MUI icon here without React context, so use text or basic SVG if needed
                                                        // For simplicity, we let the (imageUrl ? ... : <MedicalServicesIcon/>) handle it by re-render or ensure default is visible
                                                        // The current logic will fall through to the MedicalServicesIcon outside this if image load fails and imageUrl becomes effectively null for rendering
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <MedicalServicesIcon />
                                    )}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText 
                                primary={displayName} 
                                secondary={persona.specialty} 
                                primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    fontWeight: isPersonaActive ? 'bold' : 'normal' 
                                }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            {/* Button container for remove button only */}
                            <Box sx={{ 
                                position: 'absolute', 
                                bottom: 4, 
                                right: 4, 
                                display: 'flex', 
                                gap: 0.5 
                            }}>
                                {/* Remove button - only show in pre-consultation when remove is allowed */}
                                {showRemoveIcon && !nonRemovableIds.includes(persona.id) && !onSendMessage && (
                                    <Tooltip title={t('team.removeFromTeam')}>
                                        <IconButton 
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemovePersona(persona.id);
                                            }}
                                            sx={{ 
                                                bgcolor: (theme) => theme.palette.mode === 'dark' 
                                                    ? 'rgba(97, 97, 97, 0.9)' 
                                                    : 'rgba(255, 255, 255, 0.9)',
                                                '&:hover': { 
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                                                        ? 'rgba(97, 97, 97, 1)' 
                                                        : 'rgba(255, 255, 255, 1)' 
                                                },
                                                width: 24,
                                                height: 24
                                            }}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default PersonaListPanel;
