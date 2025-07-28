import { useEffect } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent) => void,
): void {
  if (typeof document === "undefined") return;

  useEffect(() => {
    function listener(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el) return;

      // For <dialog>, a backdrop click sets target === el.
      const isBackdropClick = event.target === el;
      const isInside = el.contains(event.target as Node) && !isBackdropClick;

      if (isInside) return; // ordinary inside click → ignore
      handler(event); // outside or backdrop click → run handler
    }

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
