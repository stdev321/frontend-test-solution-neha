// Landing Pages Configuration Index
// Centralized export for all landing page configurations

import { defaultGuestConfig } from './defaultGuestConfig.js';
import { bpoWorkersConfig } from './bpoWorkersConfig.js';
import { parentsProvincesConfig } from './parentsProvincesConfig.js';
import { ofwsManilaConfig } from './ofwsManilaConfig.js';
import { elderlyConfig } from './elderlyConfig.js';
import { genZStudentsConfig } from './genZStudentsConfig.js';

// Configuration mapping for easy access by route ID
export const landingPageConfigs = {
  'default-guest': defaultGuestConfig,
  'bpo-workers': bpoWorkersConfig,
  'parents-provinces': parentsProvincesConfig,
  'ofws-manila': ofwsManilaConfig,
  'elderly': elderlyConfig,
  'gen-z-students': genZStudentsConfig
};

// Helper function to get configuration by route ID
export const getLandingPageConfig = (routeId) => {
  return landingPageConfigs[routeId] || null;
};

// Export individual configurations for direct imports
export {
  defaultGuestConfig,
  bpoWorkersConfig,
  parentsProvincesConfig,
  ofwsManilaConfig,
  elderlyConfig,
  genZStudentsConfig
};

// Available route IDs for validation
export const availableRoutes = Object.keys(landingPageConfigs);

// Total count for reference
export const totalLandingPages = availableRoutes.length;