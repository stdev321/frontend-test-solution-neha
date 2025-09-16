// src/contexts/HeaderVisibilityContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the possible header visibility modes
export const HEADER_MODES = {
  VISIBLE: 'VISIBLE',
  HIDDEN: 'HIDDEN',
  AUTO_HIDE: 'AUTO_HIDE',
};

// Create the context
const HeaderVisibilityContext = createContext({
  headerMode: HEADER_MODES.VISIBLE, // Default mode
  setHeaderMode: () => {},
});

// Custom hook for easy consumption
export const useHeaderVisibility = () => useContext(HeaderVisibilityContext);

// Provider component
export const HeaderVisibilityProvider = ({ children }) => {
  const [headerMode, setHeaderModeState] = useState(() => {
    // Initialize state from localStorage or default to VISIBLE
    const storedMode = localStorage.getItem('headerMode');
    return storedMode && HEADER_MODES[storedMode] ? storedMode : HEADER_MODES.VISIBLE;
  });

  // Effect to update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('headerMode', headerMode);
  }, [headerMode]);

  // Function to update state and localStorage
  const setHeaderMode = (mode) => {
    if (HEADER_MODES[mode]) {
      setHeaderModeState(mode);
    } else {
      console.warn("Invalid header mode attempted:", mode);
    }
  };

  const value = {
    headerMode,
    setHeaderMode,
  };

  return (
    <HeaderVisibilityContext.Provider value={value}>
      {children}
    </HeaderVisibilityContext.Provider>
  );
}; 