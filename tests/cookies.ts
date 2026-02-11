import { describe, expect, spyOn, test } from "bun:test";
import JsCookie from "js-cookie";
import { Cookies } from "../src/services/cookies";

describe("Cookies", () => {
  test("extractFrom", () => {
    const request = new Request("exapmle.com", { headers: { cookie: "example" } });

    expect(Cookies.extractFrom(request)).toEqual("example");
  });

  test("set", () => {
    using jsCookieSetSpy = spyOn(JsCookie, "set");

    Cookies.set("name", "test");

    expect(jsCookieSetSpy).toHaveBeenCalled();
  });
});
