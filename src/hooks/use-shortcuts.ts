import { useEffect, useMemo } from "react";
import { tinykeys } from "tinykeys";

interface UseShortcutsConfigType {
  [keybinding: string]: (event: KeyboardEvent) => void;
}

type UseShortcutsOptionsType = {
  enabled?: boolean;
};

export function useShortcuts(config: UseShortcutsConfigType, options?: UseShortcutsOptionsType): void {
  const enabled = options?.enabled ?? true;

  // Memoize config to prevent unnecessary effect triggers
  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const memoizedConfig = useMemo(
    () => config,
    // Using JSON.stringify as a stable way to compare config objects
    [JSON.stringify(Object.keys(config))],
  );

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = tinykeys(window, memoizedConfig);
    return () => unsubscribe();
  }, [memoizedConfig, enabled]);
}
