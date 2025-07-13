import { describe, expect, test } from "bun:test";
import { WeakETag } from "../src/services/weak-etag";

describe("WeakETag", () => {
  test("returns header", () => {
    expect(WeakETag.fromRevision(5)).toEqual({ "if-match": "W/5" });
  });
});
