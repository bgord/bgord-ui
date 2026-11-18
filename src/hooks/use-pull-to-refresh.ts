import { useReducer } from "react";

export enum PullToRefreshStateKind {
  idle = "idle",
  pulling = "pulling",
  armed = "armed",
  refreshing = "refreshing",
}

export type PullToRefreshState =
  | { kind: PullToRefreshStateKind.idle; distance: 0 }
  | { kind: PullToRefreshStateKind.pulling | PullToRefreshStateKind.armed; start: number; distance: number }
  | { kind: PullToRefreshStateKind.refreshing; distance: number };

type PullToRefreshEvent =
  | { type: "press"; y: number }
  | { type: "move"; y: number; threshold: number }
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

function transition(state: PullToRefreshState, event: PullToRefreshEvent): PullToRefreshState {
  switch (state.kind) {
    case PullToRefreshStateKind.idle:
      if (event.type === "press") {
        return { kind: PullToRefreshStateKind.pulling, start: event.y, distance: 0 };
      }
      return state;
    case PullToRefreshStateKind.pulling:
    case PullToRefreshStateKind.armed: {
      if (event.type === "move") {
        const distance = Math.min(event.threshold, Math.max(0, (event.y - state.start) / 2));
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
        if (touch && window.scrollY === 0) send({ type: "press", y: touch.clientY });
      },
      onTouchMove(event) {
        const touch = event.touches[0];
        if (touch) send({ type: "move", y: touch.clientY, threshold });
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
