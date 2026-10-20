import { describe, expect, test } from "bun:test";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useNumberField } from "../src/hooks/use-number-field";

function changeEvent(value: string, valueAsNumber: number, valid = true) {
  return {
    currentTarget: { value, valueAsNumber, validity: { valid } },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useNumberField", () => {
  test("idle", () => {
    const { result } = renderHook(() => useNumberField({ name: "field" }));

    expect(result.current.defaultValue).toEqual(undefined);
    expect(result.current.value).toEqual(undefined);
    expect(typeof result.current.set).toEqual("function");
    expect(typeof result.current.handleChange).toEqual("function");
    expect(typeof result.current.clear).toEqual("function");
    expect(result.current.label).toEqual({ props: { htmlFor: "field" } });
    expect(result.current.input.props.id).toEqual("field");
    expect(result.current.input.props.name).toEqual("field");
    expect(result.current.input.props.value).toEqual("");
    expect(typeof result.current.input.props.onChange).toEqual("function");
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(true);
  });

  test("idle - defaultValue", () => {
    const defaultValue = 123;
    const { result } = renderHook(() => useNumberField({ name: "field", defaultValue }));

    expect(result.current.defaultValue).toEqual(defaultValue);
    expect(result.current.value).toEqual(defaultValue);
    expect(result.current.input.props.value).toEqual("123");
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(false);
  });

  test("defaultValue change", () => {
    const { result, rerender } = renderHook(
      ({ defaultValue }) => useNumberField({ name: "field", defaultValue }),
      { initialProps: { defaultValue: 123 } },
    );

    act(() => rerender({ defaultValue: 456 }));

    expect(result.current.defaultValue).toEqual(456);
    expect(result.current.value).toEqual(456);
    expect(result.current.input.props.value).toEqual("456");
    expect(result.current.unchanged).toEqual(true);
  });

  test("handleChange / clear", () => {
    const value = 123;
    const { result } = renderHook(() => useNumberField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent(value.toString(), value, true)));

    expect(result.current.defaultValue).toEqual(undefined);
    expect(result.current.value).toEqual(value);
    expect(result.current.input.props.value).toEqual("123");
    expect(result.current.changed).toEqual(true);
    expect(result.current.unchanged).toEqual(false);
    expect(result.current.empty).toEqual(false);

    act(() => result.current.clear());

    expect(result.current.defaultValue).toEqual(undefined);
    expect(result.current.value).toEqual(undefined);
    expect(result.current.input.props.value).toEqual("");
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(true);
  });

  test("handleChange - fractions", () => {
    const { result } = renderHook(() => useNumberField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent("1", 1)));

    expect(result.current.value).toEqual(1);
    expect(result.current.input.props.value).toEqual("1");

    act(() => result.current.handleChange(changeEvent("1.", Number.NaN)));

    expect(result.current.value).toEqual(1);
    expect(result.current.input.props.value).toEqual("1.");

    act(() => result.current.handleChange(changeEvent("1.1", 1.1)));

    expect(result.current.value).toEqual(1.1);
    expect(result.current.input.props.value).toEqual("1.1");
  });

  test("handleChange - negative", () => {
    const { result } = renderHook(() => useNumberField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent("-", Number.NaN)));

    expect(result.current.value).toEqual(undefined);
    expect(result.current.input.props.value).toEqual("-");

    act(() => result.current.handleChange(changeEvent("-1", -1)));

    expect(result.current.value).toEqual(-1);
    expect(result.current.input.props.value).toEqual("-1");
  });

  test("handleChange - invalid", () => {
    const { result } = renderHook(() => useNumberField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent("10.1.1", Number.NaN)));

    expect(result.current.value).toEqual(undefined);
    expect(result.current.input.props.value).toEqual("10.1.1");
  });

  test("integration", () => {
    const value = "123";
    function Testcase() {
      const field = useNumberField({ name: "field" });

      return (
        <div>
          <label {...field.label.props}>
            <input data-testid="field" min={-2} step={0.1} type="number" {...field.input.props} />
          </label>

          <button onClick={field.clear} type="button">
            Clear
          </button>
        </div>
      );
    }
    render(<Testcase />);
    const input = screen.getByTestId<HTMLInputElement>("field");

    expect(input.value).toEqual("");

    // handleChange/clear
    fireEvent.change(input, { target: { value: value } });

    expect(input.value).toEqual(value);

    fireEvent.click(screen.getByText("Clear"));

    expect(input.value).toEqual("");

    // Fractions
    fireEvent.change(input, { target: { value: "1" } });

    expect(input.value).toEqual("1");

    fireEvent.change(input, { target: { value: "1." } });

    expect(input.value).toEqual("1.");

    fireEvent.change(input, { target: { value: "1.5" } });

    expect(input.value).toEqual("1.5");

    fireEvent.click(screen.getByText("Clear"));

    expect(input.value).toEqual("");

    // Negative fractions
    fireEvent.change(input, { target: { value: "-" } });

    expect(input.value).toEqual("");

    fireEvent.change(input, { target: { value: "-1" } });

    expect(input.value).toEqual("-1");

    fireEvent.change(input, { target: { value: "-1." } });

    expect(input.value).toEqual("-1.");

    fireEvent.change(input, { target: { value: "-1.5" } });

    expect(input.value).toEqual("-1.5");

    fireEvent.click(screen.getByText("Clear"));

    expect(input.value).toEqual("");

    // Invalid value
    fireEvent.change(input, { target: { value: "-" } });

    expect(input.value).toEqual("");

    fireEvent.change(input, { target: { value: "-2" } });

    expect(input.value).toEqual("-2");

    fireEvent.change(input, { target: { value: "-2." } });

    expect(input.value).toEqual("-2.");

    fireEvent.change(input, { target: { value: "-2.5" } });

    expect(input.value).toEqual("-2.5");
    expect(input.validity.valid).toEqual(false);
  });
});
