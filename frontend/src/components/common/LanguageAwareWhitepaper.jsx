// frontend/src/components/common/LanguageAwareWhitepaper.jsx
// Wrapper component that renders appropriate language version of whitepapers

import React from 'react';

const LanguageAwareWhitepaper = ({ EnglishComponent, ArabicComponent, HebrewComponent }) => {
  // Since we're migrating to i18n, always use the English component
  // which now contains the i18n logic for all languages
  return <EnglishComponent />;
};

export default LanguageAwareWhitepaper;