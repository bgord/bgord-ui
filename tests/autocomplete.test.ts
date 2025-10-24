import { describe, expect, test } from "bun:test";
import { Autocomplete } from "../src/services/autocomplete";

describe("autocomplete", () => {
  test("happy path", () => {
    expect(Autocomplete.email).toEqual({
      inputMode: "email",
      autoComplete: "email",
      autoCapitalize: "none",
      spellCheck: "false",
    });
    expect(Autocomplete.password.current).toEqual({ autoComplete: "current-password" });
    expect(Autocomplete.password.new).toEqual({ autoComplete: "new-password" });
    expect(Autocomplete.off).toEqual({ autoComplete: "off", spellCheck: false });
  });
});
