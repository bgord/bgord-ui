import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { TimeZoneContext, useTimeZone, useToday } from "../src/hooks/use-time-zone";

afterEach(() => setSystemTime());

describe("useTimeZone", () => {
  test("useTimeZone - default", () => {
    const { result } = renderHook(() => useTimeZone());

    expect(result.current).toEqual("UTC");
  });

  test("useTimeZone - provided", () => {
    const { result } = renderHook(() => useTimeZone(), {
      wrapper: ({ children }) => (
        <TimeZoneContext.Provider value="Europe/Warsaw">{children}</TimeZoneContext.Provider>
      ),
    });

    expect(result.current).toEqual("Europe/Warsaw");
  });

  test("useToday", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useToday(), {
      wrapper: ({ children }) => (
        <TimeZoneContext.Provider value="Pacific/Kiritimati">{children}</TimeZoneContext.Provider>
      ),
    });

    expect(result.current.toString()).toEqual("2026-10-08");
  });
});
