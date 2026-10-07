import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { Clock } from "../src/services/clock";

afterEach(() => setSystemTime());

describe("Clock", () => {
  test("now", () => {
    setSystemTime(1791374400000);

    const result = Clock.now();

    expect(result).toEqual(1791374400000);
  });

  test("iso", () => {
    const result = Clock.iso(1791374400000);

    expect(result).toEqual("2026-10-07T12:00:00.000Z");
  });
});
