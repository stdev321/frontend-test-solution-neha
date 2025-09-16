// Pure helper for turning DB-stored image paths into full URLs
// NO side-effects.

export const constructImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') {
    return null;
  }

  // Get the last part of the path (the filename)
  const filename = imagePath.split('/').pop();

  // Remove .png extension if present to add size suffix
  const baseFilename = filename.replace(/\.png$/, '');

  // Always serve from the frontend public directory to keep transparency consistent
  // Default to medium size for general use
  return `/persona_images/${baseFilename}_medium.png`;
};

// Export an alias for backwards compatibility with existing code
export const constructFullImageUrl = constructImageUrl; 