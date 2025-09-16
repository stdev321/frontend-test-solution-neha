import detectUrlChange from 'detect-url-change';
detectUrlChange.on('change', (newUrl) => {
  window.scrollTo({
    top: 0,
    behavior: 'instant',
  })
});

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './utils/muiPatch.js'; // Fix for MUI/Emotion in Vite dev mode
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import createCustomTheme from './styles/theme'; // Import our custom theme creation function
import './i18n/index.js'; // Initialize i18n
import { HelmetProvider } from 'react-helmet-async';
// Removed the default index.css import, ensure you saved an empty index.css
// or create src/styles/global.css and import that if needed.

// RACE CONDITION TESTING: Load test utilities in development
if (import.meta.env.DEV) {
  import('./tests/race-condition-test.js');
  import('./utils/quickTest.js');
}

// Add forced logout wrapper
function AppWithServerRestartCheck() {
  const [isLoading, setIsLoading] = useState(true);
  
  // ⬇ ⬇  COMMENT-OUT EVERYTHING INSIDE AppWithServerRestartCheck.useEffect
  /*
  useEffect(() => {
    // Force logout check on EVERY page load
    const checkServerRestart = async () => {
      try {
        console.log("🔍 Checking for server restart...");
        const response = await fetch('/api/server_info');
        const data = await response.json();
        
        console.log("📊 Server info:", data);
        
        // Always force logout if flag is set
        if (data.force_logout) {
          console.log("⚠️ Force logout flag set!");
          // Clear EVERYTHING
          localStorage.clear();
          sessionStorage.clear();
          
          // If Firebase is available, sign out
          if (window.firebase && window.firebase.auth) {
            try {
              await window.firebase.auth().signOut();
              console.log("✅ Firebase logout successful");
            } catch (err) {
              console.error("❌ Firebase logout failed", err);
            }
          }
          
          // Set a flag to show notification on login page
          sessionStorage.setItem('server_restarted', 'true');
          
          // Give time for browser to process cleared storage
          setTimeout(() => {
            window.location.href = '/login?restart=true';
          }, 100);
          return;
        }
        
        // Otherwise, check generation ID
        const storedId = localStorage.getItem('server_generation_id');
        if (storedId && storedId !== data.generation_id) {
          console.log("⚠️ Server restart detected! Old:", storedId, "New:", data.generation_id);
          localStorage.clear();
          sessionStorage.clear();
          
          // If Firebase is available, sign out
          if (window.firebase && window.firebase.auth) {
            try {
              await window.firebase.auth().signOut();
              console.log("✅ Firebase logout successful");
            } catch (err) {
              console.error("❌ Firebase logout failed", err);
            }
          }
          
          localStorage.setItem('server_generation_id', data.generation_id);
          
          // Redirect to login
          window.location.href = '/login?restart=true';
          return;
        }
        
        // Store server ID for next check
        localStorage.setItem('server_generation_id', data.generation_id);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Server restart check failed:", err);
        setIsLoading(false);
      }
    };
    
    checkServerRestart();
  }, []);
  */
  
  if (isLoading) {
    return <div>Checking server status...</div>;
  }
  
  return <App />;
}

const defaultTheme = createCustomTheme('light'); // Create a default theme object (e.g., light mode)

// Avoid ReferenceError in dev if __BUILD_TIME__ was not injected at build time
const __SAFE_BUILD_TIME__ = (typeof __BUILD_TIME__ !== 'undefined') ? __BUILD_TIME__ : 'development';
console.log('Build timestamp:', __SAFE_BUILD_TIME__);

// Blog configuration removed - now served at blog.virtualmd.app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
