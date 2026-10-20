import { describe, expect, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useWindowDimensions } from "../src/hooks/use-window-dimensions";

function Testcase() {
  return JSON.stringify(useWindowDimensions());
}

describe("useWindowDimensions", () => {
  test("happy path", () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });

    const { result } = renderHook(() => useWindowDimensions());

    expect(result.current).toEqual({ width: 1024, height: 768 });

    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
  });

  test("resize - width", () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });

    const { result } = renderHook(() => useWindowDimensions());
    act(() => {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toEqual({ width: 1280, height: 600 });

    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
  });

  test("resize - height", () => {
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 600 });

    const { result } = renderHook(() => useWindowDimensions());
    act(() => {
      Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toEqual({ width: 800, height: 800 });

    Object.defineProperty(window, "innerWidth", { configurable: true, value: originalInnerWidth });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: originalInnerHeight });
  });

  test("unmount", () => {
    using _ = spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useWindowDimensions());

    unmount();

    expect(_).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  test("snapshot reference stability", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 900 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 700 });

    const { result } = renderHook(() => useWindowDimensions());
    const first = result.current;
    act(() => window.dispatchEvent(new Event("resize")));
    const second = result.current;

    expect(second).toBe(first);
  });

  test("server", () => {
    const html = renderToString(<Testcase />);

    expect(html).toEqual("{}");
  });
});
