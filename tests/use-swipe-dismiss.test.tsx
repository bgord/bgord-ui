import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useSwipeDismiss } from "../src/hooks/use-swipe-dismiss";

function Sheet(props: { onDismiss: () => void; enabled?: boolean }) {
  const swipe = useSwipeDismiss(props);

  return (
    <dialog data-testid="sheet" open>
      <div data-testid="handle" {...swipe} />
    </dialog>
  );
}

function setup(props: { onDismiss: () => void; enabled?: boolean }, reduced = true) {
  spyOn(window, "matchMedia").mockImplementation(
    (query: string) => ({ matches: reduced, media: query }) as MediaQueryList,
  );
  render(<Sheet {...props} />);
  const sheet = screen.getByTestId("sheet");
  Object.defineProperty(sheet, "offsetHeight", { value: 400 });

  return { sheet, handle: screen.getByTestId("handle") };
}

function at(ms: number) {
  spyOn(performance, "now").mockReturnValue(ms);
}

function settle(sheet: HTMLElement) {
  const event = new Event("transitionend") as TransitionEvent;
  Object.defineProperty(event, "propertyName", { value: "translate" });
  sheet.dispatchEvent(event);
}

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

describe("useSwipeDismiss", () => {
  test("follows the pointer", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });

    expect(sheet.style.translate).toEqual("0 60px");
  });

  test("ignores dragging up", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 40 });

    expect(sheet.style.translate).toEqual("0 0px");
  });

  test("dismisses past the threshold", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 260 });
    at(1000);
    fireEvent.pointerUp(handle, { clientY: 260 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toEqual("");
  });

  test("dismisses on a flick", () => {
    const onDismiss = jest.fn();
    const { handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    at(50);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("springs back below the threshold", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    at(1000);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
  });

  test("springs back on cancel", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 300 });
    fireEvent.pointerCancel(handle);

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
  });

  test("animates out before dismissing", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss }, false);

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 260 });
    at(1000);
    fireEvent.pointerUp(handle, { clientY: 260 });

    expect(sheet.style.translate).toEqual("0 100%");
    expect(onDismiss).toHaveBeenCalledTimes(0);

    settle(sheet);

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(sheet.style.translate).toEqual("");
  });

  test("animates back before resetting", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss }, false);

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 160 });
    at(1000);
    fireEvent.pointerUp(handle, { clientY: 160 });

    expect(sheet.style.transition).not.toEqual("");

    settle(sheet);

    expect(sheet.style.transition).toEqual("");
    expect(onDismiss).toHaveBeenCalledTimes(0);
  });

  test("disabled", () => {
    const onDismiss = jest.fn();
    const { sheet, handle } = setup({ onDismiss, enabled: false });

    at(0);
    fireEvent.pointerDown(handle, { clientY: 100, isPrimary: true });
    fireEvent.pointerMove(handle, { clientY: 300 });
    at(50);
    fireEvent.pointerUp(handle, { clientY: 300 });

    expect(onDismiss).toHaveBeenCalledTimes(0);
    expect(sheet.style.translate).toEqual("");
    expect(handle.style.touchAction).toEqual("");
  });

  test("enabled - handle style", () => {
    const { handle } = setup({ onDismiss: jest.fn() });

    expect(handle.style.touchAction).toEqual("none");
    expect(handle.style.userSelect).toEqual("none");
  });
});
