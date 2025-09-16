import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  listPersonas as listPersonasI18n,
  getPersonaDetails as getPersonaDetailsI18n
} from '../services/personaI18nService';
import { getPersonaTags } from '../services/api';

export const usePersonasTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const personas = await listPersonasI18n(i18n.language);
      const enriched = await Promise.all(
        personas.map(async p => {
          // Note: Tags still need to come from API
          let tags = [];
          try {
            tags = await getPersonaTags(p.id);
          } catch (err) {
            console.log(`Could not fetch tags for ${p.id}:`, err);
          }
          
          return {
            id: p.id,
            name: p.name,
            specialty: p.specialty,
            model_name: p.model_name || 'gpt-4',  // Default if not specified
            image: p.image,
            system_prompt_id: p.system_prompt_id || null,
            system_prompt: p.system_prompt || null,
            public_bio: p.public_bio || null,
            tags: tags.join(', ')
          };
        })
      );
      if (!cancelled) { setRows(enriched); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [i18n.language]);

  return { rows, setRows, loading };
};
