// cspell:disable
import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { useHover } from "../src/hooks/use-hover";

function TestComponent(props: { enabled: boolean } = { enabled: true }) {
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
    render(<TestComponent enabled={true} />);
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
});
