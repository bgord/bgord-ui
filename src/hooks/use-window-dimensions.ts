import { useSyncExternalStore } from "react";

export type WindowDimensions = { width: number | undefined; height: number | undefined };

const DefaultWindowDimensions: WindowDimensions = { width: undefined, height: undefined };

let snapshot: WindowDimensions = DefaultWindowDimensions;

const WindowDimensionsStore = {
  subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  },

  getSnapshot(): WindowDimensions {
    if (typeof window === "undefined") return DefaultWindowDimensions;

    const width = window.innerWidth;
    const height = window.innerHeight;

    if (snapshot.width === width && snapshot.height === height) return snapshot;

    snapshot = { width, height };

    return snapshot;
  },

  getServerSnapshot(): WindowDimensions {
    return DefaultWindowDimensions;
  },
};

export function useWindowDimensions(): WindowDimensions {
  return useSyncExternalStore(
    WindowDimensionsStore.subscribe,
    WindowDimensionsStore.getSnapshot,
    WindowDimensionsStore.getServerSnapshot,
  );
}
