import { useSyncExternalStore } from "react";

export type WindowDimensions = { width: number | undefined; height: number | undefined };

const DefaultWindowDimensions: WindowDimensions = { width: undefined, height: undefined };

const WindowDimensionsStore = {
  subscribe: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    window.addEventListener("resize", callback);

    return () => window.removeEventListener("resize", callback);
  },
  getSnapshot: (): WindowDimensions => {
    if (typeof window === "undefined") return DefaultWindowDimensions;
    return { width: window.innerWidth, height: window.innerHeight };
  },
  getServerSnapshot: (): WindowDimensions => DefaultWindowDimensions,
};

export function useWindowDimensions(): WindowDimensions {
  return useSyncExternalStore(
    WindowDimensionsStore.subscribe,
    WindowDimensionsStore.getSnapshot,
    WindowDimensionsStore.getServerSnapshot,
  );
}
