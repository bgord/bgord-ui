import { useEffect, useLayoutEffect, useRef } from "react";
// cSpell:ignore tinykeys
import { tinykeys } from "tinykeys";

type UseShortcutsConfigType = { [key: string]: (event: KeyboardEvent) => void };

type UseShortcutsOptionsType = { enabled?: boolean };

export function useShortcuts(config: UseShortcutsConfigType, options?: UseShortcutsOptionsType): void {
  const enabled = options?.enabled ?? true;
  const latest = useRef({ config, enabled });
  const keys = JSON.stringify(Object.keys(config));

  useLayoutEffect(() => {
    latest.current = { config, enabled };
  });

  useEffect(() => {
    const bindings = Object.fromEntries(
      (JSON.parse(keys) as Array<string>).map((key) => [
        key,
        (event: KeyboardEvent) => {
          if (latest.current.enabled) latest.current.config[key]?.(event);
        },
      ]),
    );

    const unsubscribe = tinykeys(window, bindings);
    return () => unsubscribe();
  }, [keys]);
}
