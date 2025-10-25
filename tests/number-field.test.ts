import { describe, expect, test } from "bun:test";
import { NumberField } from "../src/services/number-field";

describe("NumberField", () => {
  test("create - empty value", () => {
    const result = new NumberField(NumberField.EMPTY);

    expect(result.get()).toEqual(NumberField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - 0", () => {
    const result = new NumberField(0);

    expect(result.get()).toEqual(0);
    expect(result.isEmpty()).toEqual(false);
  });

  test("create - NaN", () => {
    const result = new NumberField(Number.NaN);

    expect(result.get()).toEqual(NumberField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - undefiend", () => {
    const result = new NumberField(undefined);

    expect(result.get()).toEqual(NumberField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - non-empty value", () => {
    const result = new NumberField(123);

    expect(result.get()).toEqual(123);
    expect(result.isEmpty()).toEqual(false);
  });

  test("compare - empty and empty", () => {
    expect(NumberField.compare(NumberField.EMPTY, NumberField.EMPTY)).toEqual(true);
  });

  test("compare - empty and non-empty", () => {
    expect(NumberField.compare(NumberField.EMPTY, 123)).toEqual(false);
  });

  test("compare - non-empty and non-empty - success", () => {
    expect(NumberField.compare(123, 123)).toEqual(true);
  });

  test("compare - non-empty and non-empty - failure", () => {
    expect(NumberField.compare(123, 234)).toEqual(false);
  });
});
