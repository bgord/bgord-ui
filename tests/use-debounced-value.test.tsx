import { describe, expect, jest, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "../src/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  test("mount", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 20));

    expect(result.current).toEqual("a");
  });

  test("change - before delay", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });

    act(() => jest.advanceTimersByTime(5));

    expect(result.current).toEqual("a");
  });

  test("change - after delay", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });

    act(() => jest.advanceTimersByTime(40));

    expect(result.current).toEqual("b");
  });

  test("change - restarts delay", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    act(() => jest.advanceTimersByTime(10));
    rerender({ value: "c" });

    act(() => jest.advanceTimersByTime(15));

    expect(result.current).toEqual("a");
  });

  test("change - settles on last value", () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    rerender({ value: "c" });

    act(() => jest.advanceTimersByTime(40));

    expect(result.current).toEqual("c");
  });

  test("unmount", () => {
    const { rerender, unmount } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    using clearTimeout = spyOn(globalThis, "clearTimeout");

    unmount();

    expect(clearTimeout).toHaveBeenCalled();
  });
});
