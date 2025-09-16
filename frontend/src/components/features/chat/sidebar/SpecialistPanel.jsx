// SpecialistPanel.jsx - Component for selecting specialist personas
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import PersonaSearchBar from '../PersonaSearchBar';

/**
 * Component for selecting specialist personas to include in a conversation
 * 
 * @param {Object} props - Component props
 * @param {Array} props.availablePersonasForSelection - List of available personas to select from
 * @param {Object} props.selectedPersonaIds - Map of selected persona IDs (persona ID -> boolean)
 * @param {Function} props.onPersonaSelectionChange - Handler for when a checkbox is toggled (typically a state setter)
 * @param {boolean} props.isCreatingConversation - Whether a new conversation is being created
 * @param {Function} props.onSetMode - Handler to change the sidebar mode
 * @param {string} props.personaApiError - Error message from persona API, if any
 * @param {Function} props.onStartWithSelectedSpecialists - Handler for starting the chat with selected specialists
 * @param {boolean} props.isSingleSpecialistModeActive - Whether the single specialist mode is active
 * @param {boolean} props.personaApiLoading - Whether the persona API is loading
 */
export default function SpecialistPanel({
  availablePersonasForSelection,
  selectedPersonaIds,
  onPersonaSelectionChange,
  isCreatingConversation,
  onSetMode,
  personaApiError,
  onStartWithSelectedSpecialists,
  isSingleSpecialistModeActive,
  personaApiLoading,
}) {
  const { t } = useTranslation(['chat', 'common']);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (isSingleSpecialistModeActive) {
      // If in single specialist mode, checking one unchecks others
      onPersonaSelectionChange(checked ? { [name]: true } : {});
    } else {
      // Original multi-select behavior
      onPersonaSelectionChange(prev => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  const handlePersonaSearchSelect = (persona) => {
    if (isSingleSpecialistModeActive) {
      // In single specialist mode, replace any existing selection
      onPersonaSelectionChange({ [persona.id]: true });
    } else {
      // In multi-select mode, add to existing selections
      onPersonaSelectionChange(prev => ({
        ...prev,
        [persona.id]: true,
      }));
    }
  };

  const guidanceText = isSingleSpecialistModeActive
    ? t('specialistPanel.guidanceSingle')
    : t('specialistPanel.guidanceMulti');

  const startButtonText = isSingleSpecialistModeActive ? t('specialistPanel.startPrivateConsult') : t('specialistPanel.startChat');

  // Determine if the start button should be disabled
  const selectedCount = Object.values(selectedPersonaIds).filter(Boolean).length;
  let isStartDisabled = isCreatingConversation || selectedCount === 0;
  if (isSingleSpecialistModeActive && selectedCount > 1) {
    // Technically, the manager hook will also show an error, but good to disable here too.
    // The checkbox logic should prevent this, but as a safeguard.
    isStartDisabled = true; 
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {isSingleSpecialistModeActive ? t('specialistPanel.selectSingle') : t('specialistPanel.selectMulti')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {guidanceText}
      </Typography>
      
      {/* Search Bar */}
      <PersonaSearchBar 
        onPersonaSelect={handlePersonaSearchSelect}
        selectedPersonaIds={selectedPersonaIds}
        sx={{ mb: 2 }}
      />
      {personaApiError && !isSingleSpecialistModeActive && selectedCount > 1 ? (
        // Only show the specific "select only one" error from the hook when relevant
        // Other personaApiErrors (like fetch failed) will be shown by the general personaApiError check below
        <Alert severity="error">{personaApiError}</Alert>
      ) : personaApiError ? (
        <Alert severity="error">{personaApiError}</Alert>
      ) : null}

      {/* Show this specific error if in single mode and more than one selected */}
      {isSingleSpecialistModeActive && selectedCount > 1 && (
        <Alert severity="warning" sx={{ mb: 2 }}>{t('specialistPanel.warningSelectOne')}</Alert>
      )}

      <List dense sx={{ maxHeight: '300px', overflowY: 'auto', mb: 2 }}>
        {availablePersonasForSelection.length === 0 && !personaApiLoading ? (
          <Typography sx={{textAlign: 'center', p: 2}}>
            {isSingleSpecialistModeActive ? t('specialistPanel.noSpecialistsAvailable') : t('specialistPanel.noAdvisersAvailable')}
          </Typography>
        ) : personaApiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2}}><CircularProgress size={24} /></Box>
        ) : (
          availablePersonasForSelection.map((persona) => (
            <ListItem key={persona.id} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!selectedPersonaIds[persona.id]}
                    onChange={handleCheckboxChange}
                    name={persona.id}
                    disabled={isCreatingConversation}
                    size="small"
                  />
                }
                label={`${persona.name}${persona.specialty ? ` (${persona.specialty})` : ''}`}
                sx={{ width: '100%', ml: 0 }}
                disabled={isCreatingConversation}
              />
            </ListItem>
          ))
        )}
      </List>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{mt: 2}}>
        <Button
          onClick={() => onSetMode('default')} // Changed back to 'default' for simplicity from this panel
          disabled={isCreatingConversation}
        >
          {t('common:cancel')}
        </Button>
        <Button
          onClick={onStartWithSelectedSpecialists} 
          disabled={isStartDisabled} // Use calculated disabled state
          variant="contained"
        >
          {isCreatingConversation ? <CircularProgress size={24} /> : startButtonText}
        </Button>
      </Stack>
    </Box>
  );
}
