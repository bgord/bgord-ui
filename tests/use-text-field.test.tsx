import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useTextField } from "../src/hooks/use-text-field";

function changeEvent(value: string | number) {
  return { currentTarget: { value } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

afterEach(() => cleanup());

describe("useField", () => {
  test("idle", () => {
    const { result } = renderHook(() => useTextField({ name: "field" }));

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
    const defaultValue = "abc";
    const { result } = renderHook(() => useTextField<string>({ name: "field", defaultValue }));

    expect(result.current.defaultValue).toEqual(defaultValue);
    expect(result.current.value).toEqual(defaultValue);
    expect(result.current.input.props.value).toEqual(defaultValue);
    expect(result.current.changed).toEqual(false);
    expect(result.current.unchanged).toEqual(true);
    expect(result.current.empty).toEqual(false);
  });

  test("handleChange / clear", () => {
    const value = "abc";
    const { result } = renderHook(() => useTextField<string>({ name: "field" }));

    act(() => result.current.handleChange(changeEvent(value)));

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

  test.only("integration", async () => {
    const value = "abc";

    function Testcase() {
      const field = useTextField<string>({ name: "field" });

      return (
        <div>
          <label {...field.label.props}>
            <input data-testid="field" type="text" {...field.input.props} />
          </label>

          <button type="button" onClick={field.clear}>
            Clear
          </button>
        </div>
      );
    }

    render(<Testcase />);

    expect(screen.getByTestId("field")).toHaveValue("");

    act(() => fireEvent.change(screen.getByTestId("field"), { target: { value } }));
    expect(screen.getByTestId("field")).toHaveValue(value);

    act(() => fireEvent.click(screen.getByText("Clear")));
    expect(screen.getByTestId("field")).toHaveValue("");
  });
});
