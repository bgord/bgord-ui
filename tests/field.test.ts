import { describe, expect, test } from "bun:test";
import { Field } from "../src/services/field";

describe("Field", () => {
  test("create - empty value", () => {
    const result = new Field(Field.emptyValue);

    expect(result.get()).toEqual(Field.emptyValue);
    expect(result.isEmpty()).toEqual(true);
  });
  test("create - empty string", () => {
    const result = new Field("");

    expect(result.get()).toEqual(Field.emptyValue);
    expect(result.isEmpty()).toEqual(true);
  });
  test("create - null", () => {
    const result = new Field(null);

    expect(result.get()).toEqual(Field.emptyValue);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - non-empty value", () => {
    const result = new Field("abc");

    expect(result.get()).toEqual("abc");
    expect(result.isEmpty()).toEqual(false);
  });

  test("compare - empty and empty", () => {
    expect(Field.compare(undefined, undefined)).toEqual(true);
  });

  test("compare - empty and non-empty", () => {
    expect(Field.compare(undefined, "abc")).toEqual(false);
  });

  test("compare - non-empty and non-empty - success", () => {
    expect(Field.compare("abc", "abc")).toEqual(true);
  });

  test("compare - non-empty and non-empty - failure", () => {
    expect(Field.compare("def", "abc")).toEqual(false);
  });
});
