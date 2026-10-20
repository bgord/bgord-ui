import { useEffect } from "react";

const ScrollLockStore = {
  count: 0,
  original: "",

  acquire(): void {
    if (ScrollLockStore.count === 0) {
      ScrollLockStore.original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    ScrollLockStore.count++;
  },

  release(): void {
    ScrollLockStore.count--;

    if (ScrollLockStore.count === 0) document.body.style.overflow = ScrollLockStore.original;
  },
};

export function useScrollLock(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    ScrollLockStore.acquire();

    return () => ScrollLockStore.release();
  }, [enabled]);
}
