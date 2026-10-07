import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { renderHook } from "@testing-library/react";
import { useDateFormat } from "../src/hooks/use-date-format";
import { TimeZoneContext } from "../src/hooks/use-time-zone";
import { TranslationsContext } from "../src/services/translations";

const value = { translations: {}, language: "en", supportedLanguages: { en: "en" } };

afterEach(() => setSystemTime());

describe("useDateFormat", () => {
  test("today", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useDateFormat(), {
      wrapper: ({ children }) => (
        <TranslationsContext.Provider value={value}>
          <TimeZoneContext.Provider value="Pacific/Kiritimati">{children}</TimeZoneContext.Provider>
        </TranslationsContext.Provider>
      ),
    });

    expect(result.current.dayLabel("2026-10-08")).toEqual("Today");
  });

  test("time zone", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useDateFormat(), {
      wrapper: ({ children }) => (
        <TranslationsContext.Provider value={value}>
          <TimeZoneContext.Provider value="Europe/Warsaw">{children}</TimeZoneContext.Provider>
        </TranslationsContext.Provider>
      ),
    });

    expect(result.current.instantFull(1791374400000)).toEqual("Oct 7, 2026 at 2:00 PM");
  });

  test("now", () => {
    setSystemTime(1791374400000);

    const { result } = renderHook(() => useDateFormat(), {
      wrapper: ({ children }) => (
        <TranslationsContext.Provider value={value}>{children}</TranslationsContext.Provider>
      ),
    });

    expect(result.current.ago(1791367200000)).toEqual("2 hours ago");
  });
});
