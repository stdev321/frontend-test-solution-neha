import { apiRequest } from '../services/api';

/**
 * Translates a given text to the target language using the backend API.
 * @param {string} text - The text to translate.
 * @param {string} targetLanguage - The target language code (e.g., 'ar' for Arabic).
 * @returns {Promise<string>} - The translated text.
 */
export const translateText = async (text, targetLanguage) => {
  if (!text || !targetLanguage) {
    return text;
  }

  try {
    const response = await apiRequest('/api/translations/', 'POST', {
      text,
      target_language: targetLanguage,
    });
    return response.translated_text || text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text as a fallback
    return text;
  }
}; 