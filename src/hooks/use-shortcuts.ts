import { useEffect } from "react";
// cSpell:ignore tinykeys
import { tinykeys } from "tinykeys";

type UseShortcutsConfigType = { [key: string]: (event: KeyboardEvent) => void };

type UseShortcutsOptionsType = { enabled?: boolean };

export function useShortcuts(config: UseShortcutsConfigType, options?: UseShortcutsOptionsType): void {
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = tinykeys(window, config);
    return () => unsubscribe();
  }, [config, enabled]);
}
