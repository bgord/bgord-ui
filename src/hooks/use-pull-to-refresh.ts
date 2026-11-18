import { useReducer } from "react";

export enum PullToRefreshStateKind {
  idle = "idle",
  pulling = "pulling",
  armed = "armed",
  refreshing = "refreshing",
}

export type PullToRefreshState =
  | { kind: PullToRefreshStateKind.idle; distance: 0 }
  | {
      kind: PullToRefreshStateKind.pulling | PullToRefreshStateKind.armed;
      start: { x: number; y: number };
      distance: number;
    }
  | { kind: PullToRefreshStateKind.refreshing; distance: number };

type PullToRefreshEvent =
  | { type: "press"; x: number; y: number }
  | { type: "move"; x: number; y: number; threshold: number }
  | { type: "release" }
  | { type: "cancel" }
  | { type: "settle" };

export type UsePullToRefreshConfig = {
  onRefresh: () => Promise<unknown>;
  threshold?: number;
};

export type UsePullToRefreshReturnType = {
  state: PullToRefreshState;
  handlers: {
    onTouchStart: (event: React.TouchEvent<HTMLElement>) => void;
    onTouchMove: (event: React.TouchEvent<HTMLElement>) => void;
    onTouchEnd: () => Promise<void>;
    onTouchCancel: () => void;
  };
};

const DEAD_ZONE = 8;

function transition(state: PullToRefreshState, event: PullToRefreshEvent): PullToRefreshState {
  switch (state.kind) {
    case PullToRefreshStateKind.idle:
      if (event.type === "press") {
        return { kind: PullToRefreshStateKind.pulling, start: { x: event.x, y: event.y }, distance: 0 };
      }
      return state;
    case PullToRefreshStateKind.pulling:
    case PullToRefreshStateKind.armed: {
      if (event.type === "move") {
        const drift = event.x - state.start.x;
        const pull = event.y - state.start.y;

        if (state.distance === 0) {
          if (Math.max(Math.abs(drift), Math.abs(pull)) <= DEAD_ZONE) return state;
          if (Math.abs(drift) >= Math.abs(pull)) return { kind: PullToRefreshStateKind.idle, distance: 0 };
        }

        const distance = Math.min(event.threshold, Math.max(0, pull / 2));
        const kind =
          distance >= event.threshold ? PullToRefreshStateKind.armed : PullToRefreshStateKind.pulling;

        return { kind, start: state.start, distance };
      }
      if (event.type === "release") {
        return state.kind === PullToRefreshStateKind.armed
          ? { kind: PullToRefreshStateKind.refreshing, distance: state.distance }
          : { kind: PullToRefreshStateKind.idle, distance: 0 };
      }
      if (event.type === "cancel") return { kind: PullToRefreshStateKind.idle, distance: 0 };
      return state;
    }
    case PullToRefreshStateKind.refreshing:
      if (event.type === "settle") return { kind: PullToRefreshStateKind.idle, distance: 0 };
      return state;
  }
}

export function usePullToRefresh(config: UsePullToRefreshConfig): UsePullToRefreshReturnType {
  const threshold = config.threshold ?? 64;
  const [state, send] = useReducer(transition, { kind: PullToRefreshStateKind.idle, distance: 0 });
  const settle = () => send({ type: "settle" });

  return {
    state,
    handlers: {
      onTouchStart(event) {
        const touch = event.touches[0];
        if (touch && window.scrollY === 0) send({ type: "press", x: touch.clientX, y: touch.clientY });
      },
      onTouchMove(event) {
        const touch = event.touches[0];
        if (touch) send({ type: "move", x: touch.clientX, y: touch.clientY, threshold });
      },
      async onTouchEnd() {
        send({ type: "release" });
        if (state.kind !== PullToRefreshStateKind.armed) return;

        await config.onRefresh().then(settle, settle);
      },
      onTouchCancel() {
        send({ type: "cancel" });
      },
    },
  };
}
