import { describe, expect, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useScrollLock } from "../src/hooks/use-scroll-lock";

describe("useScrollLock", () => {
  test("enabled", () => {
    renderHook(() => useScrollLock());

    expect(document.body.style.overflow).toEqual("hidden");
  });

  test("disabled", () => {
    renderHook(() => useScrollLock(false));

    expect(document.body.style.overflow).not.toEqual("hidden");
  });

  test("unmount", () => {
    const { unmount } = renderHook(() => useScrollLock(true));

    unmount();

    expect(document.body.style.overflow).toEqual("");
  });

  test("two locks - out of order", () => {
    const first = renderHook(() => useScrollLock(true));
    renderHook(() => useScrollLock(true));

    first.unmount();

    expect(document.body.style.overflow).toEqual("hidden");
  });

  test("two locks - all released", () => {
    const first = renderHook(() => useScrollLock(true));
    const second = renderHook(() => useScrollLock(true));
    first.unmount();

    second.unmount();

    expect(document.body.style.overflow).toEqual("");
  });

  test("disabled - unmount", () => {
    const disabled = renderHook(() => useScrollLock(false));
    renderHook(() => useScrollLock(true));

    disabled.unmount();

    expect(document.body.style.overflow).toEqual("hidden");
  });

  test("toggle - disable", () => {
    const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
      initialProps: { enabled: true },
    });

    rerender({ enabled: false });

    expect(document.body.style.overflow).toEqual("");
  });

  test("toggle - enable", () => {
    const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
      initialProps: { enabled: true },
    });
    rerender({ enabled: false });

    rerender({ enabled: true });

    expect(document.body.style.overflow).toEqual("hidden");
  });
});
