/**
 * Smart branding image selection utility
 * Returns the appropriate logo size based on usage context
 */

export const LOGO_SIZES = {
  TINY: 'tiny',     // 96x96 - Mobile headers, small displays
  MEDIUM: 'medium', // 256x256 - Cards, popups
  HIGH: 'high'      // 512x512 - Desktop headers, print
};

/**
 * Get the appropriate logo image based on context and screen size
 * @param {string} logoName - Base logo name ('full_logo', 'VMD_Logo_Transparent', 'V_transparent')
 * @param {string} context - Usage context ('header', 'mobile', 'print', 'popup', 'footer')
 * @param {boolean} isMobile - Whether display is mobile
 * @returns {string} Path to the appropriately sized logo
 */
export function getBrandingImage(logoName, context, isMobile = false) {
  let size = LOGO_SIZES.MEDIUM; // Default
  
  // Context-based selection
  switch (context) {
    case 'header':
      // Desktop headers use medium, mobile headers use tiny
      size = isMobile ? LOGO_SIZES.TINY : LOGO_SIZES.MEDIUM;
      break;
      
    case 'mobile':
      // Mobile always uses tiny for performance
      size = LOGO_SIZES.TINY;
      break;
      
    case 'print':
      // Print needs high quality
      size = LOGO_SIZES.HIGH;
      break;
      
    case 'popup':
    case 'dialog':
      // Popups/dialogs use high for prominence
      size = LOGO_SIZES.HIGH;
      break;
      
    case 'footer':
      // Footers use medium
      size = LOGO_SIZES.MEDIUM;
      break;
      
    case 'welcome':
    case 'landing':
      // Landing/welcome screens use high for first impression
      size = LOGO_SIZES.HIGH;
      break;
      
    default:
      // Default to medium for unknown contexts
      size = LOGO_SIZES.MEDIUM;
  }
  
  // Build the path with size suffix
  const sizeSuffix = `_${size}`;
  return `../../assets/branding/${logoName}${sizeSuffix}.png`;
}

/**
 * Get logo based on available space
 * @param {boolean} isCompact - Whether space is limited
 * @param {string} context - Usage context
 * @param {boolean} isMobile - Whether display is mobile
 * @returns {string} Path to appropriate logo
 */
export function getAdaptiveLogo(isCompact, context, isMobile = false) {
  if (isCompact) {
    // Use V logo for compact spaces
    return getBrandingImage('V_transparent', context, isMobile);
  } else {
    // Use full logo when space allows
    return getBrandingImage('full_logo', context, isMobile);
  }
}

// Direct exports for common use cases
export const getHeaderLogo = (isMobile) => 
  getBrandingImage('full_logo', 'header', isMobile);

export const getMobileHeaderLogo = () => 
  getBrandingImage('V_transparent', 'mobile', true);

export const getPrintLogo = () => 
  getBrandingImage('full_logo', 'print', false);

export const getWelcomeLogo = () => 
  getBrandingImage('full_logo', 'welcome', false);