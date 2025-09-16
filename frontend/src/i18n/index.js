// frontend/src/i18n/index.js

import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Determine initial language synchronously: last-used → browser → English
let initialLng = 'en';
try {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && typeof stored === 'string') {
      initialLng = stored.split('-')[0];
    } else if (typeof navigator !== 'undefined' && navigator.language) {
      initialLng = navigator.language.split('-')[0];
    }
  } else if (typeof navigator !== 'undefined' && navigator.language) {
    initialLng = navigator.language.split('-')[0];
  }
} catch (_) {}

i18n
  // 1) dynamically load translation JSON from public/i18n/locales
  .use(Backend)
  // 2) detect user language via localStorage/cookie/htmlTag/etc.
  .use(LanguageDetector)
  // 3) connect with React
  .use(initReactI18next)
  .init({
    // fallback language
    fallbackLng: 'en',
    // Bootstrap in the best single language we can decide synchronously
    lng: initialLng,
    // Load only the current language (no region variants / no preload of others)
    load: 'currentOnly',
    // default namespace
    defaultNS: 'common',
    // all your namespaces
    ns: [
      'common',
      'pages',
      'chat',
      'header',
      'aiAccuracyWhitepaper',
      'legal',
      'landingPages'
    ],
    backend: {
      loadPath: function(lngs, namespaces) {
        // For aiAccuracyWhitepaper and legal, use the _{{lng}} suffix
        if (namespaces[0] === 'aiAccuracyWhitepaper' || namespaces[0] === 'legal') {
          return '/i18n/locales/{{lng}}/{{ns}}_{{lng}}.json';
        }
        // For all other namespaces, use the standard format
        return '/i18n/locales/{{lng}}/{{ns}}.json';
      }
    },
    detection: {
      // Priority: last used (localStorage/cookie) → browser locale → html tag
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie']
    },
    interpolation: {
      // React already escapes by default
      escapeValue: false
    },
    react: {
      // we’ll show our own loading state
      useSuspense: false
    }
  });

export default i18n;

// After bootstrap, if there is no stored preference, try a lightweight geo lookup
// to approximate user's physical location and map to a supported language.
// This runs asynchronously and will not delay first paint.
try {
  const hasStoredPref = (typeof window !== 'undefined') && (
    (typeof localStorage !== 'undefined' && localStorage.getItem('i18nextLng')) ||
    (typeof document !== 'undefined' && /i18next=/.test(document.cookie || ''))
  );
  if (!hasStoredPref) {
    setTimeout(async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const cc = (data && (data.country_code || data.country)) || '';
        // Map country → language codes your app supports
        const countryToLang = {
          US: 'en', GB: 'en', CA: 'en', AU: 'en',
          IL: 'he', AE: 'ar', SA: 'ar', EG: 'ar', JO: 'ar', MA: 'ar',
          FR: 'fr', ES: 'es', PT: 'pt', BR: 'pt', DE: 'de', NL: 'nl', IT: 'it',
          RU: 'ru', UA: 'uk', TR: 'tr', GR: 'el', ID: 'id', FA: 'fa', IR: 'fa',
          ZH: 'zh', CN: 'zh', TW: 'zh', JP: 'ja', KR: 'ko',
          ET: 'am', TH: 'th', TA: 'ta', SW: 'sw', XH: 'xh', ZU: 'zu', YO: 'yo', MI: 'mi'
        };
        const target = countryToLang[cc];
        if (target && target !== i18n.language) {
          i18n.changeLanguage(target);
        }
      } catch (_) { /* ignore network failures */ }
    }, 0);
  }
} catch (_) {
  // ignore
}
