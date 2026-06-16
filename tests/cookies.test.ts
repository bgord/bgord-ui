import { describe, expect, test } from "bun:test";
import { Cookies } from "../src/services/cookies";

describe("Cookies", () => {
  test("extractFrom", () => {
    const request = new Request("http://example.com");
    request.headers.set("cookie", "example");

    expect(Cookies.extractFrom(request)).toEqual("example");
  });

  test("set with encoding", () => {
    Cookies.set("name with space", "test value with space");

    expect(document.cookie).toContain("name%20with%20space=test%20value%20with%20space");
  });
});
