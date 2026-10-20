import { describe, expect, test } from "bun:test";
import { CSS, JS, META } from "../src/services/head";

describe("head", () => {
  test("CSS", () => {
    expect(CSS("custom.css")).toEqual([
      { rel: "preload", as: "style", href: "custom.css" },
      { rel: "stylesheet", href: "custom.css" },
    ]);
  });

  test("JS", () => {
    expect(JS("index.js")).toEqual({ type: "module", src: "index.js" });
  });

  test("META", () => {
    expect(META).toEqual([
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ]);
  });
});
