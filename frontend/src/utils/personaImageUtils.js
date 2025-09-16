/**
 * Smart persona image selection utility
 * Returns the appropriate image size based on usage context
 */

export const PERSONA_IMAGE_SIZES = {
  TINY: 'tiny',     // 96x96 - Chat message avatars
  MEDIUM: 'medium', // 256x256 - Mobile buttons, cards
  HIGH: 'high'      // 512x512 - Desktop bios, popups
};

/**
 * Get the appropriate persona image URL based on context
 * @param {string} personaId - The persona identifier (e.g., 'aileen-carol')
 * @param {string} size - One of PERSONA_IMAGE_SIZES values
 * @param {string} fallbackImage - Optional fallback image if persona image not found
 * @returns {string} The URL to the appropriately sized image
 */
export function getPersonaImageUrl(personaId, size = PERSONA_IMAGE_SIZES.TINY, fallbackImage = null) {
  if (!personaId) return fallbackImage;
  
  // Extract the base name from persona ID
  // e.g., 'ai_persona_aileen_carol' -> 'aileen-carol'
  let imageName = personaId
    .replace('ai_persona_', '')
    .replace(/_/g, '-');
  
  // Build the image path based on size
  const sizeSuffix = `_${size}`;
  const imagePath = `/persona_images/${imageName}${sizeSuffix}.png`;
  
  // Return the path (browser will handle 404 with onError fallback)
  return imagePath;
}

/**
 * Determine the best image size based on viewport and context
 * @param {string} context - The usage context ('chat', 'mobile', 'bio', 'card')
 * @param {number} displaySize - The CSS display size in pixels
 * @returns {string} The appropriate PERSONA_IMAGE_SIZES value
 */
export function determineImageSize(context, displaySize = null) {
  // Context-based selection
  switch (context) {
    case 'chat':
      // Chat avatars are always tiny
      return PERSONA_IMAGE_SIZES.TINY;
      
    case 'mobile':
      // Mobile views use medium for better quality on retina
      return PERSONA_IMAGE_SIZES.MEDIUM;
      
    case 'bio':
    case 'popup':
      // Full bio views need high quality
      return PERSONA_IMAGE_SIZES.HIGH;
      
    case 'card':
      // Cards use medium unless they're large
      return displaySize > 200 ? PERSONA_IMAGE_SIZES.HIGH : PERSONA_IMAGE_SIZES.MEDIUM;
      
    default:
      // Size-based fallback
      if (displaySize) {
        if (displaySize <= 96) return PERSONA_IMAGE_SIZES.TINY;
        if (displaySize <= 256) return PERSONA_IMAGE_SIZES.MEDIUM;
        return PERSONA_IMAGE_SIZES.HIGH;
      }
      // Default to tiny for unknown contexts
      return PERSONA_IMAGE_SIZES.TINY;
  }
}

/**
 * Preload an image to ensure it's cached before display
 * Useful for bio popups where we want instant display
 * @param {string} personaId - The persona identifier
 * @param {string} size - The image size to preload
 */
export function preloadPersonaImage(personaId, size = PERSONA_IMAGE_SIZES.HIGH) {
  const imageUrl = getPersonaImageUrl(personaId, size);
  if (imageUrl) {
    const img = new Image();
    img.src = imageUrl;
  }
}

/**
 * Get a fallback chain of image URLs (tries high, then medium, then tiny)
 * Useful for components that can adapt to available images
 * @param {string} personaId - The persona identifier
 * @returns {Array<string>} Array of URLs to try in order
 */
export function getPersonaImageFallbackChain(personaId) {
  if (!personaId) return [];
  
  return [
    getPersonaImageUrl(personaId, PERSONA_IMAGE_SIZES.HIGH),
    getPersonaImageUrl(personaId, PERSONA_IMAGE_SIZES.MEDIUM),
    getPersonaImageUrl(personaId, PERSONA_IMAGE_SIZES.TINY)
  ];
}