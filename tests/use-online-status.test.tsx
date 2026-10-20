import { describe, expect, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { OnlineStatus, useOnlineStatus } from "../src/hooks/use-online-status";

function Testcase() {
  return useOnlineStatus();
}

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

  test("transitions - offline", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current).toEqual(OnlineStatus.offline);
  });

  test("transitions - online", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { configurable: true, value: true });
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current).toEqual(OnlineStatus.online);
  });

  test("unmount", () => {
    using removeEventListener = spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("online", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("offline", expect.any(Function));
  });

  test("server", () => {
    Object.defineProperty(window.navigator, "onLine", { configurable: true, value: false });

    const html = renderToString(<Testcase />);

    expect(html).toEqual("online");
  });
});
