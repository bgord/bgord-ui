// cspell:disable
import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useMetaEnterSubmit } from "../src/hooks/use-meta-enter-submit";

afterEach(() => cleanup());

function TestComponent(props: React.JSX.IntrinsicElements["form"]) {
  const metaEnterSubmit = useMetaEnterSubmit();

  return (
    <form {...props}>
      <textarea {...metaEnterSubmit} data-testid="textarea" />
    </form>
  );
}

describe("useMetaEnterSubmit", () => {
  test("happy path", () => {
    const submitSpy = jest.fn();

    render(<TestComponent onSubmit={submitSpy} />);
    const result = screen.getByTestId("textarea");

    fireEvent.keyDown(result, { key: "Enter", metaKey: true });
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });

  test("enter without meta", () => {
    const submitSpy = jest.fn();

    render(<TestComponent onSubmit={submitSpy} />);
    const result = screen.getByTestId("textarea");

    fireEvent.keyDown(result, { key: "Enter" });

    expect(submitSpy).not.toHaveBeenCalled();
  });

  test("meta without enter", () => {
    const submitSpy = jest.fn();

    render(<TestComponent onSubmit={submitSpy} />);
    const result = screen.getByTestId("textarea");

    fireEvent.keyDown(result, { metaKey: true });

    expect(submitSpy).not.toHaveBeenCalled();
  });

  test("ignores other modifiers", () => {
    const submitSpy = jest.fn();

    render(<TestComponent onSubmit={submitSpy} />);
    const result = screen.getByTestId("textarea");

    fireEvent.keyDown(result, { key: "Enter", ctrlKey: true });
    expect(submitSpy).not.toHaveBeenCalled();

    fireEvent.keyDown(result, { key: "Enter", shiftKey: true });
    expect(submitSpy).not.toHaveBeenCalled();

    fireEvent.keyDown(result, { key: "Enter", altKey: true });
    expect(submitSpy).not.toHaveBeenCalled();
  });

  test("onKeyDown handler keeps the identity", () => {
    const handlers = [];

    function TestComponent() {
      const props = useMetaEnterSubmit();
      handlers.push(props.onKeyDown);
      return <textarea {...props} data-testid="textarea" />;
    }

    const { rerender } = render(<TestComponent />);
    rerender(<TestComponent />);

    expect(handlers[0]).toEqual(handlers[1]);
  });
});
