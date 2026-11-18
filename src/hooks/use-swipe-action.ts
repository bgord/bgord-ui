import { useReducer } from "react";

export enum SwipeActionStateKind {
  idle = "idle",
  pulling = "pulling",
  armed = "armed",
  committed = "committed",
}

export enum SwipeActionDirection {
  left = "left",
  right = "right",
}

export type SwipeActionState =
  | { kind: SwipeActionStateKind.idle; offset: 0 }
  | {
      kind: SwipeActionStateKind.pulling | SwipeActionStateKind.armed;
      start: number;
      offset: number;
    }
  | { kind: SwipeActionStateKind.committed; offset: number };

type SwipeActionEvent =
  | { type: "press"; x: number }
  | { type: "move"; x: number; threshold: number }
  | { type: "release" }
  | { type: "cancel" };

export type UseSwipeActionConfig = {
  onSwipe: (direction: SwipeActionDirection) => Promise<unknown>;
  enabled?: boolean;
  threshold?: number;
};

export type UseSwipeActionReturnType = {
  state: SwipeActionState;
  direction: SwipeActionDirection | null;
  translate: string;
  handlers: {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: () => Promise<void>;
    onPointerCancel: () => void;
  };
};

const DEAD_ZONE = 8;

function transition(state: SwipeActionState, event: SwipeActionEvent): SwipeActionState {
  switch (state.kind) {
    case SwipeActionStateKind.idle:
      switch (event.type) {
        case "press":
          return { kind: SwipeActionStateKind.pulling, start: event.x, offset: 0 };
        default:
          return state;
      }
    case SwipeActionStateKind.pulling:
    case SwipeActionStateKind.armed:
      switch (event.type) {
        case "move": {
          const offset = event.x - state.start;

          if (state.offset === 0 && Math.abs(offset) <= DEAD_ZONE) return state;

          const kind =
            Math.abs(offset) >= event.threshold ? SwipeActionStateKind.armed : SwipeActionStateKind.pulling;

          return { kind, start: state.start, offset };
        }
        case "release":
          return state.kind === SwipeActionStateKind.armed
            ? { kind: SwipeActionStateKind.committed, offset: state.offset }
            : { kind: SwipeActionStateKind.idle, offset: 0 };
        case "cancel":
          return { kind: SwipeActionStateKind.idle, offset: 0 };
        default:
          return state;
      }
    case SwipeActionStateKind.committed:
      switch (event.type) {
        case "cancel":
          return { kind: SwipeActionStateKind.idle, offset: 0 };
        default:
          return state;
      }
  }
}

export function useSwipeAction(config: UseSwipeActionConfig): UseSwipeActionReturnType {
  const enabled = config.enabled ?? true;
  const threshold = config.threshold ?? 96;

  const [state, send] = useReducer(transition, { kind: SwipeActionStateKind.idle, offset: 0 });

  const direction =
    state.offset === 0 ? null : state.offset > 0 ? SwipeActionDirection.right : SwipeActionDirection.left;

  const translate =
    state.kind === SwipeActionStateKind.committed ? `${Math.sign(state.offset) * 100}%` : `${state.offset}px`;

  return {
    state,
    direction,
    translate,
    handlers: {
      onPointerDown(event) {
        if (!(enabled && event.isPrimary && event.pointerType === "touch")) return;

        send({ type: "press", x: event.clientX });
      },
      onPointerMove(event) {
        send({ type: "move", x: event.clientX, threshold });
      },
      async onPointerUp() {
        send({ type: "release" });
        if (state.kind !== SwipeActionStateKind.armed || !direction) return;

        await config.onSwipe(direction).then(
          (result) => result || send({ type: "cancel" }),
          () => send({ type: "cancel" }),
        );
      },
      onPointerCancel() {
        send({ type: "cancel" });
      },
    },
  };
}
