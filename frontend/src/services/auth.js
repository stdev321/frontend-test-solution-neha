import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  getIdToken
} from 'firebase/auth';
import firebaseConfig from '../firebase/config'; // Import config from correct relative path

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- Exported Authentication Functions ---

/**
 * Listens for changes in the user's authentication state.
 * @param {function} callback - Function to call when auth state changes. Receives the user object or null.
 * @returns {import("firebase/auth").Unsubscribe} Function to unsubscribe the listener.
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Signs in a user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import("firebase/auth").User>} The signed-in user object.
 * @throws {Error} Firebase authentication error.
 */
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase Login Error:", error.code, error.message);
    throw error; // Re-throw the error for the caller to handle
  }
};

/**
 * Registers a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @param {string} [displayName] - Optional display name to set for the user profile.
 * @returns {Promise<import("firebase/auth").User>} The newly created user object.
 * @throws {Error} Firebase authentication error.
 */
export const register = async (email, password, displayName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update the user's profile with the display name if provided
    if (displayName) {
      try {
        await updateProfile(userCredential.user, { displayName });
      } catch (profileError) {
        // Log profile update error but don't fail registration
        console.warn("Could not set display name during registration:", profileError);
      }
    }

    return userCredential.user;
  } catch (error) {
    console.error("Firebase Registration Error:", error.code, error.message);
    throw error; // Re-throw the error
  }
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 * @throws {Error} Firebase authentication error.
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Logout Error:", error.code, error.message);
    throw error; // Re-throw the error
  }
};

/**
 * Gets the currently authenticated user object.
 * @returns {import("firebase/auth").User | null} The current user or null if not signed in.
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Gets the Firebase ID token for the current user.
 * Automatically handles token refresh if needed.
 * @returns {Promise<string | null>} The ID token string or null if user is not signed in or an error occurs.
 */
export const getCurrentUserToken = async () => {
  const user = getCurrentUser();
  if (!user) {
    console.log("getAuthToken: No current user.");
    return null;
  }

  try {
    // Get ID token (let Firebase decide when to refresh to avoid quota issues)
    const token = await getIdToken(user);
    return token;
  } catch (error) {
    console.error("Error getting Firebase ID token:", error);
    return null;
  }
};

/**
 * Sends a password reset email to the given email address.
 * @param {string} email
 * @returns {Promise<void>}
 * @throws {Error} Firebase authentication error.
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Firebase Password Reset Error:", error.code, error.message);
    throw error; // Re-throw the error
  }
};

// Export the auth instance itself if needed elsewhere (less common)
// export default auth;
