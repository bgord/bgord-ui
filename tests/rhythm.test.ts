import { describe, test, expect } from "bun:test";
import { Rhythm } from "../src/services/rhythm";

describe("Rhythm", () => {
  test("uses default base of 12px", () => {
    const rhythm = Rhythm();
    const result = rhythm.times(1);
    expect(result.raw).toBe(12);
    expect(result.px).toBe("12px");
  });

  test("accepts custom base value", () => {
    const rhythm = Rhythm(16);
    const result = rhythm.times(1);
    expect(result.raw).toBe(16);
    expect(result.px).toBe("16px");
  });

  test("multiplies base by times value", () => {
    const rhythm = Rhythm(10);
    const result = rhythm.times(2.5);
    expect(result.raw).toBe(25);
    expect(result.px).toBe("25px");
  });

  test("provides direct dimension properties", () => {
    const rhythm = Rhythm(8);
    const result = rhythm.times(2);

    expect(result.height).toEqual({ height: "16px" });
    expect(result.minHeight).toEqual({ minHeight: "16px" });
    expect(result.maxHeight).toEqual({ maxHeight: "16px" });
    expect(result.width).toEqual({ width: "16px" });
    expect(result.minWidth).toEqual({ minWidth: "16px" });
    expect(result.maxWidth).toEqual({ maxWidth: "16px" });
    expect(result.square).toEqual({ height: "16px", width: "16px" });
  });

  test("provides style objects for dimensions", () => {
    const rhythm = Rhythm(4);
    const result = rhythm.times(3);

    expect(result.style.height).toEqual({ style: { height: "12px" } });
    expect(result.style.minHeight).toEqual({ style: { minHeight: "12px" } });
    expect(result.style.maxHeight).toEqual({ style: { maxHeight: "12px" } });
    expect(result.style.width).toEqual({ style: { width: "12px" } });
    expect(result.style.minWidth).toEqual({ style: { minWidth: "12px" } });
    expect(result.style.maxWidth).toEqual({ style: { maxWidth: "12px" } });
    expect(result.style.square).toEqual({
      style: { height: "12px", width: "12px" },
    });
  });

  test("handles zero times value", () => {
    const rhythm = Rhythm(10);
    const result = rhythm.times(0);
    expect(result.raw).toBe(0);
    expect(result.px).toBe("0px");
  });

  test("handles negative times value", () => {
    const rhythm = Rhythm(10);
    const result = rhythm.times(-2);
    expect(result.raw).toBe(-20);
    expect(result.px).toBe("-20px");
  });
});
