import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";

import { useField, useFieldStrategyEnum } from "../src/hooks/use-field";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<>{children}</>} />
    </Routes>
  </MemoryRouter>
);

describe("useField", () => {
  test("should initialize with default value and local strategy", () => {
    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-field",
          defaultValue: "default value",
          strategy: useFieldStrategyEnum.local,
        }),
      { wrapper },
    );

    expect(result.current.strategy).toBe(useFieldStrategyEnum.local);
    expect(result.current.defaultValue).toBe("default value");
    expect(result.current.currentValue).toBe("default value");
    expect(result.current.value).toBe("default value");
    expect(result.current.changed).toBe(false);
    expect(result.current.unchanged).toBe(true);
    expect(result.current.empty).toBe(false);
  });

  test("should update value with set function", () => {
    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-field",
          defaultValue: "default value",
          strategy: useFieldStrategyEnum.local,
        }),
      { wrapper },
    );

    act(() => {
      result.current.set("new value");
    });

    expect(result.current.currentValue).toBe("new value");
    expect(result.current.value).toBe("new value");
    expect(result.current.changed).toBe(true);
    expect(result.current.unchanged).toBe(false);
  });

  test("should clear value to default", () => {
    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-field",
          defaultValue: "default value",
          strategy: useFieldStrategyEnum.local,
        }),
      { wrapper },
    );

    act(() => {
      result.current.set("new value");
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.currentValue).toBe("default value");
    expect(result.current.value).toBe("default value");
  });

  test("should handle change event", () => {
    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-field",
          defaultValue: "",
          strategy: useFieldStrategyEnum.local,
        }),
      { wrapper },
    );

    const event = {
      currentTarget: { value: "change value" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(event);
    });

    expect(result.current.currentValue).toBe("change value");
  });

  test("should provide correct label and input props", () => {
    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-field",
          defaultValue: "",
          strategy: useFieldStrategyEnum.local,
        }),
      { wrapper },
    );

    expect(result.current.label.props.htmlFor).toBe("test-field");
    expect(result.current.input.props.id).toBe("test-field");
    expect(result.current.input.props.name).toBe("test-field");
    expect(result.current.input.props.value).toBe("");
    expect(result.current.input.props.onChange).toBeFunction();
  });

  test("should reflect param strategy from URL", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/test?test-param=url-value"]}>
        <Routes>
          <Route path="/test" element={<>{children}</>} />
        </Routes>
      </MemoryRouter>
    );

    const { result } = renderHook(
      () =>
        useField<string>({
          name: "test-param",
          defaultValue: "default value",
          strategy: useFieldStrategyEnum.params,
        }),
      { wrapper },
    );

    expect(result.current.strategy).toBe(useFieldStrategyEnum.params);
    expect(result.current.currentValue).toBe("url-value");
  });
});

describe("useField in components", () => {
  test("should update input value and reflect changes", () => {
    function TestComponent() {
      const field = useField<string>({
        name: "test-input",
        defaultValue: "start",
        strategy: useFieldStrategyEnum.local,
      });

      return (
        <div>
          <label {...field.label.props}>Test Input</label>
          <input type="text" {...field.input.props} />
          <span data-testid="value">{field.currentValue}</span>
          <span data-testid="changed">{String(field.changed)}</span>
        </div>
      );
    }

    render(<TestComponent />, { wrapper });

    const input = screen.getByLabelText("Test Input") as HTMLInputElement;
    const valueSpan = screen.getByTestId("value");
    const changedSpan = screen.getByTestId("changed");

    expect(input.value).toBe("start");
    expect(valueSpan.textContent).toBe("start");
    expect(changedSpan.textContent).toBe("false");

    fireEvent.change(input, { target: { value: "end" } });

    expect(input.value).toBe("end");
    expect(valueSpan.textContent).toBe("end");
    expect(changedSpan.textContent).toBe("true");
  });
});
