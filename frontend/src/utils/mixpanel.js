/**
 * A wrapper for the Mixpanel object to ensure it exists before use.
 * This prevents errors if the Mixpanel script is blocked by an ad-blocker.
 */

/**
 * Identifies the user to Mixpanel. This connects all their future events
 * to their specific user profile.
 * @param {string} userId - The unique user ID from your database.
 */
export const mixpanelIdentify = (userId) => {
  if (window.mixpanel && typeof window.mixpanel.identify === 'function') {
    window.mixpanel.identify(userId);
  }
};

/**
 * Tracks a custom event in Mixpanel.
 * @param {string} eventName - The name of the event (e.g., 'Message Sent').
 * @param {object} properties - Additional data to send with the event.
 */
export const mixpanelTrack = (eventName, properties = {}) => {
  if (window.mixpanel && typeof window.mixpanel.track === 'function') {
    window.mixpanel.track(eventName, properties);
  }
};

/**
 * Sets properties on the user's Mixpanel profile (e.g., their email).
 * @param {object} properties - The properties to set on the user's profile.
 */
export const mixpanelSetPeople = (properties = {}) => {
  if (window.mixpanel && window.mixpanel.people && typeof window.mixpanel.people.set === 'function') {
    window.mixpanel.people.set(properties);
  }
};

/**
 * Resets the Mixpanel instance on logout. This clears the identified user
 * and generates a new anonymous ID for the next session.
 */
export const mixpanelReset = () => {
    if (window.mixpanel && typeof window.mixpanel.reset === 'function') {
        window.mixpanel.reset();
    }
} 