// cspell:disable
import { afterEach, describe, expect, jest, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useMetaEnterSubmit } from "../src/hooks/use-meta-enter-submit";

afterEach(() => cleanup());

describe("useMetaEnterSubmit", () => {
  test("returns stable onKeyDown handler", () => {
    const handlers = [];

    function TestComponent() {
      const props = useMetaEnterSubmit();
      handlers.push(props.onKeyDown);
      return <textarea {...props} data-testid="textarea" />;
    }

    const { rerender } = render(<TestComponent />);
    rerender(<TestComponent />);

    // Handler should be stable across rerenders
    expect(handlers[0]).toBe(handlers[1]);
  });

  test("submits form on Meta+Enter", () => {
    const mockSubmit = jest.fn();

    function TestComponent() {
      const props = useMetaEnterSubmit();
      return (
        <form onSubmit={mockSubmit}>
          <textarea {...props} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test("does not submit on Enter without Meta key", () => {
    const mockSubmit = jest.fn();

    function TestComponent() {
      const props = useMetaEnterSubmit();
      return (
        <form onSubmit={mockSubmit}>
          <textarea {...props} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test("does not submit on Meta without Enter key", () => {
    const mockSubmit = jest.fn();

    function TestComponent() {
      const props = useMetaEnterSubmit();
      return (
        <form onSubmit={mockSubmit}>
          <textarea {...props} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.keyDown(textarea, { key: "a", metaKey: true });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test("handles textarea without form gracefully", () => {
    function TestComponent() {
      const props = useMetaEnterSubmit();
      return <textarea {...props} data-testid="textarea" />;
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    // Should not throw an error
    expect(() => {
      fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });
    }).not.toThrow();
  });

  test("works with Cmd+Enter on Mac (metaKey)", () => {
    const mockSubmit = jest.fn();

    function TestComponent() {
      const props = useMetaEnterSubmit();
      return (
        <form onSubmit={mockSubmit}>
          <textarea {...props} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    // Simulate Cmd+Enter on Mac
    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });

    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test("ignores other modifier keys with Enter", () => {
    const mockSubmit = jest.fn();

    function TestComponent() {
      const props = useMetaEnterSubmit();
      return (
        <form onSubmit={mockSubmit}>
          <textarea {...props} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    // Ctrl+Enter should not trigger
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });
    expect(mockSubmit).not.toHaveBeenCalled();

    // Shift+Enter should not trigger
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(mockSubmit).not.toHaveBeenCalled();

    // Alt+Enter should not trigger
    fireEvent.keyDown(textarea, { key: "Enter", altKey: true });
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test("can be combined with other event handlers", () => {
    const mockKeyDown = jest.fn();
    const mockSubmit = jest.fn();

    function TestComponent() {
      const { onKeyDown: metaEnterHandler } = useMetaEnterSubmit();

      const handleKeyDown = (e) => {
        mockKeyDown(e);
        metaEnterHandler(e);
      };

      return (
        <form onSubmit={mockSubmit}>
          <textarea onKeyDown={handleKeyDown} data-testid="textarea" />
        </form>
      );
    }

    render(<TestComponent />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.keyDown(textarea, { key: "Enter", metaKey: true });

    expect(mockKeyDown).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
