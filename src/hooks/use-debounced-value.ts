import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), ms);

    return () => clearTimeout(timeout);
  }, [value, ms]);

  return debounced;
}
