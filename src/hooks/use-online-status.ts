import { useSyncExternalStore } from "react";

export enum OnlineStatus {
  online = "online",
  offline = "offline",
}

const OnlineStatusStore = {
  subscribe: (callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);

    return () => {
      window.removeEventListener("online", callback);
      window.removeEventListener("offline", callback);
    };
  },
  getSnapshot: (): OnlineStatus => {
    if (typeof navigator === "undefined") return OnlineStatus.online;
    return navigator.onLine ? OnlineStatus.online : OnlineStatus.offline;
  },
  getServerSnapshot: (): OnlineStatus => OnlineStatus.online,
};

export function useOnlineStatus(): OnlineStatus {
  return useSyncExternalStore(
    OnlineStatusStore.subscribe,
    OnlineStatusStore.getSnapshot,
    OnlineStatusStore.getServerSnapshot,
  );
}
