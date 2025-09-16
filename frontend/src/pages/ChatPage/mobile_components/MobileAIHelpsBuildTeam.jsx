import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
  IconButton,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  VolumeUp,
  VolumeOff,
  Mic,
  MicOff,
  Remove,
  Send
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// project-level hooks / helpers
import { ThinkingIndicator } from '../../../components/common/ThinkingIndicator';
import { textToSpeech } from '../../../services/api';
import { useVoiceRecorder } from '../../../hooks/useVoiceRecorder';
import { useMyAdvisers } from '../../../contexts/MyAdvisersContext';

// Health Expert Carol constants
// Use medium size for mobile displays
const AILEENCAROL_IMAGE = '/persona_images/aileen-carol_medium.png';
const AILEENCAROL_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

export default function MobileAIHelpsBuildTeam({
  onSubmit,           // function(questionnaireData)
  onBack,             // navigate back handler
  isLoading = false,
  error = null,
  myAdvisers = [],    // current team (includes Health Expert Carol)
  profileData = null,
  currentUser = null,
  onStartTeamConversation // handler to immediately start chat with team
}) {
  /***** helpers *****/
  const { removeAdviserFromUserTeam } = useMyAdvisers();
  const { t } = useTranslation('chat');

  const getUserFirstName = () => {
    if (currentUser?.displayName) return currentUser.displayName.split(' ')[0];
    if (currentUser?.display_name) return currentUser.display_name.split(' ')[0];
    if (profileData?.firstName) return profileData.firstName;
    if (profileData?.full_name) return profileData.full_name.split(' ')[0];
    if (profileData?.email) return profileData.email.split('@')[0];
    return t('common:user.defaultName');
  };

  /***** team calculations *****/
  const existingTeam = myAdvisers.filter(p => p.id?.toLowerCase() !== 'ai_persona_aileen_carol');
  const hasExistingTeam = existingTeam.length > 0;
  const MAX_SPECIALISTS = 4; // not including Dr Carol
  const teamIsFull = existingTeam.length >= MAX_SPECIALISTS;

  /***** local state *****/
  const [primaryConcerns, setPrimaryConcerns] = useState('');
  const [localError, setLocalError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [isPlayingAileenCarol, setIsPlayingAileenCarol] = useState(false);
  const audioRef = useRef(null);

  /***** voice recorder *****/
  const suppressSilenceErrorRef = useRef(false);
  const {
    isListening,
    isTranscribing,
    transcript,
    error: recordingError,
    toggleListening
  } = useVoiceRecorder({
    setInputMessage: setPrimaryConcerns,
    currentText: primaryConcerns,
    suppressSilenceErrorRef,
  });

  // append transcript
  useEffect(() => {
    if (transcript) setPrimaryConcerns(prev => (prev ? prev + ' ' : '') + transcript);
  }, [transcript]);

  /***** tts *****/
  const speakCarol = async (text) => {
    try {
      setIsPlayingAileenCarol(true);
      const blob = await textToSpeech(text, AILEENCAROL_VOICE_ID);
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.onended = () => {
          URL.revokeObjectURL(url);
          setIsPlayingAileenCarol(false);
        };
        await audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
      setIsPlayingAileenCarol(false);
    }
  };

  const handlePlayCarol = () => {
    if (isPlayingAileenCarol) {
      audioRef.current?.pause();
      setIsPlayingAileenCarol(false);
      return;
    }
    const msg = teamIsFull
      ? t('mobileTeamBuilder.carolMessages.teamFull', { name: getUserFirstName() })
      : t('mobileTeamBuilder.carolMessages.helpBuild', { name: getUserFirstName() });
    speakCarol(msg);
  };

  /***** remove member *****/
  const handleRemove = async (id) => {
    if (!removeAdviserFromUserTeam) return;
    try {
      setRemovingId(id);
      await removeAdviserFromUserTeam(id);
      setLocalError(null);
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingId(null);
    }
  };

  /***** submit questionnaire *****/
  const handleSubmit = () => {
    if (!primaryConcerns.trim()) return;
    const data = {
      [t('mobileTeamBuilder.questionnaire.question')]: primaryConcerns.trim(),
      [t('mobileTeamBuilder.questionnaire.keepExisting')]: hasExistingTeam ? t('common:yes') : t('common:no'),
      [t('mobileTeamBuilder.questionnaire.existingMembers')]: hasExistingTeam ? existingTeam.map(m => m.name).join(', ') : t('common:none'),
      [t('mobileTeamBuilder.questionnaire.currentSize')]: existingTeam.length.toString(),
      [t('mobileTeamBuilder.questionnaire.availableSpots')]: Math.max(0, MAX_SPECIALISTS - existingTeam.length).toString(),
      [t('mobileTeamBuilder.questionnaire.maxRecommendations')]: Math.max(0, MAX_SPECIALISTS - existingTeam.length).toString(),
    };
    onSubmit?.(data);
  };

  /***** render helpers *****/
  const canSubmit = primaryConcerns.trim().length > 0 && !isLoading && !teamIsFull;

  /***** UI *****/
  return (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100vh', bgcolor:'background.default' }}>
      <AppBar position="static" elevation={1} sx={{ bgcolor:'background.paper', color:'text.primary' }}>
        <Toolbar sx={{ minHeight:'48px !important', py:0 }}>
          <IconButton edge="start" onClick={onBack}><ArrowBack/></IconButton>
          <Typography variant="h6" sx={{ flexGrow:1, fontSize:'1.1rem' }}>
            {teamIsFull ? t('mobileTeamBuilder.title.yourTeam') : t('mobileTeamBuilder.title.teamBuilder')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex:1, overflow:'auto', p:2, display:'flex', flexDirection:'column' }}>
        {/* Carol intro */}
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:2 }}>
          <Avatar src={AILEENCAROL_IMAGE} sx={{ width:40, height:40 }}/>
          <Box sx={{ bgcolor:'primary.light', color:'primary.contrastText', p:1.5, borderRadius:2, flexGrow:1 }}>
            <Typography variant="body2" sx={{ fontWeight:500, fontSize:'0.85rem' }}>
              {teamIsFull ? t('mobileTeamBuilder.carolGreeting.teamFull', { name: getUserFirstName() }) : t('mobileTeamBuilder.carolGreeting.helpBuild', { name: getUserFirstName() })}
            </Typography>
          </Box>
          <IconButton size="small" onClick={handlePlayCarol} sx={{ color:isPlayingAileenCarol?'primary.main':'text.secondary' }}>
            {isPlayingAileenCarol ? <VolumeUp/> : <VolumeOff/>}
          </IconButton>
        </Box>
        <audio ref={audioRef} style={{ display:'none' }}/>

        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        {localError && <Alert severity="error" sx={{ mb:2 }}>{localError}</Alert>}

        {/* Team list */}
        {hasExistingTeam && (
          <Paper sx={{ mb:2 }}>
            <Box sx={{ bgcolor:'info.light', px:2, py:1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight:'bold', fontSize:'0.85rem' }}>
                {t('mobileTeamBuilder.currentTeam', { current: existingTeam.length, max: MAX_SPECIALISTS })}
              </Typography>
            </Box>
            <List dense>
              {existingTeam.map((m,i)=>(
                <React.Fragment key={m.id}>
                  <ListItem sx={{ py:0.5 }}>
                    <ListItemAvatar><Avatar src={m.image} sx={{ width:32, height:32 }}>{m.name?.[0]}</Avatar></ListItemAvatar>
                    <ListItemText primary={t('mobileTeamBuilder.aiSpecialist', { name: m.name })} secondary={m.specialty || t('mobileTeamBuilder.specialist')}
                      primaryTypographyProps={{ fontSize:'0.9rem', fontWeight:'medium' }}
                      secondaryTypographyProps={{ fontSize:'0.75rem' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" size="small" onClick={()=>handleRemove(m.id)} disabled={removingId===m.id} sx={{ color:'error.main' }}>
                        {removingId===m.id? <ThinkingIndicator showDots={false} sx={{ transform:'scale(0.7)' }}/> : <Remove/>}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {i<existingTeam.length-1 && <Divider/>}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Full team note / input form */}
        {teamIsFull ? (
          <Box sx={{ mt:2 }}>
            <Button variant="contained" fullWidth onClick={onStartTeamConversation}>{t('mobileTeamBuilder.startConversation')}</Button>
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" sx={{ mb:1, fontWeight:'bold' }}>{t('mobileTeamBuilder.tellUsWhy')}</Typography>
            <Box sx={{ position:'relative', mb:2 }}>
              <TextField
                fullWidth multiline rows={4}
                value={primaryConcerns}
                onChange={e=>setPrimaryConcerns(e.target.value)}
                placeholder={t('mobileTeamBuilder.placeholder')}
                onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSubmit(); }}}
              />
              <IconButton
                onClick={toggleListening}
                size="small"
                sx={{ position:'absolute', top:8, right:8 }}
              >
                {isListening? <Mic/> : <MicOff/>}
              </IconButton>
              <Button variant="contained" size="small" endIcon={<Send/>}
                onClick={handleSubmit}
                disabled={!canSubmit}
                sx={{ position:'absolute', bottom:8, right:8 }}
              >{t('common:send')}</Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
} 