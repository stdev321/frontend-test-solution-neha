// GA_ID can be moved to an environment variable later if needed
export const GA_ID = 'G-GP6SKHJLL8';

/**
 * Logs a page view to Google Analytics.
 * @param {string} path - The path of the page to log (e.g., /chat/some-id).
 */
export const pageview = (path) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, { page_path: path });
  } else {
    console.warn("gtag function not found. GA pageview not sent.");
  }
};

/**
 * Sets the user ID in Google Analytics for the current session.
 * This helps stitch together user journeys across different sessions and devices.
 * @param {string | null} id - The non-personally-identifiable user ID, or null on logout.
 */
export const setUserId = (id) => {
  if (typeof window.gtag === 'function') {
    window.gtag('set', { user_id: id });
  } else {
    console.warn("gtag function not found. GA user ID not set.");
  }
};

/**
 * Logs a custom event to Google Analytics.
 * @param {object} params - The event parameters.
 * @param {string} params.action - The name of the event (e.g., 'send_message').
 * @param {string} [params.category] - The category of the event (e.g., 'chat').
 * @param {string} [params.label] - A label for the event (e.g., the persona ID).
 * @param {number} [params.value] - A numeric value associated with the event.
 */
export const gaEvent = ({ action, category, label, value }) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.warn(`gtag function not found. GA event "${action}" not sent.`);
  }
};
