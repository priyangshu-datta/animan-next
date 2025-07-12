/**
 * @fileoverview Custom utility for interacting with localStorage.
 * This module provides a wrapper around localStorage to automatically
 * handle key prefixing, JSON serialization/deserialization,
 * and graceful error handling for SSR environments.
 */

// Define the application-wide prefix for all localStorage keys.
// This helps prevent collisions with other applications or libraries
// and makes your app's data easily identifiable.
const APP_PREFIX = 'animan_'; // <--- IMPORTANT: Change this to your actual app prefix!

/**
 * @typedef {Object} AppLocalStorageKeys
 * @property {string} [lastVisitedPage] - The last page the user visited.
 * @property {boolean} [isWelcomeShown] - A flag to indicate if the welcome message has been shown.
 * @property {string} [locale] - The user's preferred locale (e.g., 'en-US', 'fr-FR').
 * @property {string} [timezone] - The user's preferred timezone (e.g., 'America/New_York', 'Asia/Kolkata').
 * // Add more non-sensitive, persistent keys as your application needs them.
 */

/**
 * @typedef {'lastVisitedPage' | 'isWelcomeShown' | 'locale' | 'timezone'} AppStorageKey
 * A union type representing all valid keys for your application's localStorage.
 * This is used for JSDoc type hints.
 */

/**
 * @typedef {Object} AppStorageType
 * @property {<K extends AppStorageKey>(key: K, value: AppLocalStorageKeys[K]) => void} set
 * @property {<K extends AppStorageKey>(key: K) => AppLocalStorageKeys[K] | null} get
 * @property {<K extends AppStorageKey>(key: K) => void} remove
 * @property {() => void} clearAllAppKeys
 */

/**
 * @type {AppStorageType}
 * @description A utility object for interacting with localStorage using a predefined application prefix.
 */
const AppStorage = {
  /**
   * Defines default values for specific localStorage keys.
   * If a key is not found in localStorage or parsing fails,
   * the corresponding value from this map will be returned.
   * @type {AppLocalStorageKeys}
   */
  DEFAULT_VALUES_MAP: {
    lastVisitedPage: '/home',
    isWelcomeShown: false,
    locale: undefined,
    timezone: undefined, // Example default timezone
  },

  /**
   * Sets a value in localStorage with the application prefix.
   * Automatically stringifies objects/arrays using JSON.
   *
   * @template {AppStorageKey} K
   * @param {K} key - The key to set (without the prefix, e.g., 'locale').
   * @param {AppLocalStorageKeys[K]} value - The value to store. Can be string, number, boolean, object, or array.
   * @returns {void}
   */
  set(key, value) {
    if (typeof window === 'undefined') {
      console.warn(
        `Attempted to set localStorage key "${APP_PREFIX}${String(key)}"` +
          ` in SSR environment.`
      );
      return;
    }
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(APP_PREFIX + String(key), serializedValue);
    } catch (error) {
      console.error(
        `Error setting localStorage key "${APP_PREFIX}${String(key)}":`,
        error
      );
    }
  },

  /**
   * Gets a value from localStorage, automatically applying the application prefix.
   * Automatically parses the value using JSON. If the key is not found,
   * parsing fails, or the stored value is `null`/`undefined`, it returns
   * the default value defined in `DEFAULT_VALUES_MAP` for that key.
   *
   * @template {AppStorageKey} K
   * @param {K} key - The key to get (without the prefix, e.g., 'timezone').
   * @returns {AppLocalStorageKeys[K] | null} The parsed value, or the default value
   * from `DEFAULT_VALUES_MAP` if available, otherwise `null`.
   */
  get(key) {
    if (typeof window === 'undefined') {
      // In SSR environment, localStorage is not available, return default value from map
      return this.DEFAULT_VALUES_MAP[key] !== undefined
        ? this.DEFAULT_VALUES_MAP[key]
        : null;
    }
    try {
      const serializedValue = localStorage.getItem(APP_PREFIX + String(key));
      if (serializedValue === null) {
        // Key not found in localStorage, return default value from map
        return this.DEFAULT_VALUES_MAP[key];
      }
      const parsedValue = JSON.parse(serializedValue);

      // If the parsed value is explicitly null or undefined, return the default value from map
      // This handles cases where 'null' or 'undefined' might have been stored as strings
      if (parsedValue === null || typeof parsedValue === 'undefined') {
        return this.DEFAULT_VALUES_MAP[key] !== undefined
          ? this.DEFAULT_VALUES_MAP[key]
          : null;
      }

      return parsedValue;
    } catch (error) {
      console.error(
        `Error getting or parsing localStorage key "${APP_PREFIX}${String(
          key
        )}":`,
        error
      );
      // Return default value from map on any error during retrieval or parsing
      return this.DEFAULT_VALUES_MAP[key] !== undefined
        ? this.DEFAULT_VALUES_MAP[key]
        : null;
    }
  },

  /**
   * Removes a specific key from localStorage, automatically applying the application prefix.
   *
   * @template {AppStorageKey} K
   * @param {K} key - The key to remove (without the prefix).
   * @returns {void}
   */
  remove(key) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(APP_PREFIX + String(key));
    } catch (error) {
      console.error(
        `Error removing localStorage key "${APP_PREFIX}${String(key)}":`,
        error
      );
    }
  },

  /**
   * Clears all localStorage keys that belong to the application (i.e., those with the defined prefix).
   * This is useful for clearing non-user-specific settings or for a hard "reset app" feature.
   * @returns {void}
   */
  clearAllAppKeys() {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(APP_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(`Error clearing all app localStorage keys:`, error);
    }
  },
};

export default AppStorage;
