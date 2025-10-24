// cspell:disable
import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useHover } from "../src/hooks/use-hover";

afterEach(() => cleanup());

function TestComponent(props: { enabled: boolean } = { enabled: true }) {
  const hover = useHover(props);

  return (
    <div ref={hover.attach.ref} data-testid="hoverable">
      {hover.isHovering.toString()}
    </div>
  );
}

describe("useHover", () => {
  test("default", () => {
    render(<TestComponent />);

    expect(screen.getByTestId("hoverable").textContent).toEqual("false");
  });

  test("disabled", () => {
    render(<TestComponent enabled={false} />);
    const result = screen.getByTestId("hoverable");

    expect(result.textContent).toEqual("false");

    fireEvent.pointerEnter(result);
    expect(result.textContent).toEqual("false");

    fireEvent.pointerLeave(result);
    expect(result.textContent).toEqual("false");
  });

  test("toggle", () => {
    render(<TestComponent />);
    const result = screen.getByTestId("hoverable");

    expect(result).toHaveTextContent("false");

    fireEvent.pointerEnter(result);
    expect(result).toHaveTextContent("true");

    fireEvent.pointerLeave(result);
    expect(result).toHaveTextContent("false");
  });
});
