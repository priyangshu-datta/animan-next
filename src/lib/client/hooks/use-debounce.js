const { debounce } = require('@/utils/general');
const { useState, useEffect } = require('react');

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const debouncedSetter = debounce(setDebounced, delay);
    debouncedSetter(value);
  }, [value, delay]);

  return debounced;
}
