export const camelToSnake = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const snakeToCamel = (s) =>
  s.replace(/(_\w)/g, (k) => k[1].toUpperCase());

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
