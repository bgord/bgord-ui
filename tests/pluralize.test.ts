// cspell:disable
import { describe, expect, jest, spyOn, test } from "bun:test";
import { pluralize } from "../src/services/pluralize";

const singular = "kot";
const plural = "koty";
const genitive = "kotów";
const person = { singular: "person", plural: "people", genitive: "people" };

describe("pluralize", () => {
  test("en - singular", () => {
    expect(pluralize({ value: 1, ...person, language: "en" })).toEqual("person");
  });

  test("en - plural", () => {
    expect(pluralize({ value: 2, ...person, language: "en" })).toEqual("people");
  });

  test("en - non-numeric", () => {
    expect(pluralize({ value: undefined, ...person, language: "en" })).toEqual("people");
    expect(pluralize({ value: null, ...person, language: "en" })).toEqual("people");
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
    using consoleWarn = spyOn(console, "warn").mockImplementation(jest.fn());

    expect(pluralize({ value: 7, ...person, language: "fr" })).toEqual("person");
    expect(consoleWarn).toHaveBeenCalledWith("[@bgord/ui] missing pluralization function for language: fr.");
  });
});
