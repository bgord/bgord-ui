import { describe, expect, spyOn, test } from "bun:test";
import { fireEvent, renderHook } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { useShortcuts } from "../src/hooks/use-shortcuts";

const handlers = { k: (_event: KeyboardEvent) => {} };

describe("useKeyboardShortcuts", () => {
  test("happy path", () => {
    using handlerSpy = spyOn(handlers, "k");
    renderHook(() => useShortcuts(handlers));

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  test("other key", () => {
    using handlerSpy = spyOn(handlers, "k");
    renderHook(() => useShortcuts(handlers));

    fireEvent.keyDown(window, { key: "x", code: "KeyX" });

    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("disabled", () => {
    using handlerSpy = spyOn(handlers, "k");
    renderHook(() => useShortcuts(handlers, { enabled: false }));

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("toggle - disabled", () => {
    using handlerSpy = spyOn(handlers, "k");
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useShortcuts(handlers, { enabled }),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("toggle - enabled again", () => {
    using handlerSpy = spyOn(handlers, "k");
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useShortcuts(handlers, { enabled }),
      { initialProps: { enabled: true } },
    );
    rerender({ enabled: false });
    rerender({ enabled: true });

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  test("cleanup", () => {
    using handlerSpy = spyOn(handlers, "k");
    const { unmount } = renderHook(() => useShortcuts(handlers, { enabled: true }));
    unmount();

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("ignores non-matching keys", () => {
    using handlerSpy = spyOn(handlers, "k");
    renderHook(() => useShortcuts(handlers));

    fireEvent.keyDown(window, { key: "x", code: "KeyX" });

    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("changed callbacks", () => {
    const old = { k: (_event: KeyboardEvent) => {} };
    const updated = { k: (_event: KeyboardEvent) => {} };
    using oldHandlerSpy = spyOn(old, "k");
    using updatedHandlerSpy = spyOn(updated, "k");
    const { rerender } = renderHook(({ callback }) => useShortcuts({ k: callback }, { enabled: true }), {
      initialProps: { callback: old.k },
    });
    rerender({ callback: updated.k });

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(oldHandlerSpy).toHaveBeenCalledTimes(0);
    expect(updatedHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test("changed callbacks - before effects", () => {
    const old = { k: (_event: KeyboardEvent) => {} };
    const updated = { k: (_event: KeyboardEvent) => {} };
    using oldHandlerSpy = spyOn(old, "k");
    using updatedHandlerSpy = spyOn(updated, "k");
    const { rerender } = renderHook(
      ({ callback, press }) => {
        useShortcuts({ k: callback });
        useLayoutEffect(() => {
          if (press) fireEvent.keyDown(window, { key: "k", code: "KeyK" });
        });
      },
      { initialProps: { callback: old.k, press: false } },
    );

    rerender({ callback: updated.k, press: true });

    expect(oldHandlerSpy).toHaveBeenCalledTimes(0);
    expect(updatedHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test("toggle - enabled before effects", () => {
    using handlerSpy = spyOn(handlers, "k");
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => {
        useShortcuts(handlers, { enabled });
        useLayoutEffect(() => {
          if (enabled) fireEvent.keyDown(window, { key: "k", code: "KeyK" });
        });
      },
      { initialProps: { enabled: false } },
    );

    rerender({ enabled: true });

    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  test("changed keys", () => {
    using handlerSpy = spyOn(handlers, "k");
    const { rerender } = renderHook(({ config }) => useShortcuts(config), {
      initialProps: { config: {} as Record<string, (event: KeyboardEvent) => void> },
    });
    rerender({ config: handlers });

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });
});
