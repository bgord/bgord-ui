import { describe, expect, test } from "bun:test";
import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useFocusKeyboardShortcut } from "../src/hooks/use-focus-shortcut";

function Testcase(props: { shortcut: string }) {
  const shortcut = useFocusKeyboardShortcut(props.shortcut);

  return <input data-testid="field" {...shortcut} />;
}

describe("useFocusKeyboardShortcut", () => {
  test("happy path", () => {
    render(<Testcase shortcut="k" />);
    const field = screen.getByTestId("field");

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(document.activeElement).toBe(field);
  });

  test("other key", () => {
    render(<Testcase shortcut="k" />);
    const field = screen.getByTestId("field");

    fireEvent.keyDown(window, { key: "x", code: "KeyX" });

    expect(document.activeElement).not.toBe(field);
  });

  test("shortcut change - old shortcut", () => {
    const { rerender } = render(<Testcase shortcut="k" />);
    const field = screen.getByTestId("field");
    rerender(<Testcase shortcut="x" />);

    fireEvent.keyDown(window, { key: "k", code: "KeyK" });

    expect(document.activeElement).not.toBe(field);
  });

  test("shortcut change - new shortcut", () => {
    const { rerender } = render(<Testcase shortcut="k" />);
    const field = screen.getByTestId("field");
    rerender(<Testcase shortcut="x" />);

    fireEvent.keyDown(window, { key: "x", code: "KeyX" });

    expect(document.activeElement).toBe(field);
  });

  test("ref keeps the identity", () => {
    const hook = renderHook(({ shortcut }) => useFocusKeyboardShortcut<HTMLInputElement>(shortcut), {
      initialProps: { shortcut: "k" },
    });
    const ref = hook.result.current.ref;

    hook.rerender({ shortcut: "k" });

    expect(hook.result.current.ref).toBe(ref);
  });

  test("ref keeps the identity - shortcut change", () => {
    const hook = renderHook(({ shortcut }) => useFocusKeyboardShortcut<HTMLInputElement>(shortcut), {
      initialProps: { shortcut: "k" },
    });
    const ref = hook.result.current.ref;

    hook.rerender({ shortcut: "x" });

    expect(hook.result.current.ref).toBe(ref);
  });
});
