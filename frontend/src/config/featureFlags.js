// Feature flags for controlling visibility of certain pages and navigation items
// Set to true to show, false to hide

export const FEATURE_FLAGS = {
  // Research and Whitepapers
  showResearchPage: false, // Hide /research page
  showImagingAIWhitepaper: false, // Hide Imaging and AI whitepaper
  showPathologyAIWhitepaper: false, // Hide Pathology and AI whitepaper
  showDermatologyAIWhitepaper: false, // Hide Dermatology and AI whitepaper
  showMentalHealthAIWhitepaper: false, // Hide Mental Health and AI whitepaper
  showImagingAILaymanPage: false, // Hide AI Imaging for Lay People
  
  // Keep these visible for now
  showAIAccuracyWhitepaper: true, // Keep AI Accuracy Studies visible
  showHealthAdvisory: true, // Keep Health Advisory visible
  showDataPrivacyWhitepaper: true, // Keep Data Privacy visible
};

// Helper function to check if a route should be accessible
export const isRouteEnabled = (routePath) => {
  const routeMap = {
    '/research': FEATURE_FLAGS.showResearchPage,
    '/whitepapers/imaging-ai-assist': FEATURE_FLAGS.showImagingAIWhitepaper,
    '/whitepapers/pathology-ai-assist': FEATURE_FLAGS.showPathologyAIWhitepaper,
    '/whitepapers/dermatology-ai-assist': FEATURE_FLAGS.showDermatologyAIWhitepaper,
    '/for-mental-health': FEATURE_FLAGS.showMentalHealthAIWhitepaper,
    '/research/mental-health-ai-whitepaper': FEATURE_FLAGS.showMentalHealthAIWhitepaper,
    '/explainers/imaging-ai': FEATURE_FLAGS.showImagingAILaymanPage,
  };
  
  return routeMap[routePath] !== false; // Default to true if not in map
};