// cSpell:ignore Kiritimati
import { afterAll, afterEach, beforeAll, describe, expect, jest, spyOn, test } from "bun:test";
import { TimeZone } from "../src/services/time-zone";

beforeAll(() => window.happyDOM.setURL("http://localhost/"));

afterAll(() => window.happyDOM.setURL("about:blank"));

afterEach(() => {
  document.cookie = "time-zone=; path=/; max-age=0";
});

describe("TimeZone", () => {
  test("get - request cookie", () => {
    const request = { headers: new Headers({ cookie: "language=pl; time-zone=Europe%2FWarsaw" }) };

    const result = TimeZone.get(request);

    expect(result).toEqual("Europe/Warsaw");
  });

  test("get - request without cookie", () => {
    const request = { headers: new Headers() };

    const result = TimeZone.get(request);

    expect(result).toEqual("UTC");
  });

  test("get - request with invalid time zone", () => {
    const request = { headers: new Headers({ cookie: "time-zone=Mars%2FOlympus" }) };

    const result = TimeZone.get(request);

    expect(result).toEqual("UTC");
  });

  test("get - document cookie", () => {
    document.cookie = "time-zone=America%2FNew_York; path=/";

    const result = TimeZone.get(null);

    expect(result).toEqual("America/New_York");
  });

  test("get - document without cookie", () => {
    const result = TimeZone.get(null);

    expect(result).toEqual("UTC");
  });

  test("script - missing cookie", () => {
    using reload = spyOn(location, "reload").mockImplementation(jest.fn());

    new Function(TimeZone.script)();

    expect(TimeZone.get(null)).toEqual(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("script - outdated cookie", () => {
    document.cookie = "time-zone=Pacific%2FKiritimati; path=/";
    using reload = spyOn(location, "reload").mockImplementation(jest.fn());

    new Function(TimeZone.script)();

    expect(TimeZone.get(null)).toEqual(Intl.DateTimeFormat().resolvedOptions().timeZone);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test("script - current cookie", () => {
    document.cookie = `time-zone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone)}; path=/`;
    using reload = spyOn(location, "reload").mockImplementation(jest.fn());

    new Function(TimeZone.script)();

    expect(reload).not.toHaveBeenCalled();
  });
});
