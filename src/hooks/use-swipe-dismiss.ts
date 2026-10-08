import { useRef } from "react";

export type UseSwipeDismissConfig = {
  onDismiss: () => void;
  enabled?: boolean;
  threshold?: number;
  target?: string;
};

export type UseSwipeDismissReturnType = {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
  style: React.CSSProperties;
};

type Drag = { element: HTMLElement; startY: number; startTime: number; distance: number };

const FLICK_VELOCITY = 0.5;
const SETTLE = "translate var(--motion-medium, 200ms) var(--ease-out, ease-out)";

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reset(element: HTMLElement): void {
  element.style.translate = "";
  element.style.transition = "";
}

function afterSettle(element: HTMLElement, callback: () => void): void {
  function listener(event: TransitionEvent) {
    if (event.target !== element || event.propertyName !== "translate") return;

    element.removeEventListener("transitionend", listener);
    callback();
  }

  element.addEventListener("transitionend", listener);
}

export function useSwipeDismiss(config: UseSwipeDismissConfig): UseSwipeDismissReturnType {
  const enabled = config.enabled ?? true;
  const threshold = config.threshold ?? 0.3;
  const target = config.target ?? "dialog";

  const drag = useRef<Drag | null>(null);

  function settle(event: React.PointerEvent<HTMLElement>, dismiss: boolean) {
    const current = drag.current;

    if (!current) return;

    drag.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    const { element } = current;

    if (reducedMotion()) {
      reset(element);
      if (dismiss) config.onDismiss();
      return;
    }

    element.style.transition = SETTLE;

    if (!dismiss) {
      element.style.translate = "";
      afterSettle(element, () => reset(element));
      return;
    }

    element.style.translate = "0 100%";
    afterSettle(element, () => {
      config.onDismiss();
      reset(element);
    });
  }

  return {
    onPointerDown(event) {
      if (!(enabled && event.isPrimary)) return;

      const element = event.currentTarget.closest<HTMLElement>(target);

      if (!element) return;

      event.currentTarget.setPointerCapture?.(event.pointerId);
      element.style.transition = "none";
      drag.current = { element, startY: event.clientY, startTime: performance.now(), distance: 0 };
    },

    onPointerMove(event) {
      const current = drag.current;

      if (!current) return;

      current.distance = Math.max(0, event.clientY - current.startY);
      current.element.style.translate = `0 ${current.distance}px`;
    },

    onPointerUp(event) {
      const current = drag.current;

      if (!current) return;

      const elapsed = Math.max(1, performance.now() - current.startTime);
      const far = current.distance > current.element.offsetHeight * threshold;
      const flick = current.distance > 0 && current.distance / elapsed > FLICK_VELOCITY;

      settle(event, far || flick);
    },

    onPointerCancel(event) {
      settle(event, false);
    },

    style: enabled ? { touchAction: "none", userSelect: "none" } : {},
  };
}
