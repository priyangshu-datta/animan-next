import { ERROR_CODES } from "./errorCodes.js";

/**
 * Custom application error
 */
export class AppError extends Error {
  /**
   * @param {object} options
   * @param {string} options.code
   * @param {string} options.message
   * @param {number} [options.status=500]
   * @param {any} [options.details]
   * @param {any} [options.stack]
   */
  constructor({ code, message, status = 500, details, stack }) {
    if (!isValidCode(code)) {
      throw new Error(`Unknown error code: ${code}`);
    }
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
    this.stack = stack;
  }
}

/**
 * @param {string} code
 * @returns {boolean}
 */
function isValidCode(code) {
  return Object.values(ERROR_CODES).includes(code);
}
