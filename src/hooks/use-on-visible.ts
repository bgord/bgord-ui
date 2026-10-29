import { useEffect, useEffectEvent } from "react";

export function useOnVisible(handler: () => void): void {
  const onVisible = useEffectEvent(handler);

  useEffect(() => {
    const listener = () => {
      if (document.visibilityState !== "visible") return;

      onVisible();
    };

    document.addEventListener("visibilitychange", listener);

    return () => document.removeEventListener("visibilitychange", listener);
    // Stryker disable next-line ArrayDeclaration: a constant non-empty deps array behaves identically to []
  }, []);
}
