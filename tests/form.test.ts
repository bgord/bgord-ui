import { describe, expect, test } from "bun:test";
import { Form } from "../src/services/form";

const date = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;

describe("Form", () => {
  test("input -default value", () => {
    expect(Form.input({})).toEqual({ pattern: undefined, required: true });
  });

  test("input - default value - non required", () => {
    expect(Form.input({ required: false })).toEqual({ pattern: undefined, required: false });
  });

  test("input - min - required", () => {
    expect(Form.input({ min: 1, required: true })).toEqual({ pattern: ".{1}", required: true });
  });

  test("input - min - non required", () => {
    expect(Form.input({ min: 1, required: false })).toEqual({ pattern: ".{1}", required: false });
  });

  test("input - max - required", () => {
    expect(Form.input({ max: 2, required: true })).toEqual({ pattern: ".{,2}", required: true });
  });

  test("input - max - non required", () => {
    expect(Form.input({ max: 2, required: false })).toEqual({ pattern: ".{,2}", required: false });
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

  test("date - min - today", () => {
    expect(date.test(Form.date.min.today())).toEqual(true);
  });

  test("date - max - today", () => {
    expect(date.test(Form.date.max.today())).toEqual(true);
  });

  test("date - min - tomorrow", () => {
    expect(date.test(Form.date.min.tomorrow())).toEqual(true);
  });

  test("date - max - tomorrow", () => {
    expect(date.test(Form.date.max.tomorrow())).toEqual(true);
  });

  test("date - min - yesterday", () => {
    expect(date.test(Form.date.min.yesterday())).toEqual(true);
  });

  test("date - max - yesterday", () => {
    expect(date.test(Form.date.max.yesterday())).toEqual(true);
  });
});
