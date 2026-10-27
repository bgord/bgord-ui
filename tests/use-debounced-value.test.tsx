import { describe, expect, spyOn, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedValue } from "../src/hooks/use-debounced-value";

describe("useDebouncedValue", () => {
  test("mount", () => {
    const { result } = renderHook(() => useDebouncedValue("a", 20));

    expect(result.current).toEqual("a");
  });

  test("change - before delay", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });

    await act(() => new Promise((resolve) => setTimeout(resolve, 5)));

    expect(result.current).toEqual("a");
  });

  test("change - after delay", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });

    await act(() => new Promise((resolve) => setTimeout(resolve, 40)));

    expect(result.current).toEqual("b");
  });

  test("change - restarts delay", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    await act(() => new Promise((resolve) => setTimeout(resolve, 10)));
    rerender({ value: "c" });

    await act(() => new Promise((resolve) => setTimeout(resolve, 15)));

    expect(result.current).toEqual("a");
  });

  test("change - settles on last value", async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 20), {
      initialProps: { value: "a" },
    });
    rerender({ value: "b" });
    rerender({ value: "c" });

    await act(() => new Promise((resolve) => setTimeout(resolve, 40)));

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
