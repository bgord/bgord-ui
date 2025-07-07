import { describe, expect, test } from "bun:test";
import { Form } from "../src/services/form";

describe("Form", () => {
  describe("inputPattern", () => {
    test("default value", () => {
      expect(Form.inputPattern({})).toEqual({ pattern: undefined, required: true });
    });

    test("default value - non required", () => {
      expect(Form.inputPattern({ required: false })).toEqual({
        pattern: undefined,
        required: false,
      });
    });

    test("min - required", () => {
      expect(Form.inputPattern({ min: 1, required: true })).toEqual({
        pattern: ".{1}",
        required: true,
      });
    });

    test("min - non required", () => {
      expect(Form.inputPattern({ min: 1, required: false })).toEqual({
        pattern: ".{1}",
        required: false,
      });
    });

    test("max - required", () => {
      expect(Form.inputPattern({ max: 2, required: true })).toEqual({
        pattern: ".{,2}",
        required: true,
      });
    });

    test("max - non required", () => {
      expect(Form.inputPattern({ max: 2, required: false })).toEqual({
        pattern: ".{,2}",
        required: false,
      });
    });

    test("min + max - required", () => {
      expect(Form.inputPattern({ min: 1, max: 2, required: true })).toEqual({
        pattern: ".{1,2}",
        required: true,
      });
    });

    test("min + max - non required", () => {
      expect(Form.inputPattern({ min: 1, max: 2, required: false })).toEqual({
        pattern: ".{1,2}",
        required: false,
      });
    });
  });

  describe("textareaPattern", () => {
    test("default value", () => {
      expect(Form.textareaPattern({})).toEqual({ required: true });
    });

    test("default value - non required", () => {
      expect(Form.textareaPattern({ required: false })).toEqual({
        required: false,
      });
    });

    test("min - required", () => {
      expect(Form.textareaPattern({ min: 1, required: true })).toEqual({
        minLength: 1,
        required: true,
      });
    });

    test("min - non required", () => {
      expect(Form.textareaPattern({ min: 1, required: false })).toEqual({
        minLength: 1,
        required: false,
      });
    });

    test("max - required", () => {
      expect(Form.textareaPattern({ max: 2, required: true })).toEqual({
        maxLength: 2,
        required: true,
      });
    });

    test("max - non required", () => {
      expect(Form.textareaPattern({ max: 2, required: false })).toEqual({
        maxLength: 2,
        required: false,
      });
    });

    test("min + max - required", () => {
      expect(Form.textareaPattern({ min: 1, max: 2, required: true })).toEqual({
        minLength: 1,
        maxLength: 2,
        required: true,
      });
    });

    test("min + max - non required", () => {
      expect(Form.textareaPattern({ min: 1, max: 2, required: false })).toEqual({
        minLength: 1,
        maxLength: 2,
        required: false,
      });
    });
  });
});
