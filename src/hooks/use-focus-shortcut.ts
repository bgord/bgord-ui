import { type Ref, useCallback, useMemo, useRef } from "react";
import { useShortcuts } from "./use-shortcuts";

type FocusableElement = HTMLElement & { focus(): void };

export function useFocusKeyboardShortcut<T extends FocusableElement = HTMLInputElement>(
  shortcut: string,
): { ref: Ref<T> } {
  const ref = useRef<T>(null);

  // Stryker disable ArrayDeclaration: any constant dependency list keeps the identity
  const handleFocus = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  // Stryker restore ArrayDeclaration

  useShortcuts({ [shortcut]: handleFocus });

  // Stryker disable next-line ArrayDeclaration: any constant dependency list keeps the identity
  return useMemo(() => ({ ref }), []);
}
