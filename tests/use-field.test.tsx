import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import type React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { useField, useFieldStrategyEnum } from "../src/hooks/use-field";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={children} />
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

    expect(result.current.strategy).toEqual(useFieldStrategyEnum.local);
    expect(result.current.defaultValue).toEqual("default value");
    expect(result.current.currentValue).toEqual("default value");
    expect(result.current.value).toEqual("default value");
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(false);
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

    expect(result.current.currentValue).toEqual("new value");
    expect(result.current.value).toEqual("new value");
    expect(result.current.changed).toEqual(true);
    expect(result.current.unchanged).toEqual(false);
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

    expect(result.current.currentValue).toEqual("default value");
    expect(result.current.value).toEqual("default value");
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

    expect(result.current.currentValue).toEqual("change value");
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

    expect(result.current.label.props.htmlFor).toEqual("test-field");
    expect(result.current.input.props.id).toEqual("test-field");
    expect(result.current.input.props.name).toEqual("test-field");
    expect(result.current.input.props.value).toEqual("");
    expect(result.current.input.props.onChange).toBeFunction();
  });

  test("should reflect param strategy from URL", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={["/test?test-param=url-value"]}>
        <Routes>
          <Route path="/test" element={children} />
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

    expect(result.current.strategy).toEqual(useFieldStrategyEnum.params);
    expect(result.current.currentValue).toEqual("url-value");
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

    expect(input.value).toEqual("start");
    expect(valueSpan.textContent).toEqual("start");
    expect(changedSpan.textContent).toEqual("false");

    fireEvent.change(input, { target: { value: "end" } });

    expect(input.value).toEqual("end");
    expect(valueSpan.textContent).toEqual("end");
    expect(changedSpan.textContent).toEqual("true");
  });
});
