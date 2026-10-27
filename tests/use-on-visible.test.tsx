import { describe, expect, jest, spyOn, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useOnVisible } from "../src/hooks/use-on-visible";

describe("useOnVisible", () => {
  test("mount", () => {
    const handler = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });

    renderHook(() => useOnVisible(handler));

    expect(handler).not.toHaveBeenCalled();
  });

  test("visibilitychange - visible", () => {
    const handler = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    renderHook(() => useOnVisible(handler));

    document.dispatchEvent(new Event("visibilitychange"));

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("visibilitychange - hidden", () => {
    const handler = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    renderHook(() => useOnVisible(handler));

    document.dispatchEvent(new Event("visibilitychange"));

    expect(handler).not.toHaveBeenCalled();
  });

  test("handler change", () => {
    const first = jest.fn();
    const second = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { rerender } = renderHook(({ handler }) => useOnVisible(handler), {
      initialProps: { handler: first },
    });
    rerender({ handler: second });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("unmount", () => {
    const handler = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useOnVisible(handler));
    using removeEventListener = spyOn(document, "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });

  test("unmount - visibilitychange", () => {
    const handler = jest.fn();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useOnVisible(handler));
    unmount();

    document.dispatchEvent(new Event("visibilitychange"));

    expect(handler).not.toHaveBeenCalled();
  });
});
