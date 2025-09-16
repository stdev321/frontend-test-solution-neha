import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  Stack,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Psychology, Groups, PlayArrow, Pause } from '@mui/icons-material';
import { constructFullImageUrl } from '../../../utils/imageUtils';
import { ThinkingIndicator } from '../../../common/ThinkingIndicator';
import { textToSpeech } from '../../../../services/api';

// Health Expert Carol's ElevenLabs voice ID (using Sarah's voice - female)
const AILEENCAROL_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const TeamRecommendationResults = ({ 
  recommendationData,
  availablePersonas,
  onAcceptTeam,
  onRetry,
  onCancel,
  isApplying = false,
  error = null,
  myAdvisers = [] // Current team members
}) => {
  const { t } = useTranslation('chat');
  const [teamMembers, setTeamMembers] = useState([]);
  const [aileenCarol, setAileenCarol] = useState(null);
  const [existingMembers, setExistingMembers] = useState([]);
  const [isPlayingAnalysis, setIsPlayingAnalysis] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!recommendationData?.recommendedSpecialists || !availablePersonas) return;

    // Find Health Expert Carol
    const aileenCarolPersona = availablePersonas.find(p => 
      p.id?.toLowerCase() === 'ai_persona_aileen_carol'
    );
    setAileenCarol(aileenCarolPersona);

    // Get existing team members (excluding Health Expert Carol) - create stable reference
    const currentMembers = myAdvisers.filter(advisor => 
      advisor.id?.toLowerCase() !== 'ai_persona_aileen_carol'
    );
    
    // Only update if the existing members actually changed
    setExistingMembers(prev => {
      const prevIds = prev.map(m => m.id).sort();
      const currentIds = currentMembers.map(m => m.id).sort();
      if (JSON.stringify(prevIds) === JSON.stringify(currentIds)) {
        return prev; // Don't update if same members
      }
      return currentMembers;
    });

    // Match recommended specialists with available personas
    // Filter out any that might accidentally include Health Expert Carol
    const matchedTeam = recommendationData.recommendedSpecialists
      .filter(recommendation => 
        !recommendation.name?.toLowerCase().includes('aileen carol') &&
        !recommendation.name?.toLowerCase().includes('Health Expertcarol')
      )
      .map(recommendation => {
        console.log('Matching recommendation:', recommendation);
        
        // First try exact specialty match
        let persona = availablePersonas.find(p => 
          p.specialty && recommendation.specialty &&
          p.specialty.toLowerCase() === recommendation.specialty.toLowerCase()
        );
        
        if (persona) {
          console.log('Found exact specialty match:', persona.name, 'for', recommendation.specialty);
        }
        
        // If no exact match, try partial specialty matching
        if (!persona && recommendation.specialty) {
          persona = availablePersonas.find(p => 
            p.specialty && (
              p.specialty.toLowerCase().includes(recommendation.specialty.toLowerCase()) ||
              recommendation.specialty.toLowerCase().includes(p.specialty.toLowerCase())
            )
          );
          
          if (persona) {
            console.log('Found partial specialty match:', persona.name, 'for', recommendation.specialty);
          }
        }
        
        // If still no match, try matching by recommendation name against specialty
        if (!persona && recommendation.name) {
          persona = availablePersonas.find(p => {
            if (!p.specialty) return false;
            const recName = recommendation.name.toLowerCase().replace(/\b(ai\s+)?(dr\.?\s+)?/g, '');
            const specialty = p.specialty.toLowerCase();
            
            // Check if recommendation name is contained in specialty or vice versa
            return specialty.includes(recName) || recName.includes(specialty) ||
                   // Handle common specialty variations
                   (recName.includes('gastro') && specialty.includes('gastro')) ||
                   (recName.includes('infectious') && specialty.includes('infectious')) ||
                   (recName.includes('cardio') && specialty.includes('cardio')) ||
                   (recName.includes('neuro') && specialty.includes('neuro')) ||
                   (recName.includes('pulmo') && specialty.includes('pulmo')) ||
                   (recName.includes('endo') && specialty.includes('endo')) ||
                   (recName.includes('ortho') && specialty.includes('ortho')) ||
                   (recName.includes('psych') && specialty.includes('psych')) ||
                   (recName.includes('derm') && specialty.includes('derm')) ||
                   (recName.includes('oncol') && specialty.includes('oncol'));
          });
          
          if (persona) {
            console.log('Found name-to-specialty match:', persona.name, 'for', recommendation.name);
          }
        }
        
        if (!persona) {
          console.log('No match found for recommendation:', recommendation);
        }
        
        return persona ? { ...persona, reason: recommendation.reason } : null;
      })
      .filter(Boolean)
      .slice(0, 4); // Ensure max 4 new specialists

    console.log('Final matched team:', matchedTeam.map(m => ({ name: m.name, specialty: m.specialty })));
    console.log('Final matched team with IDs:', matchedTeam.map(m => ({ id: m.id, name: m.name, specialty: m.specialty })));
    console.log('Full matched team objects:', matchedTeam);
    
    // Only update if the team actually changed
    setTeamMembers(prev => {
      const prevIds = prev.map(m => m.id).sort();
      const newIds = matchedTeam.map(m => m.id).sort();
      if (JSON.stringify(prevIds) === JSON.stringify(newIds)) {
        return prev; // Don't update if same team
      }
      return matchedTeam;
    });
  }, [recommendationData, availablePersonas, myAdvisers?.length]); // Use length instead of full array

  const handleAcceptTeam = () => {
    console.log('=== ACCEPT TEAM BUTTON CLICKED ===');
    // Combine existing team members with new recommendations
    const existingIds = existingMembers.map(member => member.id);
    const newTeamIds = teamMembers.map(member => member.id);
    const allTeamIds = [...existingIds, ...newTeamIds];
    
    console.log('handleAcceptTeam - Existing IDs:', existingIds);
    console.log('handleAcceptTeam - New team IDs:', newTeamIds);
    console.log('handleAcceptTeam - All team IDs being sent:', allTeamIds);
    console.log('handleAcceptTeam - Team members with details:', teamMembers.map(m => ({ id: m.id, name: m.name, specialty: m.specialty })));
    
    onAcceptTeam(allTeamIds);
  };

  // Function to add "AI" prefix to doctor names in text
  const formatTextWithAIPrefixes = (text) => {
    if (!text) return text;
    
    // Replace doctor names with AI prefixes
    return text
      .replace(/\bDr\.\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, 'AI Health Expert$1')
      .replace(/\bDr\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, 'AI Health Expert$1')
      .replace(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)(?=\s+(?:specialist|doctor|physician))/gi, 'AI $1')
      .replace(/^Dr\.\s+Carol/g, 'AI Health Expert Carol')
      .replace(/\bDr\.\s+Carol/g, 'AI Health Expert Carol');
  };

  // Play Health Expert Carol's analysis
  const handlePlayAnalysis = async () => {
    if (isPlayingAnalysis) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlayingAnalysis(false);
      return;
    }

    if (!recommendationData?.explanation) return;

    try {
      setIsPlayingAnalysis(true);
      const formattedText = formatTextWithAIPrefixes(recommendationData.explanation);
      
      const audioBlob = await textToSpeech(formattedText, AILEENCAROL_VOICE_ID);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlayingAnalysis(false);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      setIsPlayingAnalysis(false);
    }
  };

  const renderPersonaCard = (persona, isAileenCarol = false, isExisting = false) => {
    const imageUrl = constructFullImageUrl(persona.image);
    
    return (
      <Card 
        key={persona.id} 
        elevation={isAileenCarol ? 3 : 1} 
        sx={{ 
          mb: 1,
          border: isAileenCarol ? '2px solid' : '1px solid',
          borderColor: isAileenCarol ? 'primary.main' : 'divider',
          bgcolor: 'transparent'
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={imageUrl} 
              sx={{ 
                width: isAileenCarol ? 50 : 40, 
                height: isAileenCarol ? 50 : 40,
                bgcolor: 'transparent'
              }}
            >
              {persona.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: isAileenCarol ? 'bold' : 'medium' }}>
                {persona.name}
                {isAileenCarol && (
                  <Chip 
                    icon={<CheckCircle />} 
                    label={t('team.teamLead')} 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
                {isExisting && !isAileenCarol && (
                  <Chip 
                    label={t('team.currentMember')} 
                    size="small" 
                    color="info" 
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: isAileenCarol ? 'white' : 'text.secondary' // White text for Health Expert Carol, normal for others
                }}
              >
                {persona.specialty || t('personas.defaultSpecialty')}
              </Typography>
              {persona.reason && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 0.5, 
                    display: 'block',
                    color: isAileenCarol ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary' // Light white for Health Expert Carol, normal for others
                  }}
                >
                  {persona.reason}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (!recommendationData) {
    return (
      <Paper elevation={0} sx={{ p: 2, textAlign: 'center' }}>
        <ThinkingIndicator />
        <Typography sx={{ mt: 2 }}>{t('team.analyzingNeeds')}</Typography>
      </Paper>
    );
  }

  // Handle emergency response
  if (recommendationData.isEmergency) {
    return (
      <Paper elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('team.emergencyDetected')}
          </Typography>
          <Typography>
            {recommendationData.explanation}
          </Typography>
        </Alert>
        <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
          <Button onClick={onCancel} variant="outlined" fullWidth>
            {t('team.backToSafety')}
          </Button>
        </Box>
      </Paper>
    );
  }

  const totalTeamSize = 1 + existingMembers.length + teamMembers.length; // Health Expert Carol + existing + new

  return (
    <Paper elevation={0} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Psychology color="primary" />
        <Typography variant="h6">
          {t('team.recommendedTeam')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {/* Team Overview */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {t('team.completeTeam', { count: totalTeamSize })}
          </Typography>
          
          {/* Health Expert Carol - Team Leader */}
          {aileenCarol && renderPersonaCard({ ...aileenCarol, reason: t('team.teamLeadReason') }, true)}
          
          {/* Existing Team Members */}
          {existingMembers.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'info.main', fontWeight: 'bold' }}>
                {t('team.keepingMembers')}
              </Typography>
              {existingMembers.map(member => renderPersonaCard(member, false, true))}
            </>
          )}

          {/* New Recommended Specialists */}
          {teamMembers.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'success.main', fontWeight: 'bold' }}>
                {t('team.newRecommendations')}
              </Typography>
              {teamMembers.map(member => renderPersonaCard(member))}
            </>
          )}
        </Box>

        {/* AI Analysis Below Team */}
        {recommendationData.explanation && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Tooltip title={isPlayingAnalysis ? t('aileenCarol.stopAnalysis') : t('aileenCarol.playAnalysis')}>
                <IconButton
                  onClick={handlePlayAnalysis}
                  size="small"
                  color="primary"
                  sx={{ mt: -0.5 }}
                >
                  {isPlayingAnalysis ? <Pause /> : <PlayArrow />}
                </IconButton>
              </Tooltip>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">
                  <strong>{t('team.aileenCarolReasoning')}</strong> {formatTextWithAIPrefixes(recommendationData.explanation)}
                </Typography>
              </Box>
            </Box>
          </Alert>
        )}

        {/* Hidden audio element for analysis playback */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {teamMembers.length === 0 && existingMembers.length === 0 && (
          <Alert severity="warning">
            {t('team.noMatchingSpecialists')}
          </Alert>
        )}

        {/* Medical Disclaimer */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            <strong>{t('team.medicalDisclaimerTitle')}</strong> {t('team.medicalDisclaimerText')}
          </Typography>
        </Alert>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 1, flexDirection: 'column' }}>
        {(teamMembers.length > 0 || existingMembers.length > 0) && (
          <Button
            variant="contained"
            onClick={handleAcceptTeam}
            disabled={isApplying}
            startIcon={isApplying ? <ThinkingIndicator showDots={false} /> : <Groups />}
          >
            {isApplying ? t('team.applyingTeam') : t('team.acceptTeam')}
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onRetry} variant="outlined" fullWidth>
            {t('team.tryDifferent')}
          </Button>
          <Button onClick={onCancel} variant="text" fullWidth>
            {t('team.cancel')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default TeamRecommendationResults; 