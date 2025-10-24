import { describe, expect, test } from "bun:test";
import { ETag } from "../src/services/etag";

describe("ETag", () => {
  test("happy path", () => {
    expect(ETag.fromRevision(5)).toEqual({ "if-match": "5" });
  });
});
