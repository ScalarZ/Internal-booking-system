import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  // State to hold the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout id
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout on cleanup to prevent memory leaks
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
