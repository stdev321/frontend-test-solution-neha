/**
 * Name transliteration utilities
 * Transliterates user names to different scripts when provided in profile
 */

const nameTransliterations = {
  // Hebrew transliterations
  he: {
    'Ron': 'רון',
    'Rubin': 'רובין',
    'David': 'דוד',
    'Sarah': 'שרה',
    'Michael': 'מיכאל',
    'Rachel': 'רחל',
    'Daniel': 'דניאל',
    'Rebecca': 'רבקה',
    'Joshua': 'יהושע',
    'Miriam': 'מרים',
    // Add more common names here
  },
  // Arabic transliterations
  ar: {
    'Ron': 'رون',
    'Rubin': 'روبين',
    'David': 'داود',
    'Sarah': 'سارة',
    'Michael': 'مايكل',
    'Rachel': 'راشيل',
    'Daniel': 'دانيال',
    'Rebecca': 'ربيكا',
    'Joshua': 'يوشع',
    'Miriam': 'مريم',
  },
  // Russian/Cyrillic transliterations
  ru: {
    'Ron': 'Рон',
    'Rubin': 'Рубин',
    'David': 'Давид',
    'Sarah': 'Сара',
    'Michael': 'Михаил',
    'Rachel': 'Рейчел',
    'Daniel': 'Даниэль',
    'Rebecca': 'Ребекка',
    'Joshua': 'Джошуа',
    'Miriam': 'Мириам',
  },
  // Greek transliterations
  el: {
    'Ron': 'Ρον',
    'Rubin': 'Ρούμπιν',
    'David': 'Δαβίδ',
    'Sarah': 'Σάρα',
    'Michael': 'Μιχαήλ',
    'Rachel': 'Ραχήλ',
    'Daniel': 'Δανιήλ',
    'Rebecca': 'Ρεβέκκα',
    'Joshua': 'Ιησούς',
    'Miriam': 'Μαριάμ',
  },
  // Chinese transliterations (Simplified)
  zh: {
    'Ron': '罗恩',
    'Rubin': '鲁宾',
    'David': '大卫',
    'Sarah': '莎拉',
    'Michael': '迈克尔',
    'Rachel': '蕾切尔',
    'Daniel': '丹尼尔',
    'Rebecca': '丽贝卡',
    'Joshua': '约书亚',
    'Miriam': '米利暗',
  },
  // Japanese transliterations (Katakana)
  ja: {
    'Ron': 'ロン',
    'Rubin': 'ルービン',
    'David': 'デビッド',
    'Sarah': 'サラ',
    'Michael': 'マイケル',
    'Rachel': 'レイチェル',
    'Daniel': 'ダニエル',
    'Rebecca': 'レベッカ',
    'Joshua': 'ジョシュア',
    'Miriam': 'ミリアム',
  },
  // Korean transliterations
  ko: {
    'Ron': '론',
    'Rubin': '루빈',
    'David': '데이비드',
    'Sarah': '사라',
    'Michael': '마이클',
    'Rachel': '레이첼',
    'Daniel': '다니엘',
    'Rebecca': '레베카',
    'Joshua': '조슈아',
    'Miriam': '미리암',
  },
  // Punjabi transliterations (Gurmukhi)
  pa: {
    'Ron': 'ਰੋਨ',
    'Rubin': 'ਰੂਬਿਨ',
    'David': 'ਡੇਵਿਡ',
    'Sarah': 'ਸਾਰਾ',
    'Michael': 'ਮਾਈਕਲ',
    'Rachel': 'ਰੇਚਲ',
    'Daniel': 'ਡੈਨੀਅਲ',
    'Rebecca': 'ਰੇਬੇਕਾ',
    'Joshua': 'ਜੋਸ਼ੂਆ',
    'Miriam': 'ਮਿਰੀਅਮ',
    'Guest': 'ਮਹਿਮਾਨ',
    'User': 'ਉਪਭੋਗਤਾ',
  },
  // Hindi transliterations (Devanagari)
  hi: {
    'Ron': 'रॉन',
    'Rubin': 'रुबिन',
    'David': 'डेविड',
    'Sarah': 'सारा',
    'Michael': 'माइकल',
    'Rachel': 'राहेल',
    'Daniel': 'डेनियल',
    'Rebecca': 'रेबेका',
    'Joshua': 'जोशुआ',
    'Miriam': 'मिरियम',
  },
  am: {
    'Ron': 'ሮን',
    'Rubin': 'ሩቢን',
  },
};

/**
 * Transliterate a name to the target language script
 * @param {string} name - The name to transliterate
 * @param {string} targetLang - The target language code
 * @param {object} profileData - User profile data containing first_name and last_name
 * @returns {string} - Transliterated name or original if not available
 */
export function transliterateName(name, targetLang, profileData = null) {
  // Languages that use Latin script don't need transliteration
  const latinScriptLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'id', 'ms', 'fil', 'sw', 'yo', 'zu', 'xh', 'mi'];
  if (latinScriptLangs.includes(targetLang)) {
    return name;
  }
  
  // Get transliterations for this language
  const langTransliterations = nameTransliterations[targetLang];
  if (!langTransliterations) {
    // No transliterations available for this language
    return name;
  }
  
  // Split the name into parts and try to transliterate each
  const nameParts = name.split(' ');
  const transliteratedParts = nameParts.map(part => {
    // Try exact match first
    if (langTransliterations[part]) {
      return langTransliterations[part];
    }
    // Try case-insensitive match
    const lowerPart = part.toLowerCase();
    const matchingKey = Object.keys(langTransliterations).find(key => key.toLowerCase() === lowerPart);
    if (matchingKey) {
      return langTransliterations[matchingKey];
    }
    // Return original if no match
    return part;
  });
  
  return transliteratedParts.join(' ');
}

/**
 * Get display name for user based on language and profile
 * @param {object} user - User object with username
 * @param {object} profileData - User profile data
 * @param {string} language - Current language code
 * @returns {string} - Display name
 */
export function getUserDisplayName(user, profileData, language) {
  if (!user) return '';
  
  // First priority: Use full name from profile if available
  if (profileData) {
    const fullName = profileData.full_name || 
                    (profileData.first_name || profileData.last_name ? 
                     `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
                     null);
    
    if (fullName) {
      // For languages with different scripts, try transliteration
      const needsTransliteration = !['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'id', 'ms', 'fil', 'sw', 'yo', 'zu', 'xh', 'mi'].includes(language);
      
      if (needsTransliteration) {
        return transliterateName(fullName, language, profileData);
      }
      
      return fullName;
    }
  }
  
  // Fallback to username or email
  return user.username || user.email?.split('@')[0] || 'User';
}