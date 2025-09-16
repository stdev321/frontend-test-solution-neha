/**
 * Service to handle persona data from i18n files instead of API
 * This replaces API calls with local data loading
 */

let personasCache = null;
let loadingPromise = null;

const normalizeId = (rawId) => {
  return (rawId || '')
    .toString()
    .trim()
    .toLowerCase()
    // strip zero-width and BOM characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // collapse spaces and hyphens to underscores
    .replace(/[\s-]+/g, '_');
};

const loadPersonasFromI18n = async (language = 'en') => {
  // If already loading, return the existing promise
  if (loadingPromise) {
    return loadingPromise;
  }
  
  // If cached and same language, return cached data
  if (personasCache && personasCache.language === language) {
    console.log(`[personaI18nService] Returning cached personas for ${language}`);
    return personasCache.personas;
  }
  
  loadingPromise = (async () => {
    try {
      // Try to load translations for the current language
      let personasData = null;
      const translationPath = `/i18n/locales/${language}/ai_personas_${language}.json`;
      
      try {
        console.log(`[personaI18nService] Fetching from: ${translationPath}`);
        const translationResponse = await fetch(translationPath);
        if (translationResponse.ok) {
          const translationData = await translationResponse.json();
          personasData = translationData.personas;
          console.log(`[personaI18nService] Successfully loaded personas for ${language}`);
        } else {
          console.log(`[personaI18nService] Failed to fetch: ${translationResponse.status} ${translationResponse.statusText}`);
        }
      } catch (err) {
        console.log(`[personaI18nService] No translation found for ${language}, using English`, err);
      }
      
      // Fallback to English if no translation found
      if (!personasData) {
        const enResponse = await fetch('/i18n/locales/en/ai_personas_en.json');
        const enData = await enResponse.json();
        personasData = enData.personas;
      }
      
      // Convert personas object to array format
      const personasArray = Object.entries(personasData).map(([key, persona]) => ({
        id: persona.id,
        name: persona.name,
        specialty: persona.specialty,
        public_bio: persona.bio,
        voice: persona.voice,
        image: persona.image,
        gender: persona.gender
      }));
      
      // Cache the result
      personasCache = {
        language,
        personas: personasArray
      };
      
      return personasArray;
    } finally {
      loadingPromise = null;
    }
  })();
  
  return loadingPromise;
};

/**
 * Replace api.listPersonas()
 */
export const listPersonas = async (language = 'en') => {
  try {
    const personas = await loadPersonasFromI18n(language);
    return personas;
  } catch (error) {
    console.error('Error loading personas:', error);
    throw error;
  }
};

/**
 * Replace api.getPersonaDetails()
 */
export const getPersonaDetails = async (personaId, language = 'en') => {
  try {
    console.log(`[personaI18nService] Getting details for persona: ${personaId}, language: ${language}`);
    const personas = await loadPersonasFromI18n(language);
    console.log(`[personaI18nService] Loaded ${personas.length} personas`);
    
    const requestedId = normalizeId(personaId);
    const persona = personas.find(p => normalizeId(p.id) === requestedId);
    
    if (!persona) {
      console.error(`[personaI18nService] Persona not found: ${requestedId}`);
      console.log('[personaI18nService] Available persona IDs:', personas.map(p => p.id));
      console.log('[personaI18nService] Available persona IDs (normalized):', personas.map(p => normalizeId(p.id)));
      throw new Error(`Persona not found: ${personaId}`);
    }
    
    console.log(`[personaI18nService] Found persona:`, persona);
    return persona;
  } catch (error) {
    console.error('[personaI18nService] Error getting persona details:', error);
    throw error;
  }
};

/**
 * Get multiple personas by IDs
 */
export const getPersonasByIds = async (personaIds, language = 'en') => {
  try {
    const personas = await loadPersonasFromI18n(language);
    return personas.filter(p => personaIds.includes(p.id));
  } catch (error) {
    console.error('Error getting personas by IDs:', error);
    throw error;
  }
};

/**
 * Clear the cache (useful when language changes)
 */
export const clearPersonasCache = () => {
  personasCache = null;
};

/**
 * Get available personas for guest users
 * This mimics the guest API behavior
 */
export const getGuestPersonas = async (language = 'en') => {
  try {
    const allPersonas = await loadPersonasFromI18n(language);
    
    // Filter personas typically available to guests
    // You can adjust this logic based on your requirements
    const guestPersonaIds = [
      'ai_persona_aileen_carol',
      'ai_persona_jessica_lee',
      'ai_persona_benjamin_stein',
      'ai_persona_adam_cardwell',
      'ai_persona_emily_davis'
    ];
    
    return allPersonas.filter(p => guestPersonaIds.includes(p.id));
  } catch (error) {
    console.error('Error getting guest personas:', error);
    throw error;
  }
};

export default {
  listPersonas,
  getPersonaDetails,
  getPersonasByIds,
  clearPersonasCache,
  getGuestPersonas
};