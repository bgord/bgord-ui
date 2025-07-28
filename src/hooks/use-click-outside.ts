import { RefObject, useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (e: MouseEvent | TouchEvent) => void,
): void {
  if (typeof document === "undefined") return; // SSR-guard

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el) return;

      // Click is *inside* if the element (or any of its children) contains the target…
      if (el.contains(event.target as Node)) {
        // …except the native <dialog> edge-case where event.target === el.
        // In that case we have to check the coordinates: if the pointer
        // landed **inside** the dialog’s rect we treat it as an inside click,
        // otherwise it’s a backdrop click.
        if (event.target === el) {
          const { left, right, top, bottom } = el.getBoundingClientRect();
          const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
          const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

          const isInRect = clientX >= left && clientX <= right && clientY >= top && clientY <= bottom;

          if (isInRect) return; // still inside → ignore
        } else {
          return; // ordinary inside click → ignore
        }
      }

      // Anything else is an outside / backdrop click
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
