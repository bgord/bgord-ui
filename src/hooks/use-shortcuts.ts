import { useEffect, useMemo } from "react";
import { tinykeys } from "tinykeys";

interface UseShortcutsConfigType {
  [keybinding: string]: (event: KeyboardEvent) => void;
}

type UseShortcutsOptionsType = { enabled?: boolean };

export function useShortcuts(_config: UseShortcutsConfigType, options?: UseShortcutsOptionsType): void {
  const enabled = options?.enabled ?? true;

  // biome-ignore lint: lint/correctness/useExhaustiveDependencies
  const config = useMemo(() => _config, [JSON.stringify(Object.keys(_config))]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = tinykeys(window, config);
    return () => unsubscribe();
  }, [config, enabled]);
}
