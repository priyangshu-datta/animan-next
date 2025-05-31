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
