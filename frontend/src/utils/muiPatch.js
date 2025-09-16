// MUI/Emotion patch for Vite development mode
// This fixes the "Cannot read properties of undefined (reading 'push')" error

if (import.meta.env.DEV) {
  // Patch for emotion's stylis plugin system
  window.__EMOTION_DEVTOOLS__ = false;
  
  // Ensure global emotion cache is initialized
  if (!window.__EMOTION_CACHE__) {
    window.__EMOTION_CACHE__ = {};
  }
}

export default {};