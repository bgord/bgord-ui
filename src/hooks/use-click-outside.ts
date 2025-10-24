import { type RefObject, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (e: MouseEvent | TouchEvent) => void,
): void {
  useEffect(() => {
    if (typeof document === "undefined") return; // SSR-guard

    function listener(event: MouseEvent | TouchEvent) {
      const element = ref.current;

      if (!element) return;

      if (element.contains(event.target as Node)) {
        if (event.target === element) {
          const { left, right, top, bottom } = element.getBoundingClientRect();

          const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
          const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

          const targetsElement = clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;

          if (targetsElement) return;
        } else return;
      }

      handler(event);
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
