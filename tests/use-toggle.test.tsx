import React from "react";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, test } from "bun:test";
import { extractUseToggle, useToggle } from "../src/hooks/use-toggle";

describe("useToggle", () => {
  test("initializes with default false value", () => {
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
    expect(result.props.target).toEqual({
      id: "test",
      "aria-hidden": "true",
      role: "region",
    });
  });

  test("initializes with explicit default value", () => {
    const hook = renderHook(() => useToggle({ name: "test-id", defaultValue: true }));
    const result = hook.result.current;

    expect(result.on).toBe(true);
    expect(result.off).toBe(false);
    expect(result.props.controller).toEqual({
      "aria-expanded": "true",
      "aria-controls": "test-id",
      role: "button",
      tabIndex: 0,
    });
    expect(result.props.target).toEqual({
      id: "test-id",
      "aria-hidden": "false",
      role: "region",
    });
  });

  test("toggle changes state", () => {
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

  test("enable/disable functions work correctly", () => {
    const hook = renderHook(() => useToggle({ name: "test" }));

    act(() => hook.result.current.enable());
    expect(hook.result.current.on).toBe(true);
    expect(hook.result.current.off).toBe(false);

    // enable when already enabled should keep state true
    act(() => hook.result.current.enable());
    expect(hook.result.current.on).toBe(true);

    act(() => hook.result.current.disable());
    expect(hook.result.current.on).toBe(false);
    expect(hook.result.current.off).toBe(true);

    // disable when already disabled should keep state false
    act(() => hook.result.current.disable());
    expect(hook.result.current.on).toBe(false);
  });

  test("name parameter affects props correctly", () => {
    const name = "test-toggle";
    const hook = renderHook(() => useToggle({ name }));

    expect(hook.result.current.props.controller).toEqual({
      "aria-expanded": "false",
      "aria-controls": name,
      role: "button",
      tabIndex: 0,
    });
    expect(hook.result.current.props.target).toEqual({
      id: name,
      "aria-hidden": "true",
      role: "region",
    });
  });
});

describe("extractUseToggle", () => {
  test("correctly separates toggle props from rest", () => {
    const hook = renderHook(() => useToggle({ name: "test" }));
    const extraProps = {
      className: "test-class",
      style: { color: "red" },
    };

    const combined = { ...hook.result.current, ...extraProps };

    const { toggle, rest } = extractUseToggle(combined);

    // Check toggle props are correctly extracted
    expect(toggle).toEqual(hook.result.current);

    // Check rest props are correctly separated
    // @ts-expect-error
    expect(rest).toEqual(extraProps);

    // Verify no toggle props leaked into rest
    expect(rest).not.toHaveProperty("on");
    expect(rest).not.toHaveProperty("off");
    expect(rest).not.toHaveProperty("enable");
    expect(rest).not.toHaveProperty("disable");
    expect(rest).not.toHaveProperty("toggle");
    expect(rest).not.toHaveProperty("props");
  });
});

describe("useToggle in components", () => {
  test("controls message visibility with button click", () => {
    function Testcase() {
      const toggle = useToggle({ name: "test-message" });
      return (
        <div>
          <button type="button" onClick={toggle.toggle} {...toggle.props.controller}>
            Toggle Message
          </button>
          <div {...toggle.props.target} style={{ display: toggle.on ? "block" : "none" }}>
            Hidden Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const button = screen.getByText("Toggle Message");
    const message = screen.queryByText("Hidden Message");

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "test-message");
    expect(message).toHaveAttribute("id", "test-message");

    expect(message).not.toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(message).toBeVisible();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(message).not.toBeVisible();
  });

  test("controlled message visibility with enable/disable", () => {
    function Testcase() {
      const toggle = useToggle({ name: "test-message" });
      return (
        <div>
          <button type="button" onClick={toggle.enable} data-testid="show">
            Show
          </button>
          <button type="button" onClick={toggle.disable} data-testid="hide">
            Hide
          </button>
          <div {...toggle.props.target} style={{ display: toggle.on ? "block" : "none" }}>
            Controlled Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const showButton = screen.getByTestId("show");
    const hideButton = screen.getByTestId("hide");
    const message = screen.getByText("Controlled Message");

    expect(message).not.toBeVisible();

    fireEvent.click(showButton);
    expect(message).toBeVisible();

    fireEvent.click(showButton);
    expect(message).toBeVisible();

    fireEvent.click(hideButton);
    expect(message).not.toBeVisible();

    fireEvent.click(hideButton);
    expect(message).not.toBeVisible();
  });

  test("multiple independent toggles", () => {
    function Testcase() {
      const firstToggle = useToggle({ name: "first-message" });
      const secondToggle = useToggle({ name: "second-message" });

      return (
        <div>
          <button
            type="button"
            onClick={firstToggle.toggle}
            {...firstToggle.props.controller}
            data-testid="first-button"
          >
            First Toggle
          </button>
          <div
            {...firstToggle.props.target}
            style={{ display: firstToggle.on ? "block" : "none" }}
            data-testid="first-content"
          >
            First Message
          </div>

          <button
            type="button"
            onClick={secondToggle.toggle}
            {...secondToggle.props.controller}
            data-testid="second-button"
          >
            Second Toggle
          </button>
          <div
            {...secondToggle.props.target}
            style={{ display: secondToggle.on ? "block" : "none" }}
            data-testid="second-content"
          >
            Second Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const firstButton = screen.getByTestId("first-button");
    const secondButton = screen.getByTestId("second-button");
    const firstContent = screen.getByTestId("first-content");
    const secondContent = screen.getByTestId("second-content");

    expect(firstContent).not.toBeVisible();
    expect(secondContent).not.toBeVisible();

    fireEvent.click(firstButton);
    expect(firstContent).toBeVisible();
    expect(secondContent).not.toBeVisible();
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(secondButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(secondButton);
    expect(firstContent).toBeVisible();
    expect(secondContent).toBeVisible();
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(firstButton);
    expect(firstContent).not.toBeVisible();
    expect(secondContent).toBeVisible();
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
    expect(secondButton).toHaveAttribute("aria-expanded", "true");
  });

  test("default open state", () => {
    function Testcase() {
      const toggle = useToggle({
        defaultValue: true,
        name: "test-message",
      });
      return (
        <div>
          <button type="button" onClick={toggle.toggle} {...toggle.props.controller}>
            Toggle
          </button>
          <div {...toggle.props.target} style={{ display: toggle.on ? "block" : "none" }}>
            Initially Visible Message
          </div>
        </div>
      );
    }

    render(<Testcase />);

    const button = screen.getByText("Toggle");
    const message = screen.getByText("Initially Visible Message");

    expect(message).toBeVisible();
    expect(button).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(button);
    expect(message).not.toBeVisible();
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
