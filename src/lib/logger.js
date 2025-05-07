/**
 * Logs an error message to the console with a specific code and details.
 * @param {string} code - The error code to identify the type of error.
 * @param {any} details - Additional details about the error.
 */
export function logError(code, details) {
  console.error(`[${code}]`);
  console.dir(details, { depth: Infinity, colors: true });
}
