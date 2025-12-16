import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useFocusKeyboardShortcut } from "../src/hooks/use-focus-shortcut";

afterEach(() => cleanup());

function Testcase(props: { shortcut: string }) {
  const shortcut = useFocusKeyboardShortcut(props.shortcut);

  return <input data-testid="field" {...shortcut} />;
}

describe("useFocusKeyboardShortcut", () => {
  test("happy path", () => {
    render(<Testcase shortcut="k" />);
    const field = screen.getByTestId("field");

    expect(field).not.toHaveFocus();

    fireEvent.keyDown(window, { key: "k" });

    expect(field).toHaveFocus();

    fireEvent.keyDown(window, { key: "x" });

    expect(field).toHaveFocus();
  });

  test("shortcut change", () => {
    const { rerender } = render(<Testcase shortcut="k" />);

    const field = screen.getByTestId("field") as HTMLInputElement;

    expect(field).not.toHaveFocus();

    rerender(<Testcase shortcut="x" />);
    fireEvent.keyDown(window, { key: "k" });

    expect(field).not.toHaveFocus();

    fireEvent.keyDown(window, { key: "x" });

    expect(field).toHaveFocus();
  });

  test("ref keeps the identity", () => {
    const hook = renderHook(({ shortcut }) => useFocusKeyboardShortcut<HTMLInputElement>(shortcut), {
      initialProps: { shortcut: "k" },
    });
    const ref = hook.result.current.ref;

    hook.rerender({ shortcut: "k" });

    expect(hook.result.current.ref).toBe(ref);

    hook.rerender({ shortcut: "x" });

    expect(hook.result.current.ref).toBe(ref);
  });
});
