import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, renderHook } from "@testing-library/react";
import { useScrollLock } from "../src/hooks/use-scroll-lock";

afterEach(() => cleanup());

describe("useScrollLock", () => {
  test("locks scroll when enabled", () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("restores scroll on unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  test("does not lock when disabled", () => {
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  test("toggles when enabled changes", () => {
    const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
      initialProps: { enabled: true },
    });

    expect(document.body.style.overflow).toBe("hidden");

    rerender({ enabled: false });
    expect(document.body.style.overflow).not.toBe("hidden");

    rerender({ enabled: true });
    expect(document.body.style.overflow).toBe("hidden");
  });
});
