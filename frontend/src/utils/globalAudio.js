// Thin, central wrapper around the single TTS <audio> instance
export const GLOBAL_TTS_KEY = '__globalTtsAudio';

export const getCurrentAudio = () => window[GLOBAL_TTS_KEY] || null;

export const setCurrentAudio = (audio) => {
  window[GLOBAL_TTS_KEY] = audio || null;
};

export const clearCurrentAudio = () => {
  window[GLOBAL_TTS_KEY] = null;
};

export const pauseCurrentAudio = () => {
  const audio = getCurrentAudio();
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (err) {
      console.warn('[globalAudio] error while pausing:', err);
    } finally {
      clearCurrentAudio();
    }
  }
}; 