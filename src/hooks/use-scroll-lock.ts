import { useEffect } from "react";

export function useScrollLock(enabled = true): void {
  if (typeof document === "undefined") return;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (enabled) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [enabled]);
}
