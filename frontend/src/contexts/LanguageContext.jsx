import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    // Hebrew, Arabic, and Persian are RTL languages
    const rtlLanguages = ['ar', 'he', 'fa'];
    const currentDirection = rtlLanguages.includes(i18n.language) ? 'rtl' : 'ltr';
    setDirection(currentDirection);
    
    // Set document direction
    document.documentElement.dir = currentDirection;
    document.documentElement.lang = i18n.language;
    
    // Add RTL class to body for styling
    if (currentDirection === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [i18n.language]);

  const contextValue = {
    direction,
    isRtl: direction === 'rtl',
    changeLanguage: (lang) => i18n.changeLanguage(lang),
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;