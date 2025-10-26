import { describe, expect, test } from "bun:test";
import { DateField } from "../src/services/date-field";

describe("DateField", () => {
  test("create - empty value", () => {
    const result = new DateField(DateField.EMPTY);

    expect(result.get()).toEqual(DateField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - undefined", () => {
    const result = new DateField(undefined);

    expect(result.get()).toEqual(DateField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - empty string", () => {
    const result = new DateField("");

    expect(result.get()).toEqual(DateField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - non-empty value", () => {
    const result = new DateField("2025/01/01");

    expect(result.get()).toEqual("2025/01/01");
    expect(result.isEmpty()).toEqual(false);
  });

  test("compare - empty and empty", () => {
    expect(DateField.compare(DateField.EMPTY, DateField.EMPTY)).toEqual(true);
  });

  test("compare - empty and non-empty", () => {
    expect(DateField.compare(DateField.EMPTY, "2025/01/01")).toEqual(false);
  });

  test("compare - non-empty and non-empty", () => {
    expect(DateField.compare("2025/01/01", "2025/01/01")).toEqual(true);
  });

  test("compare - non-empty and non-empty", () => {
    expect(DateField.compare("2025/01/02", "2025/01/01")).toEqual(false);
  });
});
