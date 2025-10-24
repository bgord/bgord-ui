import { useEffect } from "react";

export function useScrollLock(enabled = true): void {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const original = document.body.style.overflow;

    if (enabled) document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = original;
    };
  }, [enabled]);
}
