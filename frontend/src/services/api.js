// File: frontend/src/services/api.js

// This file contains the API service for the frontend.
// It is used to make authenticated API requests to the backend. 
// Note: POST /api/firebase/sync is used directly via the 'post' helper in AuthContext.jsx - OK
// Note: WebSocket connection uses ws://.../api/conversation/ws/{id} - OK (matches GET endpoint structure)

import { getCurrentUserToken } from './auth'; // Legacy import - will be replaced
import { tokenManager } from './TokenManager'; // New token management
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import i18n from '../i18n';

// Resolve base URL: prefer VITE_API_URL (e.g., prod), else same-origin ('') for dev proxy
const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) return envUrl;
  if (typeof window !== 'undefined') return '';
  return 'http://localhost:8000';
};
const API_BASE_URL = resolveBaseUrl();

// Export API_BASE_URL for use in other components
export { API_BASE_URL };

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the Firebase auth token and language to every request
api.interceptors.request.use(async (config) => {
  try {
    const token = await getCurrentUserToken();
    if (token) {
      // console.log("Authorization Token Length:", token.length);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Auth token unavailable, proceeding without Authorization header');
  }
  // Add current language header
  config.headers['Accept-Language'] = i18n.language || 'en';
  return config;
});

/**
 * Central function for authenticated API requests. Handles JSON by default,
 * but skips Content-Type for FormData.
 */
export const apiRequest = async (endpoint, options = {}) => {
  try {
    console.log(`API Request: ${options.method || 'GET'} ${endpoint}`);
    
    // Prepare axios config - use the endpoint as the url since we have baseURL set
    const axiosConfig = {
      url: endpoint, // This will be appended to the baseURL
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Handle FormData - remove Content-Type to let axios set it with boundary
    if (options.body instanceof FormData) {
      delete axiosConfig.headers['Content-Type'];
      axiosConfig.data = options.body;
    } else if (options.body) {
      axiosConfig.data = options.body;
    }

    const response = await api.request(axiosConfig);

    // Axios automatically parses JSON and puts it in response.data
    // For 204 No Content, return null
    if (response.status === 204) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`API Request Error (${options.method || 'GET'} ${endpoint}):`, error);
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error or API server unreachable.');
    }
    
    // Axios errors have response.data.detail for API errors
    if (error.response && error.response.data && error.response.data.detail) {
      throw new Error(error.response.data.detail);
    }
    
    throw error;
  }
};

/**
 * Makes an authenticated GET request.
 * @param {string} endpoint
 * @param {object} [options] - Optional fetch options
 * @returns {Promise<any>}
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * Makes an authenticated POST request with JSON body.
 * @param {string} endpoint
 * @param {object} body - The request body data.
 * @param {object} [options] - Optional fetch options
 * @returns {Promise<any>}
 */
export const post = (endpoint, body, options = {}) => {
  return apiRequest(endpoint, {
    ...options,
    method: 'POST',
    body: body, // Let axios handle JSON serialization
  });
};

/**
 * Makes an authenticated PUT request with JSON body.
 * @param {string} endpoint
 * @param {object} body - The request body data.
 * @param {object} [options] - Optional fetch options
 * @returns {Promise<any>}
 */
export const put = (endpoint, body, options = {}) => {
   return apiRequest(endpoint, {
    ...options,
    method: 'PUT',
    body: body, // Let axios handle JSON serialization
  });
};

/**
 * Makes an authenticated DELETE request.
 * @param {string} endpoint
 * @param {object} [options] - Optional fetch options
 * @returns {Promise<any>} Typically null or { success: true } on 204 No Content.
 */
export const del = (endpoint, options = {}) => {
   return apiRequest(endpoint, { ...options, method: 'DELETE' });
};

/**
 * Fetches the list of conversations for the authenticated user.
 * @returns {Promise<Array>} A promise that resolves to an array of conversation objects.
 */
export const listConversations = () => {
  // Uses GET /api/conversation/list - Confirmed OK from docs
  return get('/api/conversation/list');
};

/**
 * Fetches details for a specific conversation by ID.
 * @param {string} conversationId - The ID of the conversation to fetch.
 * @returns {Promise<object>} A promise that resolves to the conversation object with messages.
 */
export const getConversation = (conversationId) => {
  return get(`/api/conversation/${conversationId}`);
};

/**
 * Creates a new conversation.
 * @param {object} payload - Optional payload (e.g., { title: "New Chat" }). Check API docs for required/optional fields.
 * @returns {Promise<object>} A promise that resolves to the new conversation object (likely containing an 'id').
 */
export const createConversation = async (payload = {}) => {
  try {
    // Uses POST /api/conversation - Confirmed OK from docs
    const response = await post('/api/conversation', payload);
    return response;
  } finally {
    // Force session closure regardless of success/failure
    // This is a placeholder and should be replaced with actual session closure logic
    console.log('Session closure logic not implemented');
  }
};

/**
 * Uploads a file using FormData.
 * @param {File} file - The file object to upload.
 * @returns {Promise<object>} A promise that resolves to the file upload response (e.g., { id, filename, ... }).
 */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file); // The backend expects the file under the key 'file'

  // Use apiRequest directly, passing the FormData object as the body
  // The 'Content-Type' header will be automatically omitted by apiRequest
  return apiRequest('/api/files/upload', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Updates the title of a conversation.
 * @param {string} id - The ID of the conversation.
 * @param {string} title - The new title for the conversation.
 * @returns {Promise<any>} A promise that resolves to the updated conversation object.
 */
export const updateConversationTitle = (id, title) => {
  return put(`/api/conversation/${id}/title`, { title });
};

/**
 * Deletes a conversation.
 * @param {string} conversationId - The ID of the conversation to delete.
 * @returns {Promise<object>} A promise resolving to success message or error.
 */
export const deleteConversationAPI = (conversationId) => {
  // Uses DELETE /api/conversation/{id} - Confirmed OK from docs
  return del(`/api/conversation/${conversationId}`);
};

/**
 * Deletes a specific image/file from a conversation.
 * @param {string} conversationId
 * @param {string} fileId
 * @returns {Promise<any>}
 */
export const deleteConversationImage = (conversationId, fileId) => {
  // Uses DELETE /api/conversation/{conversation_id}/files/{file_id}
  return del(`/api/conversation/${conversationId}/files/${fileId}`);
};

/**
 * Fetches the plain text conversation summary.
 * @param {string} conversationId
 * @returns {Promise<string>} A promise that resolves to the summary text.
 */
export const getConversationSummary = (conversationId) => {
  // The 'get' helper uses apiRequest which should handle the text/plain response
  return get(`/api/conversation/summary/${conversationId}`);
};

// Async Summary Job helpers
export const createSummaryJob = (conversationId) => {
  return post(`/api/conversation/summary/async/${conversationId}`, {});
};

export const getSummaryJob = (jobId) => {
  return get(`/api/conversation/summary/async/job/${jobId}`);
};

/**
 * Fetches the plain text conversation transcript.
 * @param {string} conversationId
 * @returns {Promise<string>} A promise that resolves to the transcript text.
 */
export const getConversationTranscript = (conversationId) => {
  // The 'get' helper uses apiRequest which should handle the text/plain response
  return get(`/api/conversation/transcript/${conversationId}`);
};

/**
 * Fetches details about a specific AI persona.
 * @param {string} personaId - The ID of the persona to fetch.
 * @returns {Promise<object>} A promise that resolves to the persona details.
 */
export const getPersonaDetails = (personaId) => {
  return get(`/api/personas/${personaId}`);
};

/**
 * Fetches the list of all available AI personas.
 * This endpoint isn't documented in the API docs but appears to work based on backend logs.
 * @returns {Promise<Array>} A promise that resolves to an array of persona objects.
 */
export const listPersonas = () => {
  return get('/api/personas');
};

/**
 * Searches for AI personas based on a query string.
 * @param {string} query - The search query.
 * @param {number} limit - Maximum number of results to return.
 * @returns {Promise<Array>} A promise that resolves to an array of matching persona objects.
 */
export const searchPersonas = async (query, limit = 10) => {
  const url = `/api/personas/search?q=${encodeURIComponent(query)}&limit=${limit}`;
  console.log('Calling search API:', url);
  try {
    const result = await get(url);
    console.log('Search API response:', result);
    return result;
  } catch (error) {
    console.error('Search API error:', error);
    throw error;
  }
};

/**
 * Fetches the profile data for the currently authenticated user.
 * Uses the backend endpoint: GET /api/profile/me
 * @returns {Promise<object>} A promise resolving to the user profile object.
 */
export const getUserProfile = () => {
  // Use the corrected endpoint based on backend/api/profile/routes.py
  return get('/api/profile/me');
};

/**
 * Updates the profile data for the currently authenticated user.
 * Uses the backend endpoint: PUT /api/profile/me
 * @param {object} profileData - The profile data payload to send.
 * @returns {Promise<object>} A promise resolving to the updated user profile object.
 */
export const updateUserProfile = (profileData) => {
  // Use the corrected endpoint based on backend/api/profile/routes.py
  return put('/api/profile/me', profileData);
};

/**
 * Queries the Encyclopedia VirtualMD.
 * @param {string} userQuery The query text.
 * @returns {Promise<object>} The response object containing the answer.
 */
export const queryEncyclopedia = async (userQuery) => {
  console.log('[Encyclopedia API] Sending query:', userQuery);
  console.log('[Encyclopedia API] Request URL:', '/api/encyclopedia/query');
  console.log('[Encyclopedia API] Request body:', { user_query: userQuery });
  
  try {
    const response = await apiRequest('/api/encyclopedia/query', {
      method: 'POST',
      body: JSON.stringify({ user_query: userQuery }), // Send as { "user_query": "..." }
    });
    console.log('[Encyclopedia API] Response received:', response);
    return response;
  } catch (error) {
    console.error('[Encyclopedia API] Error:', error);
    throw error;
  }
};

export const getMyHealthAdvisers = () => {
  return get('/api/profile/my-advisers');
};

export const updateMyHealthAdvisers = (personaIds) => {
  return put('/api/profile/my-advisers', { persona_ids: personaIds });
};

/**
 * Gets AI-powered team recommendations based on user questionnaire responses.
 * @param {object} questionnaireData - The user's questionnaire responses
 * @param {Array} availablePersonas - List of available personas with name and specialty
 * @param {object} userProfile - The user's profile data (optional, for additional context)
 * @returns {Promise<object>} A promise that resolves to the team recommendation
 */
export const getAITeamRecommendation = async (questionnaireData, availablePersonas, userProfile = null) => {
  // Filter out Health Expert Carol and system personas from recommendations
  const personaList = availablePersonas
    .filter(p => 
      p.id !== 'ai_persona_aileen_carol' && 
      p.id !== 'meeting_coordinator' && 
      p.id !== 'note_taker' &&
      !p.name?.toLowerCase().includes('Health Expertaileen carol') &&
      !p.name?.toLowerCase().includes('aileen carol')
    )
    .map(p => `${p.name} - ${p.specialty || 'General Health'}`)
    .join('\n');

  // Extract custom specialist requests and existing team info
  const customSpecialistRequests = questionnaireData['Specific AI Health Specialists requested?'] || '';
  const alternativeMedicinePrefs = questionnaireData['Would you like alternative medicine specialists?'] || '';
  const keepExistingTeam = questionnaireData['Keep existing team members?'] === 'Yes';
  const existingTeamMembers = questionnaireData['Existing team members'] || '';
  const currentTeamSize = parseInt(questionnaireData['Current team size']) || 0;
  const availableSpots = parseInt(questionnaireData['Available spots for new specialists']) || 4;
  const maxRecommendations = parseInt(questionnaireData['Maximum recommendations allowed']) || 4;

  // Build user profile context
  let userProfileContext = '';
  if (userProfile && userProfile.health_conditions) {
    userProfileContext = `\nUSER PROFILE HEALTH CONDITIONS (even if not mentioned in questionnaire): ${userProfile.health_conditions}`;
  }

  // Add cache-busting timestamp
  const timestamp = new Date().toISOString();

  const prompt = `You are Health Expert Aileen Carol, a caring primary care physician and team coordinator. A patient has filled out a questionnaire and you need to recommend the perfect health team for them.

⚠️ CRITICAL INSTRUCTIONS:
1. NEVER include "Health Expert Aileen Carol", "AI Health Expert Aileen Carol", or any variation in your recommendations - I am already the team coordinator
2. Only recommend specialists from the available list below
3. Generate fresh recommendations each time - timestamp: ${timestamp}

⚠️ EXISTING TEAM INFORMATION:
- Current team size: ${currentTeamSize} specialists (excluding Health Expert Carol)
- Existing team members: ${existingTeamMembers}
- Available spots for new recommendations: ${availableSpots}
- Maximum new specialists you can recommend: ${maxRecommendations}
- Keep existing team: ${keepExistingTeam ? 'YES - Do not remove existing members' : 'NO - Can start fresh'}

⚠️ CRITICAL EMERGENCY DETECTION - FIRST PRIORITY:
Before anything else, scan for EMERGENCY symptoms that require immediate medical attention:
- Chest pain, severe shortness of breath, or signs of heart attack/stroke
- Severe allergic reactions, difficulty breathing
- Severe bleeding, major trauma, loss of consciousness
- Suicidal thoughts or immediate mental health crisis
- Severe abdominal pain suggesting appendicitis, internal bleeding
- High fever with severe symptoms, signs of sepsis

IF EMERGENCY DETECTED: Respond with {"isEmergency": true, "explanation": "🚨 EMERGENCY: [specific emergency detected]. Please seek immediate medical attention by calling 911 or going to the nearest emergency room. Do not delay - this requires urgent professional medical care."}

IF NO EMERGENCY: Write your analysis in FIRST PERSON as Health Expert Carol speaking directly to the patient in a warm, reassuring tone.

TEAM GUIDELINES (for non-emergency cases):
- I (Health Expert Carol) am already the team coordinator - DO NOT include me in recommendations
- EXISTING TEAM PRESERVATION: If keeping existing team (${keepExistingTeam}), you MUST NOT remove any current members
- RECOMMENDATION LIMITS: You can recommend a maximum of ${maxRecommendations} NEW specialists
- If current team is already sufficient, you may recommend 0 new specialists and explain why
- Consider the patient's specific conditions and existing team when recommending additions
- If patient requests specific specialists by name, try to honor those requests within the limits

${keepExistingTeam && existingTeamMembers !== 'None' ? `\nEXISTING TEAM MEMBERS TO KEEP: ${existingTeamMembers}` : ''}

${userProfileContext}

QUESTIONNAIRE RESPONSES:
${Object.entries(questionnaireData)
  .filter(([key]) => !key.includes('Keep existing') && !key.includes('Existing team') && !key.includes('Current team') && !key.includes('Available spots') && !key.includes('Maximum recommendations'))
  .map(([question, answer]) => `${question}: ${answer}`)
  .join('\n')}

AVAILABLE SPECIALISTS (DO NOT include Health Expert Carol in recommendations):
${personaList}

Respond with valid JSON in this exact format:
{
  "recommendedSpecialists": [
    {"name": "AI Health Expert[Name]", "specialty": "[Specialty]", "reason": "[Brief reason why this specialist is helpful]"}
  ],
  "explanation": "Hi there! I'm Health Expert Carol and I'm excited to be your health team coordinator. [Write a warm, first-person explanation of your recommendations, acknowledging existing team members if keeping them, explaining why this team (existing + new) will take great care of them. If recommending 0 new specialists, explain why the current team is already optimal. Make it personal and caring.]"
}

Remember: 
- NEVER include Health Expert Aileen Carol in recommendedSpecialists
- Respect the maximum of ${maxRecommendations} new recommendations
- If keeping existing team, explain how new additions complement current members
- SAFETY FIRST - always prioritize emergency detection over team recommendations
- Generate unique recommendations based on the specific questionnaire responses and existing team composition`;

  return post('/api/simple-query/', {
    query: prompt
  });
};

// Async Differential Opinion Job helpers
export const createDifferentialOpinionJob = (conversationId) => {
  return post('/api/differential-opinion/async', { conversation_id: conversationId });
};

export const getDifferentialOpinionJob = (jobId) => {
  return get(`/api/differential-opinion/async/job/${jobId}`);
};

/**
 * Adds a participant (AI persona) to an existing conversation.
 * @param {string} conversationId - The ID of the conversation.
 * @param {string} personaId - The ID of the persona to add.
 * @returns {Promise<object>} A promise resolving to the updated conversation object or relevant response.
 */
export const addParticipantToConversation = (conversationId, personaId) => {
  return post(`/api/conversation/${conversationId}/participants`, { persona_id: personaId });
};

/* ------------------------------------------------------------------ *
 *  PERSONA-ADMIN HELPERS
 * ------------------------------------------------------------------ */

// get the tag list (array of strings)
export const getPersonaTags = (personaId) =>
  get(`/api/personas/${personaId}/tags`);

// replace the tag list for a persona
export const setPersonaTags = (personaId, tagsArr) =>
  put(`/api/personas/${personaId}/tags`, { tags: tagsArr });

// create-or-update a prompt row
export const upsertPrompt = (promptId, body) =>
  put(`/api/prompts/${promptId}`, body);        // backend treats PUT as upsert

// update the persona row itself
export const updatePersona = (personaId, body) =>
  put(`/api/personas/${personaId}`, body);

/**
 * Converts speech to text using the backend speech-to-text API.
 * @param {Blob} audioBlob - The audio blob to transcribe.
 * @param {string} filename - The filename for the audio file (e.g., 'recording.webm').
 * @returns {Promise<object>} A promise that resolves to the transcription result with 'text' property.
 */
export const speechToText = (audioBlob, filename = 'recording.webm') => {
  const formData = new FormData();
  formData.append('audio_file', audioBlob, filename);

  // Use apiRequest directly, passing the FormData object as the body
  // The 'Content-Type' header will be automatically omitted by apiRequest
  return apiRequest('/api/speech-to-text', {
    method: 'POST',
    body: formData,
  });
};

/**
 * Converts text to speech using the backend text-to-speech API.
 * @param {string} text - The text to convert to speech.
 * @param {string} voice - The voice to use (default: 'alloy').
 * @param {string} model - The TTS model to use (default: 'tts-1').
 * @returns {Promise<Blob>} A promise that resolves to the audio blob.
 */
export const textToSpeech = async (text, voice = 'alloy', model = 'tts-1') => {
  const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getCurrentUserToken()}`,
    },
    body: JSON.stringify({ text, voice, model }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Text-to-speech failed: ${errorText}`);
  }

  return await response.blob();
};

/**
 * Stream ElevenLabs TTS with proper authentication and progressive playback.
 * @param {string} text - The text to convert to speech.
 * @param {string} voice - The ElevenLabs voice ID.
 * @param {function} onFirstChunk - Callback when first chunk arrives
 * @returns {Promise<{url: string, cleanup: function}>} Object with audio URL and cleanup function.
 */
export const streamElevenLabsTTS = async (text, voice, onFirstChunk = null) => {
  const token = await getCurrentUserToken();
  
  // Fetch with authentication headers
  const params = new URLSearchParams({ text });
  const response = await fetch(
    `${API_BASE_URL}/api/text-to-speech/proxy/${voice}?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Streaming TTS failed: ${errorText}`);
  }
  
  // Stream and collect chunks progressively
  const reader = response.body.getReader();
  const chunks = [];
  let firstChunkReceived = false;
  const MIN_PLAYABLE_SIZE = 8192; // 8KB minimum for stable playback
  let totalBytes = 0;
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    if (value) {
      chunks.push(value);
      totalBytes += value.length;
      
      // Signal when we have enough to start playing
      if (!firstChunkReceived && totalBytes >= MIN_PLAYABLE_SIZE) {
        firstChunkReceived = true;
        if (onFirstChunk) {
          // Create initial blob for immediate playback
          const initialBlob = new Blob(chunks, { type: 'audio/mpeg' });
          const initialUrl = URL.createObjectURL(initialBlob);
          onFirstChunk(initialUrl);
        }
      }
    }
  }
  
  // Create final complete blob
  const blob = new Blob(chunks, { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url)
  };
};


