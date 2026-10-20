import { describe, expect, jest, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useWakeLock } from "../src/hooks/use-wake-lock";

describe("useWakeLock", () => {
  test("enabled", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });

    renderHook(() => useWakeLock());

    expect(request).toHaveBeenCalledWith("screen");
  });

  test("disabled", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });

    renderHook(() => useWakeLock(false));

    expect(request).not.toHaveBeenCalled();
  });

  test("unsupported", () => {
    Reflect.deleteProperty(window.navigator, "wakeLock");

    expect(() => renderHook(() => useWakeLock())).not.toThrow();
  });

  test("hidden", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });

    renderHook(() => useWakeLock());

    expect(request).not.toHaveBeenCalled();
  });

  test("rejected", async () => {
    const request = jest.fn().mockRejectedValue(new Error("NotAllowedError"));
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useWakeLock());

    unmount();

    await act(async () => {});
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("visibilitychange - visible", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    renderHook(() => useWakeLock());

    document.dispatchEvent(new Event("visibilitychange"));

    expect(request).toHaveBeenCalledTimes(2);
  });

  test("visibilitychange - hidden", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    renderHook(() => useWakeLock());
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });

    document.dispatchEvent(new Event("visibilitychange"));

    expect(request).toHaveBeenCalledTimes(1);
  });

  test("unmount", async () => {
    const release = jest.fn();
    const request = jest.fn().mockResolvedValue({ release });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useWakeLock());

    unmount();

    await act(async () => {});
    expect(release).toHaveBeenCalledTimes(1);
  });

  test("unmount - visibilitychange", () => {
    const request = jest.fn().mockResolvedValue({ release: jest.fn() });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useWakeLock());
    unmount();

    document.dispatchEvent(new Event("visibilitychange"));

    expect(request).toHaveBeenCalledTimes(1);
  });

  test("unmount - reacquired", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const request = jest
      .fn()
      .mockResolvedValueOnce({ release: first })
      .mockResolvedValueOnce({ release: second });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { unmount } = renderHook(() => useWakeLock());
    document.dispatchEvent(new Event("visibilitychange"));

    unmount();

    await act(async () => {});
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("toggle - disable", async () => {
    const release = jest.fn();
    const request = jest.fn().mockResolvedValue({ release });
    Object.defineProperty(window.navigator, "wakeLock", { configurable: true, value: { request } });
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
    const { rerender } = renderHook(({ enabled }) => useWakeLock(enabled), {
      initialProps: { enabled: true },
    });

    rerender({ enabled: false });

    await act(async () => {});
    expect(release).toHaveBeenCalledTimes(1);
  });
});
