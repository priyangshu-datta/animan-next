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
  return s?.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};

export function fuzzyRegexMatch(query, target) {
  const pattern = query
    .split('')
    .map((ch) => ch.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')) // escape regex chars
    .join('.*?'); // non-greedy wildcard between letters

  const regex = new RegExp(pattern, 'i'); // case-insensitive
  return regex.test(target);
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

export function formatPartialDate(dateInParts) {
  const { day, month, year } = dateInParts || {};

  // Check if at least one component is present
  if (day === undefined && month === undefined && year === undefined) {
    return null;
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
    return null;
  }

  // Create an Intl.DateTimeFormat instance
  const formatter = new Intl.DateTimeFormat(AppStorage.get('locale'), options);

  // Format the date
  return formatter.format(date);
}

/**
 * Converts a number of minutes into a human-readable string format using Intl APIs.
 * Examples: 1 minute, half an hour, 1 hour, 2 hours and 30 minutes.
 *
 * @param {number} minutes The total number of minutes to convert.
 * @returns {string} The human-readable string representation of the minutes.
 */
export function formatMinutesToReadableString(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return 'Invalid input: Please provide a valid number of minutes.';
  }

  if (minutes === 0) {
    return '0 minutes'; // Explicitly handle 0 minutes
  }

  // Determine if the input is negative and get the absolute value for processing
  const isNegative = minutes < 0;
  minutes = Math.abs(minutes);
  let prefix = isNegative ? 'minus ' : '';

  // Create Intl.NumberFormat instances for minutes and hours.
  // 'style: unit' tells it to format a number with a unit.
  // 'unitDisplay: long' ensures the full unit name (e.g., "minute", "hour") is used.
  const minuteFormatter = new Intl.NumberFormat(AppStorage.get('locale'), {
    style: 'unit',
    unit: 'minute',
    unitDisplay: 'long',
  });

  const hourFormatter = new Intl.NumberFormat(AppStorage.get('locale'), {
    style: 'unit',
    unit: 'hour',
    unitDisplay: 'long',
  });

  // Handle specific cases as requested:
  if (minutes === 1) {
    return `${prefix}${minuteFormatter.format(1)}`;
  }

  if (minutes === 30) {
    // This is a specific phrase that Intl.NumberFormat doesn't directly provide.
    return `${prefix}half an hour`;
  }

  // If minutes are less than an hour, format directly as minutes.
  if (minutes < 60) {
    return `${prefix}${minuteFormatter.format(minutes)}`;
  }

  // Calculate hours and remaining minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // Start building the result string with the hours part
  let result = `${prefix}${hourFormatter.format(hours)}`;

  // If there are remaining minutes, append them to the string
  if (remainingMinutes > 0) {
    if (remainingMinutes === 30) {
      // Again, a specific phrase for 30 remaining minutes.
      result += ' and half an hour';
    } else {
      // Format the remaining minutes using the minuteFormatter.
      result += ` and ${minuteFormatter.format(remainingMinutes)}`;
    }
  }

  return result;
}

/**
 * Formats a number into its English ordinal form (e.g., 1 -> "1st", 2 -> "2nd", 11 -> "11th").
 *
 * @param {number} n The number to format.
 * @returns {string} The ordinal string.
 */
export function formatOrdinal(n) {
  // Ensure the input is a valid number
  if (typeof n !== 'number' || !Number.isInteger(n)) {
    throw new Error('Input must be an integer.');
  }

  // Handle negative numbers or zero if necessary (e.g., "-1st", "0th")
  // For most ordinal use cases, numbers are positive.
  // If you want to only handle positive numbers and throw for others:
  // if (n < 0) {
  //   throw new Error("Input must be a non-negative integer for ordinal formatting.");
  // }
  // You might want "0th" as well, which the logic below handles correctly.

  const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });

  // Define suffixes based on the categories returned by PluralRules
  // 'one', 'two', 'few' correspond to 'st', 'nd', 'rd' respectively.
  // 'other' covers 'th' for most cases, including teens (11-13).
  const suffixes = new Map([
    ['one', 'st'],
    ['two', 'nd'],
    ['few', 'rd'],
    ['other', 'th'],
  ]);

  const rule = pr.select(n); // Gets the ordinal category (e.g., 'one', 'two', 'few', 'other')
  const suffix = suffixes.get(rule);

  return `${n}${suffix}`;
}

export function getCurrentAnimeSeason() {
  const date = new Date();
  const month = date.getMonth(); // 0 for January, 11 for December

  if (month >= 0 && month <= 2) {
    // January, February, March
    return 'WINTER';
  } else if (month >= 3 && month <= 5) {
    // April, May, June
    return 'SPRING';
  } else if (month >= 6 && month <= 8) {
    // July, August, September
    return 'SUMMER';
  } else {
    // October, November, December
    return 'FALL';
  }
}
