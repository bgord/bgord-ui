import { type Ref, useCallback, useMemo, useRef } from "react";
import { useShortcuts } from "./use-shortcuts";

type FocusableElement = HTMLElement & { focus(): void };

export function useFocusKeyboardShortcut<T extends FocusableElement = HTMLInputElement>(
  shortcut: string,
): { ref: Ref<T> } {
  const ref = useRef<T>(null);

  const handleFocus = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  useShortcuts({ [shortcut]: handleFocus });

  return useMemo(() => ({ ref }), []);
}
