// cspell:disable
import { describe, expect, spyOn, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { useHover } from "../src/hooks/use-hover";

function TestComponent(props: { enabled?: boolean }) {
  const hover = useHover(props);

  return (
    <div data-testid="hoverable" ref={hover.attach.ref}>
      {hover.hovering.toString()}
    </div>
  );
}

describe("useHover", () => {
  test("default", () => {
    render(<TestComponent enabled />);

    expect(screen.getByTestId("hoverable").textContent).toEqual("false");
  });

  test("disabled", () => {
    render(<TestComponent enabled={false} />);
    const result = screen.getByTestId("hoverable");

    fireEvent.pointerEnter(result);

    expect(result.textContent).toEqual("false");
  });

  test("pointer enter", () => {
    render(<TestComponent />);
    const result = screen.getByTestId("hoverable");

    fireEvent.pointerEnter(result);

    expect(result.textContent).toEqual("true");
  });

  test("pointer leave", () => {
    render(<TestComponent enabled={true} />);
    const result = screen.getByTestId("hoverable");
    fireEvent.pointerEnter(result);

    fireEvent.pointerLeave(result);

    expect(result.textContent).toEqual("false");
  });

  test("enabled change", () => {
    const { rerender } = render(<TestComponent enabled={false} />);
    rerender(<TestComponent enabled={true} />);
    const result = screen.getByTestId("hoverable");

    fireEvent.pointerEnter(result);

    expect(result.textContent).toEqual("true");
  });

  test("unmount", () => {
    const { unmount } = render(<TestComponent />);
    using removeEventListener = spyOn(screen.getByTestId("hoverable"), "removeEventListener");

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith("pointerenter", expect.any(Function));
    expect(removeEventListener).toHaveBeenCalledWith("pointerleave", expect.any(Function));
  });

  test("mouse events fallback", () => {
    using stack = new DisposableStack();
    const original = window.PointerEvent;
    stack.defer(() => {
      window.PointerEvent = original;
    });
    Reflect.deleteProperty(window, "PointerEvent");
    render(<TestComponent />);
    const result = screen.getByTestId("hoverable");

    fireEvent.mouseEnter(result);

    expect(result.textContent).toEqual("true");

    fireEvent.mouseLeave(result);

    expect(result.textContent).toEqual("false");
  });
});
