import { describe, expect, test } from "bun:test";
import { SearchParam } from "../src/services/search-param";

describe("SearchParam", () => {
  test("text - valid", () => {
    expect(SearchParam.text()("abc")).toEqual("abc");
  });

  test("text - empty", () => {
    expect(SearchParam.text()("")).toEqual(undefined);
  });

  test("text - not a string", () => {
    expect(SearchParam.text()(1)).toEqual(undefined);
  });

  test("text - min - valid", () => {
    expect(SearchParam.text({ min: 3 })("abc")).toEqual("abc");
  });

  test("text - min - too short", () => {
    expect(SearchParam.text({ min: 3 })("ab")).toEqual(undefined);
  });

  test("text - max - valid", () => {
    expect(SearchParam.text({ max: 3 })("abc")).toEqual("abc");
  });

  test("text - max - too long", () => {
    expect(SearchParam.text({ max: 3 })("abcd")).toEqual(undefined);
  });

  test("oneOf - valid", () => {
    expect(SearchParam.oneOf(["a", "b"])("b")).toEqual("b");
  });

  test("oneOf - invalid", () => {
    expect(SearchParam.oneOf(["a", "b"])("c")).toEqual(undefined);
  });

  test("matches - valid", () => {
    expect(SearchParam.matches(/^\d+$/)("123")).toEqual("123");
  });

  test("matches - invalid", () => {
    expect(SearchParam.matches(/^\d+$/)("abc")).toEqual(undefined);
  });

  test("matches - not a string", () => {
    expect(SearchParam.matches(/^\d+$/)(123)).toEqual(undefined);
  });

  test("or - first", () => {
    expect(SearchParam.or(SearchParam.oneOf(["all"]), SearchParam.matches(/^\d+$/))("all")).toEqual("all");
  });

  test("or - second", () => {
    expect(SearchParam.or(SearchParam.oneOf(["all"]), SearchParam.matches(/^\d+$/))("123")).toEqual("123");
  });

  test("or - none", () => {
    expect(SearchParam.or(SearchParam.oneOf(["all"]), SearchParam.matches(/^\d+$/))("abc")).toEqual(
      undefined,
    );
  });

  test("form - default", () => {
    const form = SearchParam.form({ status: SearchParam.oneOf(["a", "b"]), query: SearchParam.text() });

    expect(form.default).toEqual({ status: undefined, query: undefined });
  });

  test("form - validate", () => {
    const form = SearchParam.form({ status: SearchParam.oneOf(["a", "b"]), query: SearchParam.text() });

    expect(form.validate({ status: "a", query: "abc", other: "x" })).toEqual({ status: "a", query: "abc" });
  });

  test("form - validate - invalid", () => {
    const form = SearchParam.form({ status: SearchParam.oneOf(["a", "b"]), query: SearchParam.text() });

    expect(form.validate({ status: "c", query: 1 })).toEqual({ status: undefined, query: undefined });
  });

  test("form - isDefault - true", () => {
    const form = SearchParam.form({ status: SearchParam.oneOf(["a", "b"]), query: SearchParam.text() });

    expect(form.isDefault({ status: undefined, query: undefined })).toEqual(true);
  });

  test("form - isDefault - false", () => {
    const form = SearchParam.form({ status: SearchParam.oneOf(["a", "b"]), query: SearchParam.text() });

    expect(form.isDefault({ status: undefined, query: "abc" })).toEqual(false);
  });
});
