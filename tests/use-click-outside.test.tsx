// useClickOutside.test.tsx
import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import React, { useRef } from "react";
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
      data-testid="dlg"
      ref={ref}
      style={{
        padding: 20,
        position: "fixed",
        top: "40%",
        left: "40%",
      }}
    >
      <div data-testid="dlg-inner">dialog-content</div>
    </dialog>
  );
}

afterEach(() => cleanup());

describe("useClickOutside", () => {
  test("fires on outside click", () => {
    const spy = jest.fn();
    render(<Box onOutside={spy} />);
    fireEvent.mouseDown(document.body);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("ignores click on the element itself", () => {
    const spy = jest.fn();
    const { getByTestId } = render(<Box onOutside={spy} />);
    fireEvent.mouseDown(getByTestId("box")); // inside the div
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test("ignores click inside dialog content", () => {
    const spy = jest.fn();
    const { getByTestId } = render(<Dialog onOutside={spy} />);
    fireEvent.mouseDown(getByTestId("dlg-inner")); // inside dialog
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test("fires on dialog backdrop click (target === dialog, coords outside rect)", () => {
    const spy = jest.fn();
    const { getByTestId } = render(<Dialog onOutside={spy} />);
    const dlg = getByTestId("dlg") as HTMLDialogElement;

    /*  Stub a realistic bounding-box so the hook can decide  */
    Object.defineProperty(dlg, "getBoundingClientRect", {
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

    /*  Click at (0,0) – outside the stubbed rect  */
    fireEvent.mouseDown(dlg, { clientX: 0, clientY: 0, bubbles: true });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test("removes listeners on unmount", () => {
    const spy = jest.fn();
    const { unmount } = render(<Box onOutside={spy} />);
    unmount();
    fireEvent.mouseDown(document.body);
    expect(spy).toHaveBeenCalledTimes(0);
  });
});
