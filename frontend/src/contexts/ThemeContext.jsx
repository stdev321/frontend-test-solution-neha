// frontend/src/contexts/ThemeContext.jsx

/**
 * Theme Context and Provider (The Switch & Wiring)
 *
 * This file manages the application's current theme mode (light or dark) state.
 * It provides:
 * 1. The current mode ('light' | 'dark').
 * 2. A function (`toggleColorMode`) to switch between modes.
 * 3. The actual MUI Theme object (generated using the configuration from
 *    `../styles/theme.js` based on the current mode) via MUI's ThemeProvider.
 *
 * This allows components throughout the app to access the current theme mode,
 * toggle it, and automatically receive the correct theme styling.
 */

import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createCustomTheme from '../styles/theme'; // Import the theme function
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create context
const ThemeContext = createContext({
    toggleColorMode: () => {},
    mode: 'light',
});

// Custom hook
export const useThemeContext = () => useContext(ThemeContext);

// Provider component
export const ThemeContextProvider = ({ children }) => {
    const { i18n } = useTranslation();
    
    // State to hold the current mode ('light' or 'dark')
    // Initialize from localStorage or default to 'light'
    const [mode, setMode] = useState(() => {
        try {
            const storedMode = localStorage.getItem('themeMode');
            return storedMode === 'dark' ? 'dark' : 'light';
        } catch (e) {
            console.error("Could not read themeMode from localStorage", e);
            return 'light';
        }
    });

    const location = useLocation();
    
    // Check if current language is RTL
    const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);
    
    // Create emotion cache based on direction
    const emotionCache = useMemo(
        () => {
            if (isRTL) {
                return createCache({
                    key: 'muirtl',
                    stylisPlugins: [prefixer, rtlPlugin],
                });
            }
            return createCache({
                key: 'mui',
            });
        },
        [isRTL]
    );

    // Track if guest chat is active
    const [isGuestChatActive, setIsGuestChatActive] = useState(false);
    
    useEffect(() => {
        const checkGuestChat = () => {
            setIsGuestChatActive(document.body.classList.contains('guest-chat-active'));
        };
        
        // Check initially
        checkGuestChat();
        
        // Set up observer for class changes
        const observer = new MutationObserver(checkGuestChat);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        
        return () => observer.disconnect();
    }, []);

    // -----------------------------------------------------------------
    // Keep non-chat pages light, but remember the user's chat preference
    // -----------------------------------------------------------------
    useEffect(() => {
        const onChatPage = location.pathname.startsWith('/chat') || 
                           location.pathname.startsWith('/guest-chat') ||
                           location.pathname.startsWith('/dashboard') ||
                           location.pathname.startsWith('/conversation') ||
                           location.pathname.startsWith('/consultations') ||
                           location.pathname.startsWith('/team') ||
                           location.pathname.startsWith('/encyclopedia') ||
                           location.pathname.startsWith('/profile');

        if (onChatPage || isGuestChatActive) {
            // Going *into* a chat page or guest chat – restore stored preference
            try {
                const stored = localStorage.getItem('themeMode');
                if (stored === 'dark' && mode !== 'dark') setMode('dark');
                if (stored === 'light' && mode !== 'light') setMode('light');
            } catch (e) { /* ignore storage errors */ }
        } else {
            // Leaving chat – force UI to light, but DON'T touch localStorage
            if (mode === 'dark') setMode('light');
        }
    }, [location.pathname, mode, isGuestChatActive]);

    // Function to toggle the mode
    const toggleColorMode = React.useCallback(() => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            try {
                localStorage.setItem('themeMode', newMode); // Save preference
            } catch (e) {
                console.error("Could not save themeMode to localStorage", e);
            }
            return newMode;
        });
    }, []);

    // Create the theme object using the imported creator function with RTL support
    const theme = useMemo(() => {
        const baseTheme = createCustomTheme(mode);
        return {
            ...baseTheme,
            direction: isRTL ? 'rtl' : 'ltr',
        };
    }, [mode, isRTL]);

    // Value provided by the context
    const contextValue = useMemo(() => ({
        toggleColorMode,
        mode,
    }), [toggleColorMode, mode]);

    // Set document direction based on language
    useEffect(() => {
        document.dir = isRTL ? 'rtl' : 'ltr';
    }, [isRTL]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <CacheProvider value={emotionCache}>
                {/* Apply the MUI theme */}
                <MuiThemeProvider theme={theme}>
                    {/* CssBaseline kickstarts an elegant, consistent baseline */}
                    <CssBaseline />
                    {children}
                </MuiThemeProvider>
            </CacheProvider>
        </ThemeContext.Provider>
    );
};
