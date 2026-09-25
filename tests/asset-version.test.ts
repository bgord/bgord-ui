import { describe, expect, test } from "bun:test";
import { AssetVersion } from "../src/services/asset-version";

describe("AssetVersion", () => {
  test("happy path - no request", () => {
    expect(AssetVersion.url("/custom.css", "123")).toEqual("/custom.css?v=123");
  });
});
