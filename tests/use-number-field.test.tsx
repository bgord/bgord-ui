import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNumberField } from "../src/hooks/use-number-field";

afterEach(() => cleanup());

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

  test("integration", async () => {
    const value = "123";
    const valueAsNumber = 123;

    function Testcase() {
      const field = useNumberField({ name: "field" });

      return (
        <div>
          <label {...field.label.props}>
            <input data-testid="field" type="number" min={-2} step={0.1} {...field.input.props} />
          </label>

          <button type="button" onClick={field.clear}>
            Clear
          </button>
        </div>
      );
    }

    render(<Testcase />);

    const input = screen.getByTestId("field");
    expect(input).toHaveDisplayValue("");

    // handleChange/clear
    await userEvent.type(input, "123");
    expect(input).toHaveDisplayValue("123");

    await userEvent.click(screen.getByText("Clear"));
    await waitFor(() => expect(input).toHaveDisplayValue(""));

    // Fractions
    await userEvent.type(input, "1");
    expect(input).toHaveDisplayValue("1");
    await userEvent.type(input, ".");
    expect(input).toHaveDisplayValue("1");
    await userEvent.type(input, "5");
    expect(input).toHaveDisplayValue("1.5");

    await userEvent.click(screen.getByText("Clear"));
    await waitFor(() => expect(input).toHaveDisplayValue(""));

    // Negative fractions
    await userEvent.type(input, "-");
    expect(input).toHaveDisplayValue("");
    await userEvent.type(input, "1");
    expect(input).toHaveDisplayValue("-1");
    await userEvent.type(input, ".");
    expect(input).toHaveDisplayValue("-1");
    await userEvent.type(input, "5");
    expect(input).toHaveDisplayValue("-1.5");

    await userEvent.click(screen.getByText("Clear"));
    await waitFor(() => expect(input).toHaveDisplayValue(""));

    // Invalid value
    await userEvent.type(input, "-");
    expect(input).toHaveDisplayValue("");
    await userEvent.type(input, "2");
    expect(input).toHaveDisplayValue("-2");
    await userEvent.type(input, ".");
    expect(input).toHaveDisplayValue("-2");
    await userEvent.type(input, "5");
    expect(input).toHaveDisplayValue("-2.5");
    expect(input.validity.valid).toEqual(false);
  });
});
