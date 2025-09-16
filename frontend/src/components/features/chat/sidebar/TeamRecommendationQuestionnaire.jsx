import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Button,
  Paper,
  Alert,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Add, 
  Remove,
  VolumeUp,
  VolumeOff,
  Mic,
  MicOff
} from '@mui/icons-material';
import { ThinkingIndicator } from '../../../common/ThinkingIndicator';
import { textToSpeech, speechToText } from '../../../../services/api';
import { useVoiceRecorder } from '../../../../hooks/useVoiceRecorder';
import { useTranslation } from 'react-i18next';

// Health Expert Carol's image
// Use medium size for card displays
const AILEENCAROL_IMAGE = '/persona_images/aileen-carol_medium.png';

// Health Expert Carol's ElevenLabs voice ID (using Sarah's voice - female)
const AILEENCAROL_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const HEALTH_CONDITIONS_KEYS = [
  'heart', 'diabetes', 'mentalHealth', 'digestive', 'pain', 'sleep', 
  'weight', 'skin', 'womensHealth', 'mensHealth', 'cancer', 'allergies', 
  'respiratory', 'neurological', 'other'
];

const URGENCY_LEVELS = [
  { value: 'routine', labelKey: 'teamBuilder.urgencySymptoms.urgencyLevels.routine' },
  { value: 'soon', labelKey: 'teamBuilder.urgencySymptoms.urgencyLevels.soon' },
  { value: 'urgent', labelKey: 'teamBuilder.urgencySymptoms.urgencyLevels.urgent' },
  { value: 'emergency', labelKey: 'teamBuilder.urgencySymptoms.urgencyLevels.emergency' }
];

const ALTERNATIVE_MEDICINE_KEYS = [
  'tcm', 'ayurveda', 'acupuncture', 'africanHerbology'
];

const MAX_TEAM_MEMBERS = 4; // Including Health Expert Carol = 5 total

const TeamRecommendationQuestionnaire = ({ 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  error = null,
  myAdvisers = [],  // Current team members
  onRemoveAdviser = null, // Function to remove team members
  profileData = null, // User profile data
  currentUser = null // Current user data
}) => {
  const { t, i18n } = useTranslation(['chat', 'common']);
  const isRTL = i18n.language === 'ar' || i18n.language === 'he' || i18n.language === 'fa';
  
  const [activeStep, setActiveStep] = useState(0);
  const [keepExistingTeam, setKeepExistingTeam] = useState(false);
  const [responses, setResponses] = useState({
    primaryConcerns: '',
    healthConditions: [],
    urgency: 'routine',
    symptoms: '',
    medications: '',
    alternativeMedicine: [],
    customSpecialists: [''],
    specialRequests: ''
  });

  // Voice-related state
  const [isPlayingAileenCarol, setIsPlayingAileenCarol] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(30);
  const [showTranscriptionDialog, setShowTranscriptionDialog] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const hasTriggeredTranscription = useRef(false);
  const hasClosedDialog = useRef(false);

  // Get user's first name for personalization
  const getUserFirstName = () => {
    const fullName = profileData?.full_name || profileData?.display_name || currentUser?.email || '';
    if (fullName.includes(' ')) {
      return fullName.split(' ')[0];
    }
    return fullName || t('common:user.defaultName');
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle recording timer
  const startRecordingTimer = () => {
    setRecordingTimeLeft(30);
    hasTriggeredTranscription.current = false;
    hasClosedDialog.current = false;
    timerRef.current = setInterval(() => {
      setRecordingTimeLeft(prev => {
        if (prev <= 1) {
          // Timer reached 0, show transcription dialog
          clearInterval(timerRef.current);
          setShowTranscriptionDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTimeLeft(30);
  };

  // Voice recording for health concerns input - MOVED TO TOP to prevent temporal dead zone
  const {
    isListening,
    isTranscribing,
    recordingError,
    toggleListening: originalToggleListening
  } = useVoiceRecorder({
    setInputMessage: (textOrFunction) => {
      setResponses(prev => ({
        ...prev,
        primaryConcerns: typeof textOrFunction === 'function' 
          ? textOrFunction(prev.primaryConcerns) 
          : textOrFunction
      }));
    },
    currentText: responses.primaryConcerns || '',
    suppressSilenceErrorRef: useRef(false)
  });

  // Auto-start transcription when dialog shows and close when complete
  useEffect(() => {
    if (showTranscriptionDialog) {
      console.log('Dialog state:', { isListening, isTranscribing, hasTriggered: hasTriggeredTranscription.current, hasClosed: hasClosedDialog.current });
      
      if (isListening && originalToggleListening && !hasTriggeredTranscription.current) {
        console.log('Starting transcription...');
        hasTriggeredTranscription.current = true;
        
        // Stop recording to trigger transcription
        setTimeout(() => {
          try {
            originalToggleListening();
          } catch (error) {
            console.error('Error stopping recording:', error);
            setShowTranscriptionDialog(false);
            hasTriggeredTranscription.current = false;
          }
        }, 100);
      } else if (!isListening && !isTranscribing && hasTriggeredTranscription.current && !hasClosedDialog.current) {
        console.log('Transcription complete, closing dialog...');
        // Transcription is complete, close dialog
        hasClosedDialog.current = true;
        setTimeout(() => {
          setShowTranscriptionDialog(false);
          hasTriggeredTranscription.current = false;
          hasClosedDialog.current = false;
        }, 500);
      }
      
      // Fallback: Force close dialog after 30 seconds to prevent it from getting stuck
      const fallbackTimeout = setTimeout(() => {
        console.log('Fallback: Force closing dialog after 30 seconds');
        setShowTranscriptionDialog(false);
        hasTriggeredTranscription.current = false;
        hasClosedDialog.current = false;
      }, 30000);
      
      return () => clearTimeout(fallbackTimeout);
    }
  }, [showTranscriptionDialog, isListening, isTranscribing, originalToggleListening]);

  const handleTranscribeCancel = () => {
    console.log('Manual dialog close triggered');
    setShowTranscriptionDialog(false);
    hasTriggeredTranscription.current = false;
    hasClosedDialog.current = false;
    // Stop recording without transcription
    if (isListening) {
      originalToggleListening();
    }
    stopRecordingTimer();
  };

  // Text-to-speech for Health Expert Carol's greeting
  const handlePlayAileenCarolSpeech = async () => {
    if (isPlayingAileenCarol) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAileenCarol(false);
      return;
    }

    try {
      setIsPlayingAileenCarol(true);
      const firstName = getUserFirstName();
      const greetingText = t('teamBuilder.aileenCarolGreeting', { 
        name: firstName, 
        action: hasExistingTeam ? t('teamBuilder.optimizeTeam') : t('teamBuilder.buildTeam') 
      });
      
      const audioBlob = await textToSpeech(greetingText, AILEENCAROL_VOICE_ID);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlayingAileenCarol(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      setIsPlayingAileenCarol(false);
    }
  };

  // Custom toggle function that manages the timer
  const toggleListening = () => {
    if (!originalToggleListening) {
      console.warn('Voice recorder not ready yet');
      return;
    }
    
    if (isListening) {
      // Stop recording
      stopRecordingTimer();
      originalToggleListening();
    } else {
      // Start recording
      originalToggleListening();
      startRecordingTimer();
    }
  };

  // Stop timer when transcription starts or recording stops
  useEffect(() => {
    if (isTranscribing || !isListening) {
      stopRecordingTimer();
    }
  }, [isTranscribing, isListening]);

  // Ref for the questionnaire container
  const questionnaireRef = useRef(null);

  // Check if user has existing team members (excluding Health Expert Carol) - moved up before steps definition
  const existingTeamMembers = myAdvisers.filter(advisor => 
    advisor.id?.toLowerCase() !== 'ai_persona_aileen_carol'
  );
  const hasExistingTeam = existingTeamMembers.length > 0;
  const teamIsFull = existingTeamMembers.length >= MAX_TEAM_MEMBERS;
  const spotsAvailable = MAX_TEAM_MEMBERS - existingTeamMembers.length;

  // Dynamic steps based on whether user has existing team
  const baseSteps = [
    t('teamBuilder.steps.primaryConcerns'),
    t('teamBuilder.steps.healthConditions'), 
    t('teamBuilder.steps.urgencySymptoms'),
    t('teamBuilder.steps.medicinePreferences'),
    t('teamBuilder.steps.additionalInfo')
  ];
  
  const steps = hasExistingTeam ? [t('teamBuilder.steps.existingTeamReview'), ...baseSteps] : baseSteps;

  // Step completion logic - moved up before useEffect
  const isStepComplete = (step) => {
    // Adjust step index if we have existing team (step 0 becomes team review)
    const adjustedStep = hasExistingTeam ? step - 1 : step;
    
    if (hasExistingTeam && step === 0) {
      return true; // Team review step is always complete
    }
    
    switch (adjustedStep) {
      case 0: return typeof responses.primaryConcerns === 'string' && responses.primaryConcerns.trim().length > 0;
      case 1: return true; // Health conditions can be empty
      case 2: return responses.urgency.length > 0;
      case 3: return true; // Medicine preferences can be empty
      case 4: return true; // Additional info can be empty
      default: return false;
    }
  };

  const canProceed = isStepComplete(activeStep);
  const isLastStep = activeStep === steps.length - 1;

  // Handler functions - moved up before useEffect
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = () => {
    const filteredCustomSpecialists = responses.customSpecialists.filter(spec => spec.trim().length > 0);
    
    const formattedResponses = {
      [t('common:teamRecommendation.submission.primaryConcernsLabel')]: responses.primaryConcerns,
      [t('common:teamRecommendation.submission.healthConditionsLabel')]: responses.healthConditions.join(', ') || t('common:teamRecommendation.defaults.noneSpecified'),
      // i18n-extract: 1 key(s) needed
      // Key 1: teamRecommendation.submission.urgencyLabel - "How urgent is your health concern?"
      // Target file: /frontend/public/i18n/en/common.json
      'How urgent is your health concern?': responses.urgency,
      'What symptoms are you experiencing?': responses.symptoms || 'None specified',
      'What medications are you currently taking?': responses.medications || 'None specified',
      'Would you like alternative medicine specialists?': responses.alternativeMedicine.join(', ') || 'None specified',
      'Specific AI Health Specialists requested?': filteredCustomSpecialists.join(', ') || 'None specified',
      'Any specific requests for your health team?': responses.specialRequests || 'None specified',
      'Keep existing team members?': keepExistingTeam ? 'Yes' : 'No',
      'Existing team members': keepExistingTeam && existingTeamMembers.length > 0 
        ? existingTeamMembers.map(m => `${m.name} (${m.specialty || 'Specialist'})`).join(', ') 
        : 'None',
      'Current team size': existingTeamMembers.length,
      'Available spots for new specialists': spotsAvailable,
      'Maximum recommendations allowed': spotsAvailable
    };
    
    onSubmit(formattedResponses);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canProceed && !isLoading) {
        if (isLastStep) {
          handleSubmit();
        } else {
          handleNext();
        }
      }
    }
  };

  const handleConditionChange = (condition) => {
    setResponses(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }));
  };

  const handleAlternativeMedicineChange = (option) => {
    setResponses(prev => ({
      ...prev,
      alternativeMedicine: prev.alternativeMedicine.includes(option)
        ? prev.alternativeMedicine.filter(c => c !== option)
        : [...prev.alternativeMedicine, option]
    }));
  };

  const handleCustomSpecialistChange = (index, value) => {
    setResponses(prev => ({
      ...prev,
      customSpecialists: prev.customSpecialists.map((spec, i) => 
        i === index ? value : spec
      )
    }));
  };

  const addCustomSpecialistField = () => {
    if (responses.customSpecialists.length < 5) {
      setResponses(prev => ({
        ...prev,
        customSpecialists: [...prev.customSpecialists, '']
      }));
    }
  };

  const removeCustomSpecialistField = (index) => {
    if (responses.customSpecialists.length > 1) {
      setResponses(prev => ({
        ...prev,
        customSpecialists: prev.customSpecialists.filter((_, i) => i !== index)
      }));
    }
  };

  // Auto-set keep existing team to true if they have existing members
  useEffect(() => {
    if (hasExistingTeam && !keepExistingTeam) {
      setKeepExistingTeam(true);
    }
  }, [hasExistingTeam, keepExistingTeam]);

  // Auto-populate existing team members in the custom specialists field
  useEffect(() => {
    if (keepExistingTeam && existingTeamMembers.length > 0) {
      const existingNames = existingTeamMembers.map(member => member.name || '');
      const totalFields = Math.min(existingNames.length + 1, 5); // Keep space for new suggestions
      const filledFields = [...existingNames];
      
      // Fill remaining fields with empty strings up to limit
      while (filledFields.length < totalFields) {
        filledFields.push('');
      }
      
      setResponses(prev => ({
        ...prev,
        customSpecialists: filledFields
      }));
    }
  }, [keepExistingTeam, existingTeamMembers]);

  // Global Enter key handler for the entire component
  useEffect(() => {
    const handleGlobalKeyPress = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        // Only handle if the event target is within our questionnaire component
        if (!questionnaireRef.current?.contains(event.target)) {
          return;
        }
        
        // Don't interfere if user is typing in a multiline field with Shift+Enter
        const target = event.target;
        if (target.tagName === 'TEXTAREA' && event.shiftKey) {
          return;
        }
        
        // Don't interfere if user is clicking buttons or other interactive elements
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          return;
        }
        
        event.preventDefault();
        if (canProceed && !isLoading) {
          if (isLastStep) {
            handleSubmit();
          } else {
            handleNext();
          }
        }
      }
    };

    // Add event listener to the document
    document.addEventListener('keydown', handleGlobalKeyPress);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyPress);
    };
  }, [canProceed, isLoading, isLastStep, handleSubmit, handleNext]);

  // If team is full, show disabled state
  if (teamIsFull) {
    return (
      <Paper elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
          <Typography variant="h6" gutterBottom>{t('teamBuilder.alerts.teamFull')}</Typography>
          <Typography>
            {t('teamBuilder.alerts.teamFullMessage')}
          </Typography>
        </Alert>
        <Button onClick={onCancel} variant="contained">
          {t('teamBuilder.alerts.goBackButton')}
        </Button>
      </Paper>
    );
  }

  const renderStepContent = () => {
    // Handle team review step (step 0 when existing team exists)
    if (hasExistingTeam && activeStep === 0) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            {t('teamBuilder.existingTeam.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('teamBuilder.existingTeam.subtitle', { count: existingTeamMembers.length, available: spotsAvailable, max: MAX_TEAM_MEMBERS })}
          </Typography>
          
          {existingTeamMembers.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                {t('teamBuilder.existingTeam.currentMembers')}
              </Typography>
              {existingTeamMembers.map(member => (
                <Box key={member.id} sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1, 
                  mb: 1, 
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Avatar 
                    src={member.image} 
                    sx={{ width: 32, height: 32, mr: 2 }}
                  >
                    {member.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {member.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {member.specialty || t('team.specialist')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>{t('teamBuilder.existingTeam.teamManagement')}</strong> {t('teamBuilder.existingTeam.teamManagementNote')}
            </Typography>
          </Alert>
          
          {spotsAvailable === 0 && (
            <Alert severity="warning">
              {t('teamBuilder.alerts.teamFullAnalysis')}
            </Alert>
          )}
        </Box>
      );
    }
    
    // Adjust step index for existing team
    const adjustedStep = hasExistingTeam ? activeStep - 1 : activeStep;
    
    switch (adjustedStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('teamBuilder.primaryConcerns.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('teamBuilder.primaryConcerns.subtitle', { 
                action: hasExistingTeam ? t('teamBuilder.primaryConcerns.optimizeTeam') : t('teamBuilder.primaryConcerns.buildTeam') 
              })}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={responses.primaryConcerns || ''}
              onChange={(e) => setResponses(prev => ({ ...prev, primaryConcerns: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder={t('teamBuilder.primaryConcerns.placeholder')}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip 
                      title={isListening ? t('chat:microphone.turnOff') : t('chat:microphone.turnOn')}
                      placement="top"
                      arrow
                    >
                      <span>
                        <IconButton
                          onClick={toggleListening}
                          edge="end"
                          color={isListening ? "secondary" : "primary"}
                          disabled={isTranscribing}
                          sx={{ 
                            position: 'absolute',
                            bottom: 8,
                            right: 8
                          }}
                        >
                          {isTranscribing ? (
                            <ThinkingIndicator showDots={false} />
                          ) : isListening ? (
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Mic />
                              {recordingTimeLeft <= 10 && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    backgroundColor: recordingTimeLeft <= 5 ? 'error.main' : 'warning.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 16,
                                    height: 16,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {recordingTimeLeft}
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <MicOff />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                )
              }}
            />
            {recordingError && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {recordingError}
              </Typography>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('teamBuilder.healthConditions.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('teamBuilder.healthConditions.subtitle')}
            </Typography>
            <FormGroup>
              {HEALTH_CONDITIONS_KEYS.map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={responses.healthConditions.includes(t(`teamBuilder.healthConditions.options.${key}`))}
                      onChange={() => handleConditionChange(t(`teamBuilder.healthConditions.options.${key}`))}
                      size="small"
                    />
                  }
                  label={t(`teamBuilder.healthConditions.options.${key}`)}
                  sx={{ mb: 0.5 }}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('teamBuilder.steps.urgencySymptoms')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('teamBuilder.urgencySymptoms.subtitle')}
            </Typography>
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">{t('teamBuilder.urgencySymptoms.title')}</FormLabel>
              <RadioGroup
                value={responses.urgency}
                onChange={(e) => setResponses(prev => ({ ...prev, urgency: e.target.value }))}
              >
                {URGENCY_LEVELS.map((level) => (
                  <FormControlLabel
                    key={level.value}
                    value={level.value}
                    control={<Radio size="small" />}
                    label={t(level.labelKey)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('teamBuilder.urgencySymptoms.symptomsTitle')}
              value={responses.symptoms}
              onChange={(e) => setResponses(prev => ({ ...prev, symptoms: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder={t('teamBuilder.urgencySymptoms.symptomsPlaceholder')}
              variant="outlined"
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('teamBuilder.medicinePreferences.title')}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('teamBuilder.medicinePreferences.alternativeTitle')}
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              {ALTERNATIVE_MEDICINE_KEYS.map((key) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={responses.alternativeMedicine.includes(t(`teamBuilder.medicinePreferences.options.${key}`))}
                      onChange={() => handleAlternativeMedicineChange(t(`teamBuilder.medicinePreferences.options.${key}`))}
                      size="small"
                    />
                  }
                  label={t(`teamBuilder.medicinePreferences.options.${key}`)}
                  sx={{ mb: 0.5 }}
                />
              ))}
            </FormGroup>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('teamBuilder.medicinePreferences.specialistTitle', { 
                action: hasExistingTeam ? t('teamBuilder.medicinePreferences.addToTeam') : t('teamBuilder.medicinePreferences.join') 
              })}
              {hasExistingTeam && ' ' + t('teamBuilder.medicinePreferences.spotsAvailable', { count: spotsAvailable })}
            </Typography>
            {keepExistingTeam && existingTeamMembers.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {t('teamBuilder.medicinePreferences.keepExistingAlert')}
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {t('teamBuilder.medicinePreferences.specialistNote')}
            </Typography>
            
            {responses.customSpecialists.map((specialist, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={specialist}
                  onChange={(e) => handleCustomSpecialistChange(index, e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('teamBuilder.medicinePreferences.specialistPlaceholder', { number: index + 1, context: hasExistingTeam ? 'additional' : ''}).trim()}
                  variant="outlined"
                />
                {responses.customSpecialists.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeCustomSpecialistField(index)}
                    color="error"
                  >
                    <Remove />
                  </IconButton>
                )}
                {index === responses.customSpecialists.length - 1 && responses.customSpecialists.length < 5 && (
                  <IconButton
                    size="small"
                    onClick={addCustomSpecialistField}
                    color="primary"
                  >
                    <Add />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('teamBuilder.additionalInfo.title')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('teamBuilder.additionalInfo.medicationsLabel')}
              value={responses.medications}
              onChange={(e) => setResponses(prev => ({ ...prev, medications: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder={t('teamBuilder.additionalInfo.medicationsPlaceholder')}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('teamBuilder.additionalInfo.specialRequestsLabel')}
              value={responses.specialRequests}
              onChange={(e) => setResponses(prev => ({ ...prev, specialRequests: e.target.value }))}
              onKeyPress={handleKeyPress}
              placeholder={t('teamBuilder.additionalInfo.specialRequestsPlaceholder')}
              variant="outlined"
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Paper ref={questionnaireRef} elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', direction: isRTL ? 'rtl' : 'ltr' }}>
        {/* Health Expert Carol Introduction */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
          <Avatar
            src={AILEENCAROL_IMAGE}
            alt={t('common:alt.aiDoctor')}
            sx={{ width: 60, height: 60, flexShrink: 0 }}
          />
          <Box sx={{ 
            position: 'relative',
            bgcolor: 'primary.light',
            color: 'primary.contrastText',
            p: 2,
            borderRadius: 2,
            flexGrow: 1,
            ...(isRTL ? {
              '&:after': {
                content: '""',
                position: 'absolute',
                right: -8,
                top: 16,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px 0 8px 8px',
                borderColor: 'transparent',
                borderLeftColor: 'primary.light'
              }
            } : {
              '&:before': {
                content: '""',
                position: 'absolute',
                left: -8,
                top: 16,
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '8px 8px 8px 0',
                borderColor: 'transparent',
                borderRightColor: 'primary.light'
              }
            })
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500, fontStyle: 'italic' }}>
                  {t('teamBuilder.aileenCarolIntro.main', { name: getUserFirstName(), context: hasExistingTeam ? 'optimize' : 'build' })}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9, fontStyle: 'italic' }}>
                  {t('teamBuilder.aileenCarolIntro.subtext')}
                </Typography>
              </Box>
              <Tooltip title={isPlayingAileenCarol ? t('teamBuilder.muteAileenCarol') : t('teamBuilder.hearAileenCarol')}>
                <IconButton
                  onClick={handlePlayAileenCarolSpeech}
                  size="small"
                  sx={{ 
                    color: 'primary.contrastText',
                    ml: 1,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {isPlayingAileenCarol ? <VolumeUp /> : <VolumeOff />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>

        {/* Hidden audio element for Health Expert Carol's voice */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
          <Button
            onClick={activeStep === 0 ? onCancel : handleBack}
            startIcon={activeStep === 0 ? null : (isRTL ? <ArrowForward /> : <ArrowBack />)}
            endIcon={activeStep === 0 ? null : (isRTL ? <ArrowBack /> : null)}
          >
            {activeStep === 0 ? t('teamBuilder.buttons.cancel') : t('teamBuilder.buttons.back')}
          </Button>
          
          {/* Custom Dots Navigation - Centered between buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {steps.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === activeStep ? 'primary.main' : 'grey.300',
                  mx: 0.5,
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </Box>
          
          <Button
            variant="contained"
            onClick={isLastStep ? handleSubmit : handleNext}
            disabled={!canProceed || isLoading}
            startIcon={isLastStep ? null : (isRTL ? <ArrowBack /> : null)}
            endIcon={isLastStep ? null : (isRTL ? null : <ArrowForward />)}
          >
            {isLoading ? (
              <ThinkingIndicator showDots={false} />
            ) : isLastStep ? (
              t('teamBuilder.buttons.getRecommendations')
            ) : (
              t('teamBuilder.buttons.next')
            )}
          </Button>
        </Box>
      </Paper>

      {/* Transcription Processing Dialog */}
      <Dialog
        open={showTranscriptionDialog}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          {t('teamBuilder.dialogs.transcriptionTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <ThinkingIndicator showDots={true} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {t('teamBuilder.dialogs.transcriptionMessage')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTranscribeCancel} color="secondary" size="small">
            {t('teamBuilder.dialogs.transcriptionClose')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TeamRecommendationQuestionnaire; 