import { describe, expect, setSystemTime, test } from "bun:test";
import { Form } from "../src/services/form";

const now = 1791412200000;
const timeZone = "Europe/Warsaw";

describe("Form", () => {
  test("input -default value", () => {
    expect(Form.input({})).toEqual({ pattern: undefined, required: true });
  });

  test("input - default value - non required", () => {
    expect(Form.input({ required: false })).toEqual({ pattern: undefined, required: false });
  });

  test("input - min - required", () => {
    expect(Form.input({ min: 1, required: true })).toEqual({ pattern: ".{1,}", required: true });
  });

  test("input - min - non required", () => {
    expect(Form.input({ min: 1, required: false })).toEqual({ pattern: ".{1,}", required: false });
  });

  test("input - max - required", () => {
    expect(Form.input({ max: 2, required: true })).toEqual({ pattern: ".{0,2}", required: true });
  });

  test("input - max - non required", () => {
    expect(Form.input({ max: 2, required: false })).toEqual({ pattern: ".{0,2}", required: false });
  });

  test("input - min + max - required", () => {
    expect(Form.input({ min: 1, max: 2, required: true })).toEqual({ pattern: ".{1,2}", required: true });
  });

  test("input - min + max - non required", () => {
    expect(Form.input({ min: 1, max: 2, required: false })).toEqual({ pattern: ".{1,2}", required: false });
  });

  test("textarea - default value", () => {
    expect(Form.textarea({})).toEqual({ required: true });
  });

  test("textarea - default value - non required", () => {
    expect(Form.textarea({ required: false })).toEqual({ required: false });
  });

  test("textarea - min - required", () => {
    expect(Form.textarea({ min: 1, required: true })).toEqual({ minLength: 1, required: true });
  });

  test("textarea - min - non required", () => {
    expect(Form.textarea({ min: 1, required: false })).toEqual({ minLength: 1, required: false });
  });

  test("textarea - max - required", () => {
    expect(Form.textarea({ max: 2, required: true })).toEqual({ maxLength: 2, required: true });
  });

  test("textarea - max - non required", () => {
    expect(Form.textarea({ max: 2, required: false })).toEqual({ maxLength: 2, required: false });
  });

  test("textarea - min + max - required", () => {
    expect(Form.textarea({ min: 1, max: 2, required: true })).toEqual({
      minLength: 1,
      maxLength: 2,
      required: true,
    });
  });

  test("textarea - min + max - non required", () => {
    expect(Form.textarea({ min: 1, max: 2, required: false })).toEqual({
      minLength: 1,
      maxLength: 2,
      required: false,
    });
  });

  test("exact - required", () => {
    expect(Form.exact({ text: "delete" })).toEqual({ pattern: "delete", required: true });
  });

  test("exact - non required", () => {
    expect(Form.exact({ text: "delete", required: false })).toEqual({ pattern: "delete", required: false });
  });

  test("date - today", () => {
    setSystemTime(now);

    expect(Form.date.today()).toEqual("2026-10-07");
  });

  test("date - today - time zone", () => {
    setSystemTime(now);

    expect(Form.date.today(timeZone)).toEqual("2026-10-08");
  });

  test("date - tomorrow", () => {
    setSystemTime(now);

    expect(Form.date.tomorrow()).toEqual("2026-10-08");
  });

  test("date - tomorrow - time zone", () => {
    setSystemTime(now);

    expect(Form.date.tomorrow(timeZone)).toEqual("2026-10-09");
  });

  test("date - yesterday", () => {
    setSystemTime(now);

    expect(Form.date.yesterday()).toEqual("2026-10-06");
  });

  test("date - yesterday - time zone", () => {
    setSystemTime(now);

    expect(Form.date.yesterday(timeZone)).toEqual("2026-10-07");
  });

  test("date - min/max aliases", () => {
    setSystemTime(now);

    expect([Form.date.min.today(), Form.date.max.today()]).toEqual(["2026-10-07", "2026-10-07"]);
  });
});
