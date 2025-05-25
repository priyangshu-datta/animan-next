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
