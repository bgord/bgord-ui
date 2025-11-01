import { describe, expect, test } from "bun:test";
import { absoluteUrl } from "../src/services/absolute-url";

const path = "/api";
const http = "http://localhost:3000";
const https = "https://localhost:3000";

describe("absoluteUrl", () => {
  test("happy path - no request", () => {
    expect(absoluteUrl(path, null)).toEqual(path);
  });

  test("happy path - http request", () => {
    const request = new Request(http);
    expect(absoluteUrl(path, request).toString()).toEqual(`${http}${path}`);
  });

  test("happy path - https request", () => {
    const request = new Request(`${https}/anything`);
    expect(absoluteUrl(path, request).toString()).toEqual(`${https}${path}`);
  });

  test("x-forwarded-proto https", () => {
    const request = new Request(`${http}/whatever`, {
      headers: { "x-forwarded-proto": "https" },
    });
    expect(absoluteUrl(path, request).toString()).toEqual(`${https}${path}`);
  });

  test("proto https", () => {
    const request = new Request(`${http}/whatever`, {
      headers: { forwarded: "for=1.2.3.4; proto=https; host=foo.example" },
    });
    expect(absoluteUrl(path, request).toString()).toEqual(`${https}${path}`);
  });

  test("relative path with query", () => {
    const request = new Request(`${http}/base`);
    const withQuery = "/api?filter=today&query=";
    expect(absoluteUrl(withQuery, request).toString()).toEqual(`${http}${withQuery}`);
  });

  test("passthrough", () => {
    const absolute = "https://cdn.example.com/static/file.png";
    const request = new Request(http);
    expect(absoluteUrl(absolute, request).toString()).toEqual(absolute);
  });
});
