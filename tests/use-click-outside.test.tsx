import { describe, expect, jest, spyOn, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { useClickOutside } from "../src/hooks/use-click-outside";

function Box({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onOutside);
  return (
    <div data-testid="box" ref={ref} style={{ padding: 20 }}>
      inner
    </div>
  );
}

function Dialog({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useClickOutside(ref, onOutside);
  return (
    <dialog
      data-testid="dialog"
      ref={ref}
      style={{ padding: 20, position: "fixed", top: "40%", left: "40%" }}
    >
      <div data-testid="dlg-inner">dialog-content</div>
    </dialog>
  );
}

describe("useClickOutside", () => {
  test("click outside - div", () => {
    const clickHandlerSpy = jest.fn();
    render(<Box onOutside={clickHandlerSpy} />);

    fireEvent.mouseDown(document.body);

    expect(clickHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test("click outside - backdrop", () => {
    const clickHandlerSpy = jest.fn();
    render(<Dialog onOutside={clickHandlerSpy} />);
    const dialog = screen.getByTestId("dialog");
    Object.defineProperty(dialog, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 300,
        width: 200,
        height: 200,
        x: 100,
        y: 100,
        toJSON: () => {},
      }),
    });

    fireEvent.mouseDown(dialog, { clientX: 0, clientY: 0, bubbles: true });

    expect(clickHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test("click inside - div", () => {
    const clickHandlerSpy = jest.fn();
    render(<Box onOutside={clickHandlerSpy} />);

    fireEvent.mouseDown(screen.getByTestId("box"));

    expect(clickHandlerSpy).toHaveBeenCalledTimes(0);
  });

  test.each([
    ["left", 50, 200],
    ["right", 350, 200],
    ["top", 200, 50],
    ["bottom", 200, 350],
  ])("click outside - backdrop - %s", (_side, clientX, clientY) => {
    const clickHandlerSpy = jest.fn();
    render(<Dialog onOutside={clickHandlerSpy} />);
    const dialog = screen.getByTestId("dialog");
    Object.defineProperty(dialog, "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 300,
        width: 200,
        height: 200,
        x: 100,
        y: 100,
        toJSON: () => {},
      }),
    });

    fireEvent.mouseDown(dialog, { clientX, clientY, bubbles: true });

    expect(clickHandlerSpy).toHaveBeenCalledTimes(1);
  });

  test("click inside - dialog", () => {
    const clickHandlerSpy = jest.fn();
    render(<Dialog onOutside={clickHandlerSpy} />);
    Object.defineProperty(screen.getByTestId("dialog"), "getBoundingClientRect", {
      value: () => ({
        left: 100,
        top: 100,
        right: 300,
        bottom: 300,
        width: 200,
        height: 200,
        x: 100,
        y: 100,
        toJSON: () => {},
      }),
    });

    fireEvent.mouseDown(screen.getByTestId("dlg-inner"), { clientX: 0, clientY: 0 });

    expect(clickHandlerSpy).toHaveBeenCalledTimes(0);
  });

  test("handler change", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = render(<Box onOutside={first} />);
    rerender(<Box onOutside={second} />);

    fireEvent.mouseDown(document.body);

    expect(first).toHaveBeenCalledTimes(0);
    expect(second).toHaveBeenCalledTimes(1);
  });

  test("removes listeners on unmount", () => {
    const clickHandlerSpy = jest.fn();
    const { unmount } = render(<Box onOutside={clickHandlerSpy} />);
    using removeEventListener = spyOn(document, "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("mousedown", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("touchstart", expect.any(Function));
  });
});
