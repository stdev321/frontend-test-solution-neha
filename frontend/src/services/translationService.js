import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class TranslationService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/api/simple-query`,
      timeout: 30000, // 30 seconds timeout for translations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Translation API Error:', error);
        return Promise.reject(error);
      }
    );

    // Global translation cache
    this.globalCache = new Map();
    this.cacheMaxSize = 1000; // Limit cache size to prevent memory issues
  }

  /**
   * Create a cache key for translation
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language
   * @returns {string} Cache key
   */
  createCacheKey(text, targetLanguage) {
    // Create a simple hash of the text + language
    const textHash = this.simpleHash(text);
    return `${textHash}_${targetLanguage}`;
  }

  /**
   * Simple hash function for cache keys
   * @param {string} str - String to hash
   * @returns {string} Hash
   */
  simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Get cached translation
   * @param {string} text - Original text
   * @param {string} targetLanguage - Target language
   * @returns {string|null} Cached translation or null
   */
  getCachedTranslation(text, targetLanguage) {
    const key = this.createCacheKey(text, targetLanguage);
    const cached = this.globalCache.get(key);
    if (cached) {
      console.log(`[TranslationService] Cache hit for: ${text.substring(0, 50)}...`);
      return cached.translatedText;
    }
    return null;
  }

  /**
   * Cache a translation
   * @param {string} text - Original text
   * @param {string} targetLanguage - Target language
   * @param {string} translatedText - Translated text
   */
  cacheTranslation(text, targetLanguage, translatedText) {
    // Clear old cache entries if we're at the limit
    if (this.globalCache.size >= this.cacheMaxSize) {
      const firstKey = this.globalCache.keys().next().value;
      this.globalCache.delete(firstKey);
    }

    const key = this.createCacheKey(text, targetLanguage);
    this.globalCache.set(key, {
      originalText: text,
      translatedText: translatedText,
      targetLanguage: targetLanguage,
      timestamp: Date.now()
    });
    console.log(`[TranslationService] Cached translation for: ${text.substring(0, 50)}...`);
  }

  /**
   * Translate text to the specified target language
   * @param {string} text - Text to translate
   * @param {string} targetLanguage - Target language (default: 'arabic')
   * @returns {Promise<Object>} Translation response
   */
  async translateText(text, targetLanguage = 'en') {
    // Check cache first
    const cachedTranslation = this.getCachedTranslation(text, targetLanguage);
    if (cachedTranslation) {
      return {
        success: true,
        data: {
          original_text: text,
          translated_text: cachedTranslation,
          target_language: targetLanguage
        }
      };
    }

    try {
      const response = await this.apiClient.post('/translate', {
        text: text,
        target_language: targetLanguage
      });

      // Cache the result
      this.cacheTranslation(text, targetLanguage, response.data.translated_text);

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Failed to translate text:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Translation failed',
        originalText: text
      };
    }
  }

  /**
   * Translate AI response to Arabic specifically
   * @param {string} aiResponse - AI response text to translate
   * @returns {Promise<Object>} Translation response
   */
  async translateAIResponse(aiResponse) {
    return this.translateText(aiResponse, 'en');
  }

  /**
   * Translate AI response to Hebrew specifically
   * @param {string} aiResponse - AI response text to translate
   * @returns {Promise<Object>} Translation response
   */
  async translateAIResponseHebrew(aiResponse) {
    return this.translateText(aiResponse, 'hebrew');
  }

  /**
   * Check if text needs translation based on current language
   * @param {string} currentLanguage - Current i18n language code
   * @param {string} text - Text to check
   * @returns {boolean} Whether translation is needed
   */
  needsTranslation(currentLanguage, text) {
    // Only translate if current language is not English and text appears to be in English
    if (currentLanguage === 'en') {
      return false;
    }

    // Simple heuristic to detect if text is likely in English
    // This can be improved with more sophisticated language detection
    const englishPattern = /^[A-Za-z0-9\s.,;:!?'"()\-\[\]{}]+$/;
    return englishPattern.test(text.substring(0, 100)); // Check first 100 chars
  }

  /**
   * Auto-translate text if needed based on current language
   * @param {string} text - Text to potentially translate
   * @param {string} currentLanguage - Current i18n language code
   * @returns {Promise<string>} Original or translated text
   */
  async autoTranslateIfNeeded(text, currentLanguage) {
    if (!this.needsTranslation(currentLanguage, text)) {
      return text;
    }

    try {
      // Map language codes to target language names
      const targetLanguage = currentLanguage;
      const result = await this.translateText(text, targetLanguage);
      return result.success ? result.data.translated_text : text;
    } catch (error) {
      console.warn('Auto-translation failed, returning original text:', error);
      return text;
    }
  }

  /**
   * Batch translate multiple texts
   * @param {string[]} texts - Array of texts to translate
   * @param {string} targetLanguage - Target language ('arabic' or 'hebrew')
   * @returns {Promise<Object[]>} Array of translation results
   */
  async batchTranslate(texts, targetLanguage = 'en') {
    const results = [];
    const textsToTranslate = [];
    const indexMap = [];

    // Check cache for each text
    texts.forEach((text, index) => {
      const cachedTranslation = this.getCachedTranslation(text, targetLanguage);
      if (cachedTranslation) {
        results[index] = {
          index,
          originalText: text,
          success: true,
          translatedText: cachedTranslation,
          error: null
        };
      } else {
        textsToTranslate.push(text);
        indexMap.push(index);
      }
    });

    // Translate uncached texts
    if (textsToTranslate.length > 0) {
      const promises = textsToTranslate.map(text => this.translateText(text, targetLanguage));
      
      try {
        const translationResults = await Promise.allSettled(promises);
        translationResults.forEach((result, translationIndex) => {
          const originalIndex = indexMap[translationIndex];
          const originalText = textsToTranslate[translationIndex];
          
          results[originalIndex] = {
            index: originalIndex,
            originalText: originalText,
            success: result.status === 'fulfilled' && result.value.success,
            translatedText: result.status === 'fulfilled' && result.value.success 
              ? result.value.data.translated_text 
              : originalText,
            error: result.status === 'rejected' || !result.value.success 
              ? (result.reason || result.value.error) 
              : null
          };
        });
      } catch (error) {
        console.error('Batch translation failed:', error);
        // Fill in any missing results with original text
        textsToTranslate.forEach((text, translationIndex) => {
          const originalIndex = indexMap[translationIndex];
          if (!results[originalIndex]) {
            results[originalIndex] = {
              index: originalIndex,
              originalText: text,
              success: false,
              translatedText: text,
              error: 'Batch translation failed'
            };
          }
        });
      }
    }

    return results;
  }

  /**
   * Clear the translation cache
   */
  clearCache() {
    this.globalCache.clear();
    console.log('[TranslationService] Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.globalCache.size,
      maxSize: this.cacheMaxSize
    };
  }
}

// Create and export a singleton instance
const translationService = new TranslationService();
export default translationService;