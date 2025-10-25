import { describe, expect, test } from "bun:test";
import { TextField } from "../src/services/text-field";

describe("TextField", () => {
  test("create - empty value", () => {
    const result = new TextField(TextField.EMPTY);

    expect(result.get()).toEqual(TextField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - undefined", () => {
    const result = new TextField(undefined);

    expect(result.get()).toEqual(TextField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - empty string", () => {
    const result = new TextField("");

    expect(result.get()).toEqual(TextField.EMPTY);
    expect(result.isEmpty()).toEqual(true);
  });

  test("create - non-empty value", () => {
    const result = new TextField("abc");

    expect(result.get()).toEqual("abc");
    expect(result.isEmpty()).toEqual(false);
  });

  test("compare - empty and empty", () => {
    expect(TextField.compare(TextField.EMPTY, TextField.EMPTY)).toEqual(true);
  });

  test("compare - empty and non-empty", () => {
    expect(TextField.compare(TextField.EMPTY, "abc")).toEqual(false);
  });

  test("compare - non-empty and non-empty", () => {
    expect(TextField.compare("abc", "abc")).toEqual(true);
  });

  test("compare - non-empty and non-empty", () => {
    expect(TextField.compare("def", "abc")).toEqual(false);
  });
});
