import { useEffect } from "react";

export function useWakeLock(enabled = true): void {
  useEffect(() => {
    if (!(enabled && "wakeLock" in navigator)) return;

    let sentinel: Promise<WakeLockSentinel | undefined> = Promise.resolve(undefined);

    const request = () => {
      if (document.visibilityState !== "visible") return;

      sentinel = navigator.wakeLock.request("screen").catch(() => undefined);
    };

    request();
    document.addEventListener("visibilitychange", request);

    return () => {
      document.removeEventListener("visibilitychange", request);
      sentinel.then((lock) => lock?.release());
    };
  }, [enabled]);
}
