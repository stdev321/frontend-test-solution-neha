// NewConversationPanel.jsx - Component for starting a new conversation
import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Tooltip
} from '@mui/material';
import { useMyAdvisers } from '../../../../contexts/MyAdvisersContext';
import { useTranslation } from 'react-i18next';

/**
 * Component for setting up a new chat conversation
 * 
 * @param {Object} props - Component props
 * @param {string} props.initialChoice - The currently selected choice (1: Dr Carol Only, 2: All AIs, 3: Specific Specialists, 4: One-on-one)
 * @param {Function} props.onSetInitialChoice - Handler for when choice changes
 * @param {Function} props.onConfirmInitialChoice - Handler for when user confirms the choice (Start/Next button)
 * @param {boolean} props.personaApiLoading - Whether the personas are currently loading
 * @param {boolean} props.isCreatingConversation - Whether a new conversation is being created
 * @param {string} props.personaApiError - Error message from persona API, if any
 * @param {Function} props.onSetMode - Handler to change the sidebar mode (e.g., back to default)
 */
export default function NewConversationPanel({
  initialChoice,
  onSetInitialChoice,
  onConfirmInitialChoice,
  personaApiLoading,
  isCreatingConversation,
  personaApiError,
  onSetMode
}) {
  const { myAdvisers, isLoadingMyAdvisers, myAdvisersError } = useMyAdvisers();
  const { t } = useTranslation();

  // Determine if there are advisers other than AI Health Expert Carol
  // myAdvisers from context should always include AI Health Expert Carol if selections are managed correctly by backend.
  const otherAdvisersCount = myAdvisers ? myAdvisers.filter(adviser => adviser.id !== 'ai_persona_aileen_carol').length : 0;
  const hasOtherAdvisers = otherAdvisersCount > 0;

  const isChoiceLoading = personaApiLoading || isLoadingMyAdvisers;

  let option2Label = t('newConversation.options.allAdvisers');
  let option2Disabled = isChoiceLoading;
  let option2Tooltip = "";

  if (!isLoadingMyAdvisers && !hasOtherAdvisers && myAdvisers && myAdvisers.length <=1) {
    // Only Dr Carol is in myAdvisers, or it's empty (which shouldn't happen if Dr Carol is always added)
    option2Label = t('newConversation.options.allAdvisersCarolOnly');
    // This option effectively becomes same as "AI Health Expert Carol Only", could be disabled or just relabeled.
    // For now, let's keep it enabled but relabeled if it only contains AI Health Expert Carol.
    // If myAdvisers list itself is empty (error case or no default AI Health Expert Carol), then disable.
    if(!myAdvisers || myAdvisers.length === 0) {
        option2Disabled = true;
        option2Tooltip = t('newConversation.tooltips.noAdvisersSelected');
    }
  } else if (isLoadingMyAdvisers) {
    option2Tooltip = t('newConversation.tooltips.loadingAdvisers');
  }

  let option3Label = t('newConversation.options.chooseSpecific');
  let option3Disabled = isChoiceLoading;
  let option3Tooltip = "";

  if (!isLoadingMyAdvisers && !hasOtherAdvisers) {
    option3Disabled = true;
    option3Tooltip = t('newConversation.tooltips.noOtherAdvisers');
  } else if (isLoadingMyAdvisers) {
    option3Tooltip = t('newConversation.tooltips.loadingAdvisers');
  }

  return (
    <Box sx={{ p: 1 }}>
      <FormControl component="fieldset" sx={{ width: '100%' }} disabled={isChoiceLoading || isCreatingConversation}>
        <FormLabel component="legend" sx={{ mb: 1 }}>{t('newConversation.consultationChoice.question')}</FormLabel>
        <RadioGroup
                          aria-label={t('common:aria.personaChoice')}
          name="persona-choice-group"
          value={initialChoice}
          onChange={(e) => onSetInitialChoice(e.target.value)}
        >
          <FormControlLabel value="1" control={<Radio size="small"/>} label={t('newConversation.aileenCarolOnly')} sx={{mb: -0.5}}/>
          
          <Tooltip title={option2Tooltip} placement="right" disableHoverListener={!option2Disabled && !option2Tooltip}>
            <span>
              <FormControlLabel 
                value="2" 
                control={<Radio size="small"/>} 
                label={option2Label} 
                disabled={option2Disabled}
                sx={{mb: -0.5}}
              />
            </span>
          </Tooltip>

          <Tooltip title={option3Tooltip} placement="right" disableHoverListener={!option3Disabled && !option3Tooltip}>
            <span>
              <FormControlLabel 
                value="3" 
                control={<Radio size="small"/>} 
                label={option3Label} 
                disabled={option3Disabled}
                sx={{mb: -0.5}}
              />
            </span>
          </Tooltip>
          
          <FormControlLabel value="4" control={<Radio size="small"/>} label={t('newConversation.oneOnOne')} disabled sx={{mb: -0.5}}/>
        </RadioGroup>
      </FormControl>
      {(isChoiceLoading) && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24}/></Box>}
      {(personaApiError || myAdvisersError) && <Alert severity="error" sx={{ mt: 2 }}>{personaApiError || (typeof myAdvisersError === 'string' ? myAdvisersError : t('newConversation.errors.loadingAdvisers'))}</Alert>}
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{mt: 2}}>
        <Button
          onClick={() => onSetMode('default')}
          disabled={isChoiceLoading || isCreatingConversation}
        >
          {t('newConversation.buttons.cancel')}
        </Button>
        <Button
          onClick={onConfirmInitialChoice}
          disabled={isChoiceLoading || isCreatingConversation || initialChoice === '4'}
          variant="contained"
        >
          {(isChoiceLoading || isCreatingConversation) ? <CircularProgress size={24} /> : (initialChoice === '3' ? t('newConversation.buttons.next') : t('newConversation.buttons.start'))}
        </Button>
      </Stack>
    </Box>
  );
}
