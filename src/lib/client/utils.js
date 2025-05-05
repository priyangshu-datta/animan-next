export const debounce = (func, delay = 500) => {
  let timerId;

  return (...args) => {
    if (timerId) clearTimeout(timerId);

    timerId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const sentenceCase = (s) =>
  s.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

export function isAppContextReady() {
  return window.__APP_CONTEXT_READY__ === true;
}
