import { describe, expect, test } from "bun:test";
import { Rhythm } from "../src/services/rhythm";

describe("Rhythm", () => {
  test("default base", () => {
    const result = Rhythm().times(1);

    expect(result.raw).toEqual(12);
    expect(result.px).toEqual("12px");
  });

  test("custom base", () => {
    const result = Rhythm(16).times(1);

    expect(result.raw).toEqual(16);
    expect(result.px).toEqual("16px");
  });

  test("times", () => {
    const result = Rhythm(10).times(2.5);

    expect(result.raw).toEqual(25);
    expect(result.px).toEqual("25px");
  });

  test("dimensions", () => {
    const result = Rhythm(8).times(2);

    expect(result.height).toEqual({ height: "16px" });
    expect(result.minHeight).toEqual({ minHeight: "16px" });
    expect(result.maxHeight).toEqual({ maxHeight: "16px" });
    expect(result.width).toEqual({ width: "16px" });
    expect(result.minWidth).toEqual({ minWidth: "16px" });
    expect(result.maxWidth).toEqual({ maxWidth: "16px" });
    expect(result.square).toEqual({ height: "16px", width: "16px" });
  });

  test("dimensions.styles", () => {
    const result = Rhythm(4).times(3);

    expect(result.style.height).toEqual({ style: { height: "12px" } });
    expect(result.style.minHeight).toEqual({ style: { minHeight: "12px" } });
    expect(result.style.maxHeight).toEqual({ style: { maxHeight: "12px" } });
    expect(result.style.width).toEqual({ style: { width: "12px" } });
    expect(result.style.minWidth).toEqual({ style: { minWidth: "12px" } });
    expect(result.style.maxWidth).toEqual({ style: { maxWidth: "12px" } });
    expect(result.style.square).toEqual({ style: { height: "12px", width: "12px" } });
  });
});
