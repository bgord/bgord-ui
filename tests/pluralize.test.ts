// cspell:disable
import { describe, expect, jest, spyOn, test } from "bun:test";
import { pluralize } from "../src/services/pluralize";

const singular = "kot";
const plural = "koty";
const genitive = "kotów";

describe("pluralize", () => {
  test("en - singular", () => {
    expect(pluralize({ value: 1, singular: "apple", language: "en" })).toEqual("apple");
  });

  test("en - plural - fallback", () => {
    expect(pluralize({ value: 3, singular: "car", language: "en" })).toEqual("cars");
  });

  test("en - plural - explicit", () => {
    expect(pluralize({ value: 2, singular: "person", plural: "people", language: "en" })).toEqual("people");
  });

  test("en - non-numeric", () => {
    expect(pluralize({ value: undefined, singular: "cat", language: "en" })).toEqual("cats");
    expect(pluralize({ value: null, singular: "dog", language: "en" })).toEqual("dogs");
  });

  test("pl - singular", () => {
    expect(pluralize({ value: 1, singular, plural, genitive, language: "pl" })).toEqual(singular);
  });

  test("pl - nominative plural for 2-4 except 12-14", () => {
    expect(pluralize({ value: 2, singular, plural, genitive, language: "pl" })).toEqual(plural);
    expect(pluralize({ value: 23, singular, plural, genitive, language: "pl" })).toEqual(plural);
  });

  test("pl - genitive plural", () => {
    [0, 5, 11, 14, 112, 120].forEach((n) =>
      expect(pluralize({ value: n, singular, plural, genitive, language: "pl" })).toEqual(genitive),
    );
  });

  test("pl - non-numeric", () => {
    expect(pluralize({ value: undefined, singular, plural, genitive, language: "pl" })).toEqual(singular);
    expect(pluralize({ value: null, singular, plural, genitive, language: "pl" })).toEqual(singular);
  });

  test("unsupported language", () => {
    const consoleWarn = spyOn(console, "warn").mockImplementation(jest.fn());

    expect(pluralize({ value: 7, singular: "item", language: "fr" })).toEqual("item");
    expect(consoleWarn).toHaveBeenCalledWith(
      "[@bgord/frontend] missing pluralization function for language: fr.",
    );
  });
});
