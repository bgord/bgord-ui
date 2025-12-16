import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDateField } from "../src/hooks/use-date-field";

afterEach(() => cleanup());

function changeEvent(value: string, valid = true) {
  return { currentTarget: { value, validity: { valid } } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("useDateField", () => {
  test("idle", () => {
    const { result } = renderHook(() => useDateField({ name: "field" }));

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
    const defaultValue = "2025-01-01";
    const { result } = renderHook(() => useDateField({ name: "field", defaultValue }));

    expect(result.current.defaultValue).toEqual(defaultValue);
    expect(result.current.value).toEqual(defaultValue);
    expect(result.current.input.props.value).toEqual(defaultValue);
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(false);
  });

  test("handleChange / clear", () => {
    const value = "2025-01-01";
    const { result } = renderHook(() => useDateField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent(value, true)));

    expect(result.current.defaultValue).toEqual(undefined);
    expect(result.current.value).toEqual(value);
    expect(result.current.input.props.value).toEqual(value);
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

  test("handleChange - invalid format", () => {
    const invalid = "2025/01/01";
    const { result } = renderHook(() => useDateField({ name: "field" }));

    act(() => result.current.handleChange(changeEvent(invalid)));

    expect(result.current.value).toEqual(undefined);
    expect(result.current.input.props.value).toEqual(invalid);
  });

  test("integration", async () => {
    const value = "2025-01-01";

    function Testcase() {
      const field = useDateField({ name: "field" });

      return (
        <div>
          <label {...field.label.props}>
            <input data-testid="field" type="date" {...field.input.props} />
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
    await userEvent.type(input, value);

    expect(input).toHaveDisplayValue(value);

    await userEvent.click(screen.getByText("Clear"));

    await waitFor(() => expect(input).toHaveDisplayValue(""));

    // Typing
    await userEvent.type(input, "2");

    expect(input).toHaveDisplayValue("");

    await userEvent.type(input, "025-01-01");

    expect(input).toHaveDisplayValue("2025-01-01");
  });
});
