// -----------------------------------------------------------------------------
// useClickOutside.test.tsx  (run with `bun test`)
// -----------------------------------------------------------------------------

import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import React, { useRef } from "react";
import { useClickOutside } from "../src/hooks/use-click-outside";

afterEach(() => cleanup());

function TestComponent({ handler }: { handler: (e: MouseEvent | TouchEvent) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler);
  return (
    <div data-testid="box" ref={ref}>
      box
    </div>
  );
}

describe("useClickOutside", () => {
  test("calls handler on mousedown outside the element", () => {
    const handler = jest.fn();
    render(<TestComponent handler={handler} />);

    fireEvent.mouseDown(document.body);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("does NOT call handler when clicking inside the element", () => {
    const handler = jest.fn();
    const { getByTestId } = render(<TestComponent handler={handler} />);

    fireEvent.mouseDown(getByTestId("box"));

    expect(handler).not.toHaveBeenCalled();
  });

  test("removes listeners on unmount", () => {
    const handler = jest.fn();
    const { unmount } = render(<TestComponent handler={handler} />);

    unmount();
    fireEvent.mouseDown(document.body);

    expect(handler).not.toHaveBeenCalled();
  });
});
