import { describe, expect, test } from "bun:test";
import { TimeZoneOffset } from "../src/services/time-zone-offset";

describe("TimeZoneOffset", () => {
  test("happy path", () => {
    expect(TimeZoneOffset.get()).toEqual({ "time-zone-offset": "0" });
  });
});
