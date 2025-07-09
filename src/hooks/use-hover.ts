import { useCallback, useRef } from "react";
import { useToggle } from "./use-toggle";

type UseHoverConfigType = { enabled?: boolean };

export type UseHoverReturnType<T extends HTMLElement> = {
  attach: { ref: React.RefCallback<T | null> };
  isHovering: boolean;
};

export function useHover<T extends HTMLElement = HTMLElement>({
  enabled = true,
}: UseHoverConfigType = {}): UseHoverReturnType<T> {
  const { on: isOn, enable, disable } = useToggle({ name: "is-hovering" });
  const nodeRef = useRef<T | null>(null);

  const enterEvent =
    typeof window !== "undefined" && "PointerEvent" in window ? "pointerenter" : "mouseenter";
  const leaveEvent =
    typeof window !== "undefined" && "PointerEvent" in window ? "pointerleave" : "mouseleave";

  const ref = useCallback(
    (node: T | null) => {
      const prev = nodeRef.current;
      if (prev) {
        prev.removeEventListener(enterEvent, enable);
        prev.removeEventListener(leaveEvent, disable);
      }

      nodeRef.current = node;

      if (node && enabled) {
        node.addEventListener(enterEvent, enable);
        node.addEventListener(leaveEvent, disable);
      }
    },
    [enterEvent, leaveEvent, enabled, enable, disable],
  );

  return {
    attach: { ref },
    isHovering: isOn && enabled,
  };
}
