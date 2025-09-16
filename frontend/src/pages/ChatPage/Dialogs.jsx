import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Button,
  Alert,
  Box,
} from '@mui/material';
import { ThinkingIndicator } from '../../components/common/ThinkingIndicator';
import { useTranslation } from 'react-i18next';

export function ChatPageDialogs({
  // Initial Choice Dialog Props
  initialChoiceDialogOpen,
  onCloseInitialChoiceDialog, // Renamed from setInitialChoiceDialogOpen for clarity
  initialChoice,
  onInitialChoiceChange,
  onInitialChoiceSubmit,
  personaApiLoading, // Shared loading state for initial dialog fetch
  personaApiError,   // Shared error state for initial dialog fetch

  // Persona Selection Dialog Props
  personaChoiceDialogOpen,
  onClosePersonaChoiceDialog, // Renamed from setPersonaChoiceDialogOpen
  availablePersonasForSelection,
  selectedPersonaIds,
  onPersonaSelectionChange,
  onPersonaSelectionSubmit,
  onPersonaSelectionCancel,

  // Exit Confirmation Dialog Props
  exitConfirmOpen,
  onCloseExitConfirm,
  isExiting,
  onConfirmExit,
}) {
  const { t } = useTranslation();
  return (
    <>
      {/* --- Initial Choice Dialog --- */}
      <Dialog open={initialChoiceDialogOpen} onClose={onCloseInitialChoiceDialog} aria-labelledby="initial-choice-dialog-title">
        <DialogTitle id="initial-choice-dialog-title">Start or Continue Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            How would you like to proceed?
          </DialogContentText>
          {personaApiError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {personaApiError}
            </Alert>
          )}
          {personaApiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <ThinkingIndicator />
            </Box>
          ) : (
            <FormControl component="fieldset">
              <FormLabel component="legend">Options</FormLabel>
              <RadioGroup
                                    aria-label={t('common:aria.conversationChoice')}
                name="conversation-choice-radio-group"
                value={initialChoice}
                onChange={onInitialChoiceChange}
              >
                <FormControlLabel value="1" control={<Radio />} label={t('dialogs.startWithDefault')} />
                <FormControlLabel value="2" control={<Radio />} label={t('dialogs.startWithSpecific')} />
                {/* Option 3 might be added later if needed: Select Existing Conversation */}
              </RadioGroup>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseInitialChoiceDialog} disabled={personaApiLoading}>Cancel</Button>
          <Button onClick={onInitialChoiceSubmit} color="primary" disabled={personaApiLoading || !initialChoice}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Persona Selection Dialog --- */}
      <Dialog open={personaChoiceDialogOpen} onClose={onPersonaSelectionCancel} aria-labelledby="persona-selection-dialog-title">
        <DialogTitle id="persona-selection-dialog-title">Select AI Specialists</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Choose one or more AI specialists to participate in this new conversation.
          </DialogContentText>
          {personaApiError && (
             <Alert severity="error" sx={{ mb: 2 }}>
               {personaApiError}
             </Alert>
           )}
          {personaApiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <ThinkingIndicator />
            </Box>
          ) : (
            <List dense>
              {availablePersonasForSelection.map((persona) => (
                <ListItem key={persona.persona_id} dense sx={{ pl: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(selectedPersonaIds[persona.persona_id])}
                        onChange={() => onPersonaSelectionChange(persona.persona_id)}
                        name={persona.persona_id}
                      />
                    }
                    label={`${persona.name} (${persona.title || 'Specialist'})`}
                    sx={{ width: '100%' }} // Ensure label takes full width for click area
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onPersonaSelectionCancel} disabled={personaApiLoading}>Cancel</Button>
          <Button
             onClick={onPersonaSelectionSubmit}
             color="primary"
             disabled={personaApiLoading || Object.values(selectedPersonaIds).filter(Boolean).length === 0}
           >
            Start Conversation
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Exit Confirmation Dialog --- */}
      <Dialog
        open={exitConfirmOpen}
        onClose={onCloseExitConfirm}
        aria-labelledby="exit-confirm-dialog-title"
        aria-describedby="exit-confirm-dialog-description"
      >
        <DialogTitle id="exit-confirm-dialog-title">Exit Conversation?</DialogTitle>
        <DialogContent>
          <DialogContentText id="exit-confirm-dialog-description">
            Would you like to generate a summary of this conversation before exiting?
            Generating a summary might take a moment.
          </DialogContentText>
          {isExiting && (
             <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
               <ThinkingIndicator />
             </Box>
           )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseExitConfirm} disabled={isExiting}>Cancel</Button>
          <Button onClick={() => onConfirmExit(false)} color="secondary" disabled={isExiting}>
            Exit Without Summary
          </Button>
          <Button onClick={() => onConfirmExit(true)} color="primary" autoFocus disabled={isExiting}>
            Generate Summary & Exit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
