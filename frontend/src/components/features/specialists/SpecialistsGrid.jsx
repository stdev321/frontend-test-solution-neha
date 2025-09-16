import React, { useState, useEffect } from 'react';
import { apiRequest, API_BASE_URL } from '../../../services/api';
import { useTranslation } from 'react-i18next';
import translationService from '../../../services/translationService';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Tooltip,
  Divider,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import { useMyAdvisers } from '../../../contexts/MyAdvisersContext';
import { constructImageUrl } from '../../../utils/imageUtils';
import PersonaSearchBar from '../chat/PersonaSearchBar';

// Helper – serve from frontend public path to keep transparency consistent
const constructFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) return imagePath;
  let filename = imagePath.trim().replace(/^\/??persona_images\/?/, '');
  if (filename.trim() === '') return null;
  
  // Remove any existing extension and add tier suffix for medium quality (cards)
  const baseName = filename.replace(/\.png$/, '');
  return `/persona_images/${baseName}_medium.png`;
};

const getLastName = (name) => {
  if (!name) return '';
  
  // Clean up the name by removing common prefixes and titles
  let cleanName = name.trim()
    .replace(/^(Dr\.?\s*|AI\s*|Professor\s*|Prof\.?\s*)/i, '') // Remove titles and AI prefix
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  const parts = cleanName.split(' ');
  if (parts.length === 0) return '';
  
  // Return the last part as the last name
  return parts[parts.length - 1].toLowerCase();
};

// Define specialty groupings - UPDATED with patient-focused categories
const SPECIALTY_GROUPS = {
  'Diabetes & Blood Sugar': [
    'Endocrinology', 'Opthalmology', 'Ophthalmology', 'Dietician'
  ],
  'Weight Management': [
    'Dietician', 'Endocrinology', 'Ayurvedic Therapy'
  ],
  'Mental Health & Stress': [
    'Cognitive Behavior Therapy', 'Psychiatry', 'Psychology', 'Psychotherapy',
    'Acupuncture', 'Traditional Chinese Medicine', 'Ayurvedic Therapy',
    'Herbalist', 'Homeopathic Wellness', 'Family Therapy (Islamic)'
  ],
  'Cancer Support': [
    'Oncology', 'Palliative & Hospice Care', 'Ayurvedic Therapy', 'Herbalist'
  ],
  'Heart Health': [
    'Cardiology', 'Dietician', 'Acupuncture', 'Traditional Chinese Medicine'
  ],
  'Pain Management': [
    'Pain Medicine', 'Orthopedics', 'Physical Medicine & Rehabilitation',
    'Physical Therapy', 'Chiropractor', 'Acupuncture', 'Traditional Chinese Medicine',
    'Ayurvedic Therapy', 'Herbalist'
  ],
  'Digestive Issues': [
    'Gastroenterology', 'Dietician', 'Traditional Chinese Medicine', 'Herbalist'
  ],
  'Sleep Problems': [
    'Sleep Disorders', 'Acupuncture', 'Traditional Chinese Medicine', 'Homeopathic Wellness'
  ],
  'Skin Problems': [
    'Dermatology', 'Ayurvedic Therapy', 'Herbalist'
  ],
  'Women\'s Health': [
    'Obstetrics & Gynecology', 'Sex Therapy', 'Ayurvedic Therapy', 'Traditional Chinese Medicine'
  ],
  'Children\'s Health': [
    'Pediatric Health & Family Wellness', 'Pediatric Psychology', 
    'Childhood Autism, Anxiety and Depression'
  ],
  'Aging & Senior Health': [
    'Geriatrics', 'Ayurvedic Therapy', 'Traditional Chinese Medicine'
  ],
  'Nutrition & Diet': [
    'Dietician', 'Herbalist', 'Traditional Chinese Medicine', 'Ayurvedic Therapy'
  ],
  'Allergies & Immune System': [
    'Allergy & Immunology', 'Immunology', 'Herbalist', 'Homeopathic Wellness'
  ],
  'Breathing & Lung Issues': [
    'Pulmonology', 'Acupuncture', 'Traditional Chinese Medicine'
  ],
  'Sports & Fitness Injuries': [
    'Sports Medicine', 'Orthopedics', 'Physical Therapy', 'Chiropractor'
  ],
  'Eastern & Alternative Medicine': [
    'Traditional Chinese Medicine', 'Ayurvedic Therapy', 'Herbalist',
    'Acupuncture', 'Homeopathic Wellness', 'Chiropractor'
  ],
  'Cosmetic & Beauty Medicine': [
    'Plastic Surgery', 'Dermatology'
  ],
  'Anxiety Help': [
    'Cognitive Behavior Therapy', 'Psychiatry', 'Psychology',
    'Childhood Autism, Anxiety and Depression', 'Acupuncture',
    'Traditional Chinese Medicine', 'Ayurvedic Therapy', 'Herbalist',
    'Homeopathic Wellness', 'Sleep Disorders'
  ],
  'Medication & Pharmacy': [
    'Pharmacy'
  ],
  'Primary Care & General Health': [
    'My AI Primary Health & Wellness Advisor', 'VirtualMD.app Director of Health',
    'Nurse Practicioner'
  ],
  'Medical Specialties': [
    'Neurology', 'Ophthalmology', 'Opthalmology', 'Nephrology', 'Urology',
    'Otolaryngology (ENT)', 'Hematology', 'General Surgery', 'Anesthesiology',
    'Forensics', 'Radiology', 'Rheumatology', 'Infectious Diseases', 'Toxicology',
    'Pathology & Laboratory Medicine', 'Speech Language Pathology',
    'Genomic & Precision Medicine', 'Medical Genetics & Genetic Counseling',
    'Emergency Medicine'
  ]
};

// Category translation key mapping
const CATEGORY_TRANSLATION_KEYS = {
  'Diabetes & Blood Sugar': 'specialistCategories.diabetesBloodSugar',
  'Weight Management': 'specialistCategories.weightManagement',
  'Mental Health & Stress': 'specialistCategories.mentalHealthStress',
  'Cancer Support': 'specialistCategories.cancerSupport',
  'Heart Health': 'specialistCategories.heartHealth',
  'Pain Management': 'specialistCategories.painManagement',
  'Digestive Issues': 'specialistCategories.digestiveIssues',
  'Sleep Problems': 'specialistCategories.sleepProblems',
  'Skin Problems': 'specialistCategories.skinProblems',
  'Women\'s Health': 'specialistCategories.womensHealth',
  'Children\'s Health': 'specialistCategories.childrensHealth',
  'Aging & Senior Health': 'specialistCategories.agingSeniorHealth',
  'Nutrition & Diet': 'specialistCategories.nutritionDiet',
  'Allergies & Immune System': 'specialistCategories.allergiesImmuneSystem',
  'Breathing & Lung Issues': 'specialistCategories.breathingLungIssues',
  'Sports & Fitness Injuries': 'specialistCategories.sportsFitnessInjuries',
  'Eastern & Alternative Medicine': 'specialistCategories.easternAlternativeMedicine',
  'Cosmetic & Beauty Medicine': 'specialistCategories.cosmeticBeautyMedicine',
  'Anxiety Help': 'specialistCategories.anxietyHelp',
  'Medication & Pharmacy': 'specialistCategories.medicationPharmacy',
  'Primary Care & General Health': 'specialistCategories.primaryCareGeneralHealth',
  'Medical Specialties': 'specialistCategories.medicalSpecialties'
};

// Function to categorize personas into groups - UPDATED to allow overlapping categories
const categorizePersonas = (personas) => {
  const categorized = {};
  const uncategorized = [];

  // Initialize all categories
  Object.keys(SPECIALTY_GROUPS).forEach(category => {
    categorized[category] = [];
  });

  personas.forEach(persona => {
    let assigned = false;
    const specialty = persona.specialty || '';

    // Find ALL categories this persona belongs to (allow overlapping)
    for (const [category, specialties] of Object.entries(SPECIALTY_GROUPS)) {
      if (specialties.includes(specialty)) {
        categorized[category].push(persona);
        assigned = true;
        // Don't break - allow persona to be in multiple categories
      }
    }

    if (!assigned) {
      uncategorized.push(persona);
    }
  });

  // Sort personas within each category by last name
  Object.keys(categorized).forEach(category => {
    categorized[category].sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));
  });

  uncategorized.sort((a, b) => getLastName(a.name).localeCompare(getLastName(b.name)));

  return { categorized, uncategorized };
};

/*
SpecialistsGrid
Props:
  personas: array of persona objects {id,name,specialty,image,bio...}
  onPersonaClick: function to handle persona card clicks (for showing bio)
*/
export default function SpecialistsGrid({ personas = [], onPersonaClick }) {
  const { t, i18n } = useTranslation('chat');
  const { myAdvisers, addAdviserToUserTeam, removeAdviserFromUserTeam } = useMyAdvisers();
  const selectedSet = new Set(myAdvisers.map(a => a.id));
  const canAddMore = myAdvisers.length < 5;

  // State for translated personas and caching
  const [translatedPersonas, setTranslatedPersonas] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  
  // State for search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Clear cache when language changes to force fresh translation
  useEffect(() => {
    console.log(`[SpecialistsGrid] Language changed to: ${i18n.language}, clearing cache`);
    setTranslationCache({});
    translationService.clearCache(); // Clear global translation service cache too
  }, [i18n.language]);

  // Create cache key for personas data
  const createCacheKey = (personasData, language) => {
    if (!personasData || personasData.length === 0) return null;
    // Create a simple hash based on persona IDs and language
    const personaIds = personasData.map(p => p.id).sort().join(',');
    return `personas_${personaIds}_${language}`;
  };

  // Translation effect - runs when personas or language changes
  useEffect(() => {
    const translatePersonasData = async () => {
      console.log(`[SpecialistsGrid] Translation effect triggered - personas:`, personas?.length, 'language:', i18n.language);
      
      if (!personas || personas.length === 0) {
        console.log(`[SpecialistsGrid] No personas, setting empty array`);
        setTranslatedPersonas([]);
        return;
      }

      const cacheKey = createCacheKey(personas, i18n.language);
      console.log(`[SpecialistsGrid] Cache key:`, cacheKey);

      // Check if we have cached data for this language
      if (cacheKey && translationCache[cacheKey]) {
        console.log(`[SpecialistsGrid] Using cached translation for ${i18n.language}`);
        setTranslatedPersonas(translationCache[cacheKey]);
        return;
      }

      // If language is English, cache the original data and use it
      if (i18n.language === 'en') {
        console.log(`[SpecialistsGrid] Language is English, using original personas`);
        const cacheKeyEn = createCacheKey(personas, 'en');
        if (cacheKeyEn) {
          setTranslationCache(prev => ({
            ...prev,
            [cacheKeyEn]: personas
          }));
        }
        setTranslatedPersonas(personas);
        return;
      }

      console.log(`[SpecialistsGrid] Starting translation for ${personas.length} personas to ${i18n.language}`);
      setIsTranslating(true);

      try {
        // Prepare texts for batch translation
        const textsToTranslate = [];
        personas.forEach((persona, index) => {
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

        // Use existing batch translation service with current language
        const translations = await translationService.batchTranslate(
          textsToTranslate.map(item => item.text),
          i18n.language
        );

        console.log(`[SpecialistsGrid] Translation results:`, translations);

        // Apply translations back to personas
        const translatedPersonasData = personas.map((persona, index) => ({ ...persona }));

        translations.forEach((translation, translationIndex) => {
          const textItem = textsToTranslate[translationIndex];
          const personaIndex = textItem.index;

          console.log(`[SpecialistsGrid] Processing translation ${translationIndex}:`, {
            original: textItem.text,
            translated: translation.translatedText,
            success: translation.success,
            type: textItem.type,
            personaIndex: personaIndex
          });

          if (translation.success) {
            if (textItem.type === 'name') {
              // Reconstruct name with AI prefix if it had one
              const newName = textItem.hasAIPrefix 
                ? `AI ${translation.translatedText}`
                : translation.translatedText;
              console.log(`[SpecialistsGrid] Updating name for persona ${personaIndex}: ${translatedPersonasData[personaIndex].name} -> ${newName}`);
              translatedPersonasData[personaIndex].name = newName;
            } else if (textItem.type === 'specialty') {
              console.log(`[SpecialistsGrid] Updating specialty for persona ${personaIndex}: ${translatedPersonasData[personaIndex].specialty} -> ${translation.translatedText}`);
              translatedPersonasData[personaIndex].specialty = translation.translatedText;
            }
          } else {
            console.warn(`[SpecialistsGrid] Translation failed for:`, textItem.text, translation.error);
          }
          // If translation failed, keep original text (no action needed)
        });

        // Cache the translated data
        if (cacheKey) {
          setTranslationCache(prev => ({
            ...prev,
            [cacheKey]: translatedPersonasData
          }));
          console.log(`[SpecialistsGrid] Cached translation for ${i18n.language}`);
        }

        setTranslatedPersonas(translatedPersonasData);
      } catch (error) {
        console.error('Error translating personas:', error);
        // Fallback to original personas if translation fails
        setTranslatedPersonas(personas);
      } finally {
        setIsTranslating(false);
      }
    };

    translatePersonasData();
  }, [personas, i18n.language, translationCache]);

  // Use translated personas for display
  const displayPersonas = isTranslating ? personas : translatedPersonas;

  // Find Health Expert Carol in translated personas
  const aileenCarol = displayPersonas.find(p => p.id?.toLowerCase() === 'ai_persona_aileen_carol');
  
  // Create the selected personas list (My Team) - include Health Expert Carol if found
  const selectedPersonas = [];
  if (aileenCarol) {
    selectedPersonas.push(aileenCarol);
  }
  // Add other selected advisers from translated data
  myAdvisers.forEach(adviser => {
    if (adviser.id?.toLowerCase() !== 'ai_persona_aileen_carol') {
      const translatedAdviser = displayPersonas.find(p => p.id === adviser.id);
      if (translatedAdviser) {
        selectedPersonas.push(translatedAdviser);
      } else {
        selectedPersonas.push(adviser); // Fallback to original if not found
      }
    }
  });

  // Sort selected personas: Health Expert Carol first, then others by last name
  const sortedSelectedPersonas = [...selectedPersonas].sort((a, b) => {
    const aIsAileenCarol = a.id?.toLowerCase() === 'ai_persona_aileen_carol';
    const bIsAileenCarol = b.id?.toLowerCase() === 'ai_persona_aileen_carol';
    
    // Health Expert Carol always comes first
    if (aIsAileenCarol && !bIsAileenCarol) return -1;
    if (!aIsAileenCarol && bIsAileenCarol) return 1;
    if (aIsAileenCarol && bIsAileenCarol) return 0; // Both are Health Expert Carol (shouldn't happen)
    
    // For non-Health Expert Carol personas, sort by last name
    return getLastName(a.name).localeCompare(getLastName(b.name));
  });

  // Don't filter out selected personas - show them in all categories with "Selected" badge
  const { categorized, uncategorized } = categorizePersonas(displayPersonas.filter(p => p.id?.toLowerCase() !== 'ai_persona_aileen_carol'));

  const handleAddPersona = async (personaId) => {
    if (!canAddMore) return;
    try {
      await addAdviserToUserTeam(personaId);
    } catch (e) {
      console.error('Add adviser failed:', e);
    }
  };

  const handleRemovePersona = async (personaId) => {
    // Don't allow removing Health Expert Carol
    if (personaId?.toLowerCase() === 'ai_persona_aileen_carol') return;
    try {
      await removeAdviserFromUserTeam(personaId);
    } catch (e) {
      console.error('Remove adviser failed:', e);
    }
  };

  const handlePersonaSearchSelect = async (persona) => {
    // Add the selected persona to the team if possible
    if (canAddMore && !selectedSet.has(persona.id)) {
      await handleAddPersona(persona.id);
    }
  };

  const renderPersonaCard = (doc, isInMyTeam = false) => {
          let imagePath = null;
          if (typeof doc.image === 'string') {
            if (doc.image.trim().startsWith('{')) {
              try {
                const imgObj = JSON.parse(doc.image);
                imagePath = imgObj.light || imgObj.path || null;
              } catch (_) {
                imagePath = null;
              }
            } else {
              imagePath = doc.image;
            }
          } else if (doc.image && typeof doc.image === 'object') {
            imagePath = doc.image.light || doc.image.path || doc.image.src || null;
          }

          const imgUrl = constructFullImageUrl(imagePath);
    const isAileenCarol = doc.id?.toLowerCase() === 'ai_persona_aileen_carol';
    const isSelected = selectedSet.has(doc.id);

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <Card
            onClick={() => onPersonaClick && onPersonaClick(doc.id)}
                  sx={{
                    height: '100%',
                    position: 'relative',
              cursor: onPersonaClick ? 'pointer' : 'default',
              border: isInMyTeam || isSelected ? '2px solid' : '1px solid',
              borderColor: isInMyTeam || isSelected ? 'primary.main' : 'divider',
              backgroundColor: theme => theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                  }}
                >
            {/* Show badges for team members in My Team section */}
            {isInMyTeam && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                {isAileenCarol ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                    label={t('team.teamLead')}
                    color="primary"
                    size="small"
                  />
                ) : (
                  <Tooltip title={t('team.removeFromTeam')} arrow>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePersona(doc.id);
                    }}
                    sx={{
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
            {/* Show badges for personas in category sections */}
            {!isInMyTeam && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
                {isSelected ? (
                  <Chip
                    label={t('team.selected')}
                    color="primary"
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                ) : canAddMore ? (
                  <Tooltip title={t('team.addToTeam')} arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPersona(doc.id);
                      }}
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.8)',
                        },
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Chip
                    label={t('team.teamFullBadge')}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
            )}
                  {imgUrl ? (
                    <Box 
                      sx={{
                        height: 140,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme => theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
                        pt: '5%',
                        pb: '5%',
                      }}
                    >
                      <Box
                        component="img"
                        src={imgUrl}
                        alt={doc.name}
                        sx={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar sx={{ width: 80, height: 80 }}>
                        {doc.name ? doc.name.charAt(0) : '?'}
                      </Avatar>
                    </Box>
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" component="div" noWrap>
                      {doc.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {doc.specialty}
                    </Typography>
                  </CardContent>
                </Card>
            </Grid>
          );
  };

  const renderCategorySection = (categoryName, personas) => {
    if (personas.length === 0) return null;

    // Check if it's a category that needs translation
    const translationKey = CATEGORY_TRANSLATION_KEYS[categoryName];
    const displayName = translationKey ? t(translationKey) : categoryName;

    return (
      <Box key={categoryName} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
          {displayName} ({t('team.specialistsCount', { count: personas.length })})
        </Typography>
        <Grid container spacing={2}>
          {personas.map((doc) => renderPersonaCard(doc, false))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, overflowY: 'auto', height: '100%' }}>
      {/* My Team Section */}
      {sortedSelectedPersonas.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
            {t('team.myVirtualMDTeam')}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {sortedSelectedPersonas.map((doc) => renderPersonaCard(doc, true))}
      </Grid>
          <Divider sx={{ my: 4 }} />
        </>
      )}

      {/* Available Specialists Section */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        {t('team.availableSpecialists')}
      </Typography>
      
      {/* Search Bar */}
      <PersonaSearchBar 
        onPersonaSelect={handlePersonaSearchSelect}
        selectedPersonaIds={Object.fromEntries(Array.from(selectedSet).map(id => [id, true]))}
        sx={{ mb: 3, maxWidth: '600px' }}
      />
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {canAddMore 
          ? t('team.clickToAddInstruction', { current: myAdvisers.length, max: 5 })
          : t('team.teamFullInstruction')
        }
      </Typography>

      {/* Categorized Specialists - Organized Alphabetically */}
      {Object.entries(categorized)
        .sort(([a], [b]) => a.localeCompare(b)) // Sort categories alphabetically
        .map(([categoryName, personas]) => 
          renderCategorySection(categoryName, personas)
        )}

      {/* Uncategorized Specialists */}
      {uncategorized.length > 0 && renderCategorySection(t('team.otherSpecialists'), uncategorized)}

      {/* Empty state */}
      {Object.values(categorized).every(arr => arr.length === 0) && uncategorized.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {t('team.allSpecialistsAdded')}
          </Typography>
        </Box>
      )}
    </Box>
  );
} 