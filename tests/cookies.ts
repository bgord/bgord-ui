import { describe, expect, test } from "bun:test";
import { Cookies } from "../src/services/cookies";

describe("Cookies", () => {
  test("extracts cookie header from Response", () => {
    const request = new Request("exapmle.com", {
      headers: { cookie: "example" },
    });

    expect(Cookies.extractFrom(request)).toEqual("example");
  });
});
