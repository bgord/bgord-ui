import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import React, { useRef } from "react";
import { useClickOutside } from "../src/hooks/use-click-outside";

afterEach(() => cleanup());

function DivWrapper({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onOutside);
  return (
    <div data-testid="box" ref={ref}>
      content
    </div>
  );
}

function DialogWrapper({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useClickOutside(ref, onOutside);
  return <dialog ref={ref}>dialog</dialog>;
}

describe("useClickOutside", () => {
  test("calls handler on mousedown outside the element", () => {
    const onOutside = jest.fn();
    render(<DivWrapper onOutside={onOutside} />);

    fireEvent.mouseDown(document.body);

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  test("does NOT call handler when clicking inside the element", () => {
    const onOutside = jest.fn();
    const { getByTestId } = render(<DivWrapper onOutside={onOutside} />);

    fireEvent.mouseDown(getByTestId("box"));

    expect(onOutside).toHaveBeenCalledTimes(0);
  });

  test("calls handler when backdrop (dialog itself) is clicked", () => {
    const onOutside = jest.fn();
    const { container } = render(<DialogWrapper onOutside={onOutside} />);

    const dlg = container.querySelector("dialog") as HTMLDialogElement;
    fireEvent.mouseDown(dlg); // backdrop click → target === <dialog>

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  test("removes listeners on unmount", () => {
    const onOutside = jest.fn();
    const { unmount } = render(<DivWrapper onOutside={onOutside} />);

    unmount();
    fireEvent.mouseDown(document.body);

    expect(onOutside).toHaveBeenCalledTimes(0);
  });
});
