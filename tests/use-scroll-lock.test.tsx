import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, renderHook } from "@testing-library/react";
import { useScrollLock } from "../src/hooks/use-scroll-lock";

afterEach(() => cleanup());

describe("useScrollLock", () => {
  test("enabled", () => {
    renderHook(() => useScrollLock(true));

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

  test("toggle", () => {
    const { rerender } = renderHook(({ enabled }) => useScrollLock(enabled), {
      initialProps: { enabled: true },
    });

    expect(document.body.style.overflow).toEqual("hidden");

    rerender({ enabled: false });
    expect(document.body.style.overflow).not.toEqual("hidden");

    rerender({ enabled: true });
    expect(document.body.style.overflow).toEqual("hidden");
  });
});
