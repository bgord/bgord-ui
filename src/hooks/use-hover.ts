import { useCallback, useRef } from "react";
import { useToggle } from "./use-toggle";

type UseHoverConfigType = { enabled?: boolean };

export type UseHoverReturnType<T extends HTMLElement> = {
  attach: { ref: React.RefCallback<T | null> };
  hovering: boolean;
};

export function useHover<T extends HTMLElement = HTMLElement>(
  config?: UseHoverConfigType,
): UseHoverReturnType<T> {
  const enabled = config?.enabled ?? true;
  const toggle = useToggle({ name: "_internal" });

  const element = useRef<T | null>(null);

  const enterEvent =
    typeof window !== "undefined" && "PointerEvent" in window ? "pointerenter" : "mouseenter";

  const leaveEvent =
    typeof window !== "undefined" && "PointerEvent" in window ? "pointerleave" : "mouseleave";

  const ref = useCallback(
    (node: T | null) => {
      const previous = element.current;

      if (previous) {
        previous.removeEventListener(enterEvent, toggle.enable);
        previous.removeEventListener(leaveEvent, toggle.disable);
      }

      element.current = node;

      if (node && enabled) {
        node.addEventListener(enterEvent, toggle.enable);
        node.addEventListener(leaveEvent, toggle.disable);
      }
    },
    [enterEvent, leaveEvent, enabled, toggle.enable, toggle.disable],
  );

  return { attach: { ref }, hovering: toggle.on && enabled };
}
