import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

afterEach(() => cleanup());

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

  test("click inside - dialog", () => {
    const clickHandlerSpy = jest.fn();
    render(<Dialog onOutside={clickHandlerSpy} />);

    fireEvent.mouseDown(screen.getByTestId("dlg-inner"));

    expect(clickHandlerSpy).toHaveBeenCalledTimes(0);
  });

  test("removes listeners on unmount", () => {
    const clickHandlerSpy = jest.fn();
    const { unmount } = render(<Box onOutside={clickHandlerSpy} />);
    unmount();

    fireEvent.mouseDown(document.body);

    expect(clickHandlerSpy).toHaveBeenCalledTimes(0);
  });
});
