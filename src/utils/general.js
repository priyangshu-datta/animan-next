import {
  DAY_IN_MS,
  HOUR_IN_MS,
  MINUTE_IN_MS,
  SECOND_IN_MS,
} from '@/lib/constants';
import AppStorage from './local-storage';

export const camelToSnake = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const snakeToCamel = (s) =>
  s.toLowerCase().replace(/(_\w)/g, (k) => k[1].toUpperCase());

export const camelKeysToSnakeKeys = (json) => {
  try {
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [camelToSnake(k), v])
    );
  } catch (err) {
    console.error(err);
  }
};

export const snakeKeysToCamelKeys = (json) => {
  try {
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [snakeToCamel(k), v])
    );
  } catch (err) {
    console.error(err);
  }
};

export const debounce = (func, delay = 500) => {
  let timerId;

  return (...args) => {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const sentenceCase = (s) => {
  return s.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};

export function fuzzyRegexMatch(query, target) {
  const pattern = query
    .split('')
    .map((ch) => ch.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')) // escape regex chars
    .join('.*?'); // non-greedy wildcard between letters

  const regex = new RegExp(pattern, 'i'); // case-insensitive
  return regex.test(target);
}

function createDateObject(dateParts) {
  const { year, month, day } = dateParts;

  if (year === null || typeof year === 'undefined') {
    return null; // Or throw an error, year is required
  }

  if (month !== null && day !== null) {
    // All parts present
    return new Date(year, month - 1, day); // month - 1 because Date months are 0-indexed
  } else if (month !== null) {
    // Year and month present, default to 1st of the month
    return new Date(year, month - 1, 1);
  } else {
    // Only year present, default to Jan 1st
    return new Date(year, 0, 1);
  }
}

export function formatPartialDate(dateParts) {
  const dateObj = createDateObject(dateParts);

  if (!dateObj) {
    return 'Invalid Date'; // Or handle as appropriate
  }

  let options = {};
  const { year, month, day } = dateParts;

  options.year = 'numeric'; // Year is always present

  if (month !== null) {
    options.month = 'long'; // or 'short', '2-digit', 'numeric'
  }
  if (day !== null) {
    options.day = 'numeric'; // or '2-digit'
  }

  // If only year is present, ensure no month/day formatting is requested
  if (month === null && day === null) {
    options = { year: 'numeric' };
  } else if (day === null) {
    // Year and month, but no day
    options = { year: 'numeric', month: 'long' };
  }
  // else, year, month, and day are all present, use the options defined above

  try {
    const formatter = new Intl.DateTimeFormat(AppStorage.get('locale'), {
      ...options,
      timeZone: AppStorage.get('timezone'),
    });
    return formatter.format(dateObj);
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Error';
  }
}

/**
 * Formats the time left until `nextAiringAt` using Intl.RelativeTimeFormat
 * for localized and grammatically correct output.
 *
 * @param {number} nextAiringAt - Unix timestamp (seconds) of the next airing time.
 * @returns {string} The formatted time left, e.g., "in 3 days", "in 5 hours", "10 minutes".
 */
export function formatTimeLeft(nextAiringAt, duration = 0) {
  const now = Date.now(); // current time in seconds
  const diff = nextAiringAt - now; // difference in seconds (can be negative for past times)

  const rtf = new Intl.RelativeTimeFormat(AppStorage.get('locale'), {
    numeric: 'auto',
    style: 'narrow', // or 'short', 'long'
  });

  if (diff < 5 && now < nextAiringAt + duration) {
    // For very small differences around "now", both positive and negative.
    // Adjust the threshold as needed.
    return 'now!';
  }

  const absDiff = Math.abs(diff); // Use absolute difference for calculations

  const seconds = Math.floor(absDiff / SECOND_IN_MS);
  const minutes = Math.floor(absDiff / MINUTE_IN_MS);
  const hours = Math.floor(absDiff / HOUR_IN_MS);
  const days = Math.floor(absDiff / DAY_IN_MS);

  // Determine the sign for the value passed to format()
  const sign = diff < 0 ? -1 : 1;

  if (days >= 1) {
    // For days, if you want "1 day ago" or "in 1 day"
    // Use the floor of the absolute difference for the days calculation
    return rtf.format(sign * days, 'day');
  } else if (hours >= 1) {
    return rtf.format(sign * hours, 'hour');
  } else if (minutes >= 1) {
    return rtf.format(sign * minutes, 'minute');
  } else {
    // For seconds, ensure you're using the calculated seconds, not just a static '0'
    return rtf.format(sign * seconds, 'second');
  }
}

export function formatDateOfBirth(dateOfBirthInParts) {
  const { day, month, year } = dateOfBirthInParts || {};

  // Check if at least one component is present
  if (day === undefined && month === undefined && year === undefined) {
    return 'Date of Birth Not Available';
  }

  let date;
  let options = {};

  // Construct the Date object based on available parts
  // Note: Month in Date constructor is 0-indexed (January is 0, December is 11)
  if (!!year && !!month && !!day) {
    date = new Date(year, month - 1, day); // month - 1 for 0-indexed month
    options = { year: 'numeric', month: 'long', day: 'numeric' };
  } else if (!!year && !!month) {
    date = new Date(year, month - 1, 1); // Default to day 1 if only year and month
    options = { year: 'numeric', month: 'long' };
  } else if (!!month && !!day) {
    // If no year, assume current year for a valid Date object, but only display month/day
    date = new Date(new Date().getFullYear(), month - 1, day);
    options = { month: 'long', day: 'numeric' };
  } else if (!!year) {
    date = new Date(year, 0, 1); // Default to January 1st if only year
    options = { year: 'numeric' };
  } else if (!!month) {
    date = new Date(new Date().getFullYear(), month - 1, 1); // Default to current year, day 1
    options = { month: 'long' };
  } else if (!!day) {
    date = new Date(new Date().getFullYear(), new Date().getMonth(), day); // Default to current year and month
    options = { day: 'numeric' };
  } else {
    // This case should ideally be caught by the initial check, but as a fallback:
    return 'Invalid Date of Birth Data';
  }

  // Create an Intl.DateTimeFormat instance
  const formatter = new Intl.DateTimeFormat(AppStorage.get('locale'), options);

  // Format the date
  return formatter.format(date);
}
