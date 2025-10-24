// cspell:disable
import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useHover } from "../src/hooks/use-hover";

afterEach(() => cleanup());

describe("useHover", () => {
  test("initializes with isHovering false", () => {
    function TestComponent() {
      const { attach, isHovering } = useHover();
      return (
        <div ref={attach.ref} data-testid="hoverable">
          {isHovering.toString()}
        </div>
      );
    }

    render(<TestComponent />);
    const el = screen.getByTestId("hoverable");
    expect(el.textContent).toEqual("false");
  });

  test("pointerenter and pointerleave toggle hover state", () => {
    function TestComponent() {
      const { attach, isHovering } = useHover();
      return (
        <div ref={attach.ref} data-testid="hoverable">
          {isHovering ? "hover" : "no-hover"}
        </div>
      );
    }

    render(<TestComponent />);
    const el = screen.getByTestId("hoverable");

    // Initially not hovering
    expect(el).toHaveTextContent("no-hover");

    // Entering
    fireEvent.pointerEnter(el);
    expect(el).toHaveTextContent("hover");

    // Leaving
    fireEvent.pointerLeave(el);
    expect(el).toHaveTextContent("no-hover");
  });

  test("disabled config prevents hover detection", () => {
    function TestComponent() {
      const { attach, isHovering } = useHover({ enabled: false });
      return (
        <div ref={attach.ref} data-testid="hoverable">
          {isHovering.toString()}
        </div>
      );
    }

    render(<TestComponent />);
    const el = screen.getByTestId("hoverable");

    // Always false even when events fire
    expect(el.textContent).toEqual("false");
    fireEvent.pointerEnter(el);
    expect(el.textContent).toEqual("false");
    fireEvent.pointerLeave(el);
    expect(el.textContent).toEqual("false");
  });
});
