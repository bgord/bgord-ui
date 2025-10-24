import { describe, expect, spyOn, test } from "bun:test";
import { fireEvent, renderHook } from "@testing-library/react";
import { useShortcuts } from "../src/hooks/use-shortcuts";

const handlers = { k: (_event: KeyboardEvent) => {} };

describe("useKeyboardShortcuts", () => {
  test("happy path", () => {
    const handlerSpy = spyOn(handlers, "k");

    renderHook(() => useShortcuts(handlers));

    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "x" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  test("disabled", () => {
    const handlerSpy = spyOn(handlers, "k");

    renderHook(() => useShortcuts(handlers, { enabled: false }));

    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("toggle", () => {
    const handlerSpy = spyOn(handlers, "k");

    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useShortcuts(handlers, { enabled }),
      { initialProps: { enabled: true } },
    );

    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });
    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);

    rerender({ enabled: true });
    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(2);
  });

  test("cleanup", () => {
    const handlerSpy = spyOn(handlers, "k");

    const { unmount } = renderHook(() => useShortcuts(handlers, { enabled: true }));

    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);

    unmount();
    fireEvent.keyDown(window, { key: "k" });
    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  test("ignores non-matching keys", () => {
    const handlerSpy = spyOn(handlers, "k");

    renderHook(() => useShortcuts(handlers));

    fireEvent.keyDown(window, { key: "x" });
    expect(handlerSpy).toHaveBeenCalledTimes(0);
  });

  test("changed callbacks", () => {
    const old = { k: (_event: KeyboardEvent) => {} };
    const updated = { k: (_event: KeyboardEvent) => {} };

    const oldHandlerSpy = spyOn(old, "k");
    const updatedHandlerSpy = spyOn(updated, "k");

    const { rerender } = renderHook(({ callback }) => useShortcuts({ k: callback }, { enabled: true }), {
      initialProps: { callback: old.k },
    });

    fireEvent.keyDown(window, { key: "k" });
    expect(oldHandlerSpy).toHaveBeenCalledTimes(1);
    expect(updatedHandlerSpy).toHaveBeenCalledTimes(0);

    rerender({ callback: updated.k });
    fireEvent.keyDown(window, { key: "k" });

    expect(oldHandlerSpy).toHaveBeenCalledTimes(1);
    expect(updatedHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
