import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to load personas from i18n translation files instead of API
 * This reduces backend load and improves performance
 * 
 * Now loads directly from language-specific JSON files without needing ai_personas_db.json
 */
export const useI18nPersonas = () => {
  const { i18n } = useTranslation();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        setLoading(true);
        
        // Load the translations for the current language
        const lang = i18n.language || 'en';
        const translationPath = `/i18n/locales/${lang}/ai_personas_${lang}.json`;
        
        let personasData = null;
        try {
          const translationResponse = await fetch(translationPath);
          if (translationResponse.ok) {
            const translationData = await translationResponse.json();
            personasData = translationData.personas;
          }
        } catch (err) {
          // If translation doesn't exist for this language, fall back to English
          console.log(`No translation found for ${lang}, using English`);
        }
        
        // If no translation found, use English as fallback
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
          public_bio: persona.bio,  // Map bio to public_bio for compatibility
          voice: persona.voice,
          image: persona.image,
          gender: persona.gender
        }));
        
        setPersonas(personasArray);
        setError(null);
      } catch (err) {
        console.error('Error loading personas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPersonas();
  }, [i18n.language]);

  return {
    personas,
    loading,
    error,
    // Helper function to get a specific persona
    getPersona: (personaId) => personas.find(p => p.id === personaId),
    // Helper function to get multiple personas by IDs
    getPersonasByIds: (personaIds) => personas.filter(p => personaIds.includes(p.id))
  };
};

export default useI18nPersonas;