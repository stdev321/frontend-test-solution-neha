// TranslatedPersonaListPanel.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PersonaListPanel from './PersonaListPanel';
import { getPersonaDetails } from '../../../../services/personaI18nService';

const TranslatedPersonaListPanel = ({ personas = [], ...otherProps }) => {
  const { i18n } = useTranslation();
  const [translatedPersonas, setTranslatedPersonas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const translatePersonas = async () => {
      if (!personas.length) {
        setTranslatedPersonas([]);
        return;
      }

      setIsLoading(true);
      try {
        const translated = await Promise.all(
          personas.map(async (persona) => {
            try {
              // If the persona already has translated data (from myAdvisers), use it
              if (persona.name && persona.bio && persona.specialty) {
                // Check if it looks like it's already translated (not English)
                const currentLang = i18n.language;
                if (currentLang !== 'en') {
                  // Simple heuristic: if the bio contains non-ASCII characters, it's probably translated
                  const hasNonAscii = /[^\x00-\x7F]/.test(persona.bio);
                  if (hasNonAscii) {
                    return persona;
                  }
                }
              }
              
              // Otherwise fetch translated data
              const translatedData = await getPersonaDetails(persona.id, i18n.language);
              return translatedData;
            } catch (err) {
              console.warn(`Failed to get translated data for ${persona.id}:`, err);
              return persona; // Fallback to original data
            }
          })
        );
        setTranslatedPersonas(translated);
      } catch (err) {
        console.error('Error translating personas:', err);
        setTranslatedPersonas(personas); // Fallback to original
      } finally {
        setIsLoading(false);
      }
    };

    translatePersonas();
  }, [personas, i18n.language]);

  return <PersonaListPanel {...otherProps} personas={translatedPersonas} />;
};

export default TranslatedPersonaListPanel;