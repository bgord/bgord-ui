import { describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { extractUseToggle, useToggle } from "../src/hooks/use-toggle";

describe("useToggle", () => {
  test("default value - false ", () => {
    const hook = renderHook(() => useToggle({ name: "test" }));
    const result = hook.result.current;

    expect(result.on).toBe(false);
    expect(result.off).toBe(true);
    expect(typeof result.enable).toBe("function");
    expect(typeof result.disable).toBe("function");
    expect(typeof result.toggle).toBe("function");
    expect(result.props.controller).toEqual({
      "aria-expanded": "false",
      "aria-controls": "test",
      role: "button",
      tabIndex: 0,
    });
    expect(result.props.target).toEqual({ id: "test", "aria-hidden": "true", role: "region" });
  });

  test("default value - true", () => {
    const hook = renderHook(() => useToggle({ name: "test", defaultValue: true }));
    const result = hook.result.current;

    expect(result.on).toBe(true);
    expect(result.off).toBe(false);
    expect(result.props.controller).toEqual({
      "aria-expanded": "true",
      "aria-controls": "test",
      role: "button",
      tabIndex: 0,
    });
    expect(result.props.target).toEqual({ id: "test", "aria-hidden": "false", role: "region" });
  });

  test("toggle", () => {
    const hook = renderHook(() => useToggle({ name: "test" }));

    expect(hook.result.current.on).toBe(false);

    act(() => hook.result.current.toggle());
    expect(hook.result.current.on).toBe(true);
    expect(hook.result.current.off).toBe(false);
    expect(hook.result.current.props.controller["aria-expanded"]).toBe("true");

    act(() => hook.result.current.toggle());
    expect(hook.result.current.on).toBe(false);
    expect(hook.result.current.off).toBe(true);
    expect(hook.result.current.props.controller["aria-expanded"]).toBe("false");
  });

  test("enable", () => {
    const hook = renderHook(() => useToggle({ name: "test" }));

    act(() => hook.result.current.enable());
    expect(hook.result.current.on).toBe(true);
    expect(hook.result.current.off).toBe(false);

    act(() => hook.result.current.enable());
    expect(hook.result.current.on).toBe(true);
  });

  test("disable", () => {
    const hook = renderHook(() => useToggle({ name: "test", defaultValue: true }));

    act(() => hook.result.current.disable());
    expect(hook.result.current.on).toBe(false);
    expect(hook.result.current.off).toBe(true);

    act(() => hook.result.current.disable());
    expect(hook.result.current.on).toBe(false);
    expect(hook.result.current.off).toBe(true);
  });

  test("extractUseToggle", () => {
    const props = { className: "test-class", style: { color: "red" } };
    const hook = renderHook(() => useToggle({ name: "test" }));
    const { toggle, rest } = extractUseToggle({ ...hook.result.current, ...props });

    expect(toggle).toEqual(hook.result.current);

    // @ts-expect-error
    expect(rest).toEqual(props);
    expect(rest).not.toHaveProperty("on");
    expect(rest).not.toHaveProperty("off");
    expect(rest).not.toHaveProperty("enable");
    expect(rest).not.toHaveProperty("disable");
    expect(rest).not.toHaveProperty("toggle");
    expect(rest).not.toHaveProperty("props");
  });

  test("integration - default value - true", () => {
    function Testcase() {
      const message = useToggle({ defaultValue: true, name: "test" });

      return (
        <div>
          <button type="button" onClick={message.toggle} {...message.props.controller}>
            Toggler
          </button>

          <div {...message.props.target} style={{ display: message.on ? "block" : "none" }}>
            Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const button = screen.getByText("Toggler");
    const message = screen.getByText("Message");

    expect(message).toBeVisible();
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(message).not.toBeVisible();
    expect(button).toHaveAttribute("aria-expanded", "false");

    cleanup();
  });

  test("integration - toggle", () => {
    function Testcase() {
      const message = useToggle({ name: "test" });

      return (
        <div>
          <button type="button" onClick={message.toggle} {...message.props.controller}>
            Toggler
          </button>
          <div {...message.props.target} style={{ display: message.on ? "block" : "none" }}>
            Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const button = screen.getByText("Toggler");
    const message = screen.queryByText("Message");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "test");
    expect(message).toHaveAttribute("id", "test");
    expect(message).not.toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(message).toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(message).not.toBeVisible();

    cleanup();
  });

  test("integration - enable/disable", () => {
    function Testcase() {
      const message = useToggle({ name: "test" });

      return (
        <div>
          <button type="button" onClick={message.enable}>
            Show
          </button>
          <button type="button" onClick={message.disable}>
            Hide
          </button>
          <div {...message.props.target} style={{ display: message.on ? "block" : "none" }}>
            Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const show = screen.getByText("Show");
    const hide = screen.getByText("Hide");
    const message = screen.getByText("Message");

    expect(message).not.toBeVisible();
    fireEvent.click(show);

    expect(message).toBeVisible();
    fireEvent.click(show);

    expect(message).toBeVisible();
    fireEvent.click(hide);

    expect(message).not.toBeVisible();
    fireEvent.click(hide);

    expect(message).not.toBeVisible();

    cleanup();
  });
});
