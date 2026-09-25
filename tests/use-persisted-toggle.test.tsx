import { beforeEach, describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { usePersistedToggle } from "../src/hooks/use-persisted-toggle";

describe("usePersistedToggle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("default value - no stored value", () => {
    const hook = renderHook(() => usePersistedToggle({ name: "test" }));

    expect(hook.result.current.on).toEqual(false);
    expect(hook.result.current.off).toEqual(true);
  });

  test("default value - true, no stored value", () => {
    const hook = renderHook(() => usePersistedToggle({ name: "test", defaultValue: true }));

    expect(hook.result.current.on).toEqual(true);
    expect(hook.result.current.off).toEqual(false);
  });

  test("reads stored value - on", () => {
    localStorage.setItem("toggle:test", "on");

    const hook = renderHook(() => usePersistedToggle({ name: "test" }));

    expect(hook.result.current.on).toEqual(true);
    expect(hook.result.current.off).toEqual(false);
  });

  test("reads stored value - off", () => {
    localStorage.setItem("toggle:test", "off");

    const hook = renderHook(() => usePersistedToggle({ name: "test", defaultValue: true }));

    expect(hook.result.current.on).toEqual(false);
    expect(hook.result.current.off).toEqual(true);
  });

  test("ignores invalid stored value", () => {
    localStorage.setItem("toggle:test", "invalid");

    const hook = renderHook(() => usePersistedToggle({ name: "test", defaultValue: true }));

    expect(hook.result.current.on).toEqual(false);
  });

  test("enable persists value", () => {
    const hook = renderHook(() => usePersistedToggle({ name: "test" }));

    act(() => hook.result.current.enable());

    expect(hook.result.current.on).toEqual(true);
    expect(localStorage.getItem("toggle:test")).toEqual("on");
  });

  test("disable persists value", () => {
    const hook = renderHook(() => usePersistedToggle({ name: "test", defaultValue: true }));

    act(() => hook.result.current.disable());

    expect(hook.result.current.on).toEqual(false);
    expect(localStorage.getItem("toggle:test")).toEqual("off");
  });

  test("toggle persists value", () => {
    const hook = renderHook(() => usePersistedToggle({ name: "test" }));

    act(() => hook.result.current.toggle());

    expect(hook.result.current.on).toEqual(true);
    expect(localStorage.getItem("toggle:test")).toEqual("on");

    act(() => hook.result.current.toggle());

    expect(hook.result.current.on).toEqual(false);
    expect(localStorage.getItem("toggle:test")).toEqual("off");
  });

  test("persists across remounts with different names", () => {
    const first = renderHook(() => usePersistedToggle({ name: "first" }));

    act(() => first.result.current.enable());

    const second = renderHook(() => usePersistedToggle({ name: "second" }));

    expect(second.result.current.on).toEqual(false);
  });

  test("stored value from another instance is picked up on mount", () => {
    localStorage.setItem("toggle:shared", "on");

    const hook = renderHook(() => usePersistedToggle({ name: "shared" }));

    expect(hook.result.current.on).toEqual(true);
  });
});
