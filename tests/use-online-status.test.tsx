import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { OnlineStatus, useOnlineStatus } from "../src/hooks/use-online-status";

describe("useOnlineStatus", () => {
  test("online", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toEqual(OnlineStatus.online);
  });

  test("offline", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toEqual(OnlineStatus.offline);
  });

  test("transitions", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toEqual(OnlineStatus.online);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
      window.dispatchEvent(new Event("offline"));
    });
    expect(result.current).toEqual(OnlineStatus.offline);

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
      window.dispatchEvent(new Event("online"));
    });
    expect(result.current).toEqual(OnlineStatus.online);
  });
});
