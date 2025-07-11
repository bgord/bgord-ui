// cspell:disable
import { describe, expect, jest, spyOn, test } from "bun:test";
import { pluralize } from "../src/services/pluralize";

const singular = "kot";
const plural = "koty";
const genitive = "kotów";

describe("pluralize", () => {
  test("en -returns singular when value is 1", () => {
    expect(pluralize({ value: 1, singular: "apple", language: "en" })).toBe("apple");
  });

  test("en -defaults to singular + 's' when plural form not supplied", () => {
    expect(pluralize({ value: 3, singular: "car", language: "en" })).toBe("cars");
  });

  test("en -respects an irregular plural override", () => {
    expect(pluralize({ value: 2, singular: "person", plural: "people", language: "en" })).toBe("people");
  });

  test("en -treats undefined/null/0 as plural (≠ 1)", () => {
    expect(pluralize({ value: undefined, singular: "cat", language: "en" })).toBe("cats");
    expect(pluralize({ value: null, singular: "dog", language: "en" })).toBe("dogs");
    expect(pluralize({ value: 0, singular: "mouse", language: "en" })).toBe("mouses"); // default plural
  });

  test("pl - returns singular for 1", () => {
    expect(pluralize({ value: 1, singular, plural, genitive, language: "pl" })).toBe(singular);
  });

  test("pl - returns nominative plural for numbers ending in 2-4 (except 12-14)", () => {
    expect(pluralize({ value: 2, singular, plural, genitive, language: "pl" })).toBe(plural);
    expect(pluralize({ value: 23, singular, plural, genitive, language: "pl" })).toBe(plural);
  });

  test("pl - returns genitive plural for 0 and values like 5, 11, 14, 102", () => {
    [0, 5, 11, 14, 112, 120].forEach((n) =>
      expect(pluralize({ value: n, singular, plural, genitive, language: "pl" })).toBe(genitive),
    );
  });

  test("pl - falls back to singular when value is undefined (defaults to 1)", () => {
    expect(pluralize({ value: undefined, singular, plural, genitive, language: "pl" })).toBe(singular);
  });

  describe("pluralize – unsupported languages", () => {
    test("returns singular and logs a warning", () => {
      const consoleWarn = spyOn(console, "warn").mockImplementation(jest.fn());

      const result = pluralize({ value: 7, singular: "item", language: "fr" });

      expect(result).toBe("item");
      expect(consoleWarn).toHaveBeenCalledWith(
        "[@bgord/frontend] missing pluralization function for language: fr.",
      );
    });
  });
});
