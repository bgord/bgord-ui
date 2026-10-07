import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useDateTime } from "../src/hooks/use-date-time";
import { TimeZoneContext } from "../src/hooks/use-time-zone";
import { TranslationsContext } from "../src/services/translations";

const value = { translations: {}, language: "en", supportedLanguages: { en: "en" } };

afterEach(() => setSystemTime());

describe("useDateTime", () => {
  test("calendar day", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useDateTime({ value: "2026-10-08", format: "dayLabel" }), {
      wrapper: ({ children }) => (
        <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>
      ),
    });

    expect(result.current).toEqual({ text: "Tomorrow", full: "Oct 8, 2026", dateTime: "2026-10-08" });
  });

  test("instant", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useDateTime({ value: 1791367200000, format: "ago" }), {
      wrapper: ({ children }) => (
        <TranslationsContext.Provider value={value}>
          <TimeZoneContext.Provider value="Europe/Warsaw">{children}</TimeZoneContext.Provider>
        </TranslationsContext.Provider>
      ),
    });

    expect(result.current).toEqual({
      text: "2 hours ago",
      full: "Oct 7, 2026 at 12:00 PM",
      dateTime: "2026-10-07T10:00:00.000Z",
    });
  });
});
