// This file is now empty, as the API_BASE_URL is now defined centrally
// in /frontend/src/services/api.js and sourced from .env files.

// Prefer VITE_API_URL in production; in dev return same-origin path so Vite serves from frontend/public
const resolveBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() && typeof window !== 'undefined') {
    try {
      const u = new URL(envUrl, window.location.origin);
      return u.origin; // protocol + host[:port]
    } catch {
      return envUrl;
    }
  }
  return ''; // same-origin for dev
};
const BACKEND_BASE_URL = resolveBase();

export const constructFullImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string' || imagePath.trim() === '') return null;
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }
  let filename = imagePath.trim();
  if (filename.startsWith('/persona_images/')) {
    filename = filename.substring('/persona_images/'.length);
  } else if (filename.startsWith('persona_images/')) {
    filename = filename.substring('persona_images/'.length);
  } else if (filename.startsWith('/persona_images')) {
    filename = filename.substring('/persona_images'.length);
    if (filename.startsWith('/')) filename = filename.substring(1);
  } else if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }
  if (filename.trim() === '') return null;
  // Normalize to medium by default when no explicit size suffix is present
  if (!/_((tiny)|(medium)|(high))\.png$/i.test(filename)) {
    filename = filename.replace(/\.png$/i, '') + '_medium.png';
  }
  // Always serve from frontend public path to keep transparency consistent
  return `/persona_images/${filename}`;
};

export const formatDifferentialOpinionText = (text) => {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/(Key Observations|Potential Issues|Recommended Next Steps):\s*/g, '\n\n## $1\n\n')
    .replace(/\s*•\s*/g, '\n\n- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const personalizePatientReferences = (text, profileData, currentUser) => {
  if (!text || typeof text !== 'string') return text || '';
  const userName =
    profileData?.full_name ||
    profileData?.display_name ||
    currentUser?.email ||
    'Patient';
  if (userName === 'Patient') return text;
  return text
    .replace(/\bPatient:/g, `${userName}:`)
    .replace(/\bPatient\b/g, userName)
    .replace(/\bUser:/g, `${userName}:`)
    .replace(/\bUser\b/g, userName);
}; 