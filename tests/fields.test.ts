import { describe, expect, test } from "bun:test";
import { Fields } from "../src/services/fields";

describe("Fields", () => {
  test("allUnchanged - true", () => {
    expect(Fields.allUnchanged([{ unchanged: true }, { unchanged: true }])).toEqual(true);
  });

  test("allUnchanged - false", () => {
    expect(Fields.allUnchanged([{ unchanged: true }, { unchanged: false }])).toEqual(false);
  });

  test("allEmpty - true", () => {
    expect(Fields.allEmpty([{ empty: true }, { empty: true }])).toEqual(true);
  });

  test("allEmpty - false", () => {
    expect(Fields.allEmpty([{ empty: true }, { empty: false }])).toEqual(false);
  });

  test("anyEmpty - true", () => {
    expect(Fields.anyEmpty([{ empty: true }, { empty: false }])).toEqual(true);
  });

  test("anyEmpty - false", () => {
    expect(Fields.anyEmpty([{ empty: false }, { empty: false }])).toEqual(false);
  });

  test("anyUnchanged - true", () => {
    expect(Fields.anyUnchanged([{ unchanged: true }, { unchanged: false }])).toEqual(true);
  });

  test("anyUnchanged - false", () => {
    expect(Fields.anyUnchanged([{ unchanged: false }, { unchanged: false }])).toEqual(false);
  });

  test("anyChanged - true", () => {
    expect(Fields.anyChanged([{ changed: true }, { changed: false }])).toEqual(true);
  });

  test("anyChanged - false", () => {
    expect(Fields.anyChanged([{ changed: false }, { changed: false }])).toEqual(false);
  });
});
