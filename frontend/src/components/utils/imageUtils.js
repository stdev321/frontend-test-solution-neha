/**
 * Constructs the full image URL for persona images
 * @param {string} imagePath - The image path from the persona data
 * @returns {string|null} The full image URL or null if no image
 */
export const constructFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/')) return imagePath;
  return `/persona_images/${imagePath}`;
}; 