// cspell:disable
import { describe, expect, test } from "bun:test";
import { CalendarDay } from "../src/services/calendar-day";
import { DateFormat } from "../src/services/date-format";

const today = CalendarDay.from("2026-10-07");
const now = 1791374400000;

const en = new DateFormat({ language: "en", today, now, timeZone: "UTC" });
const pl = new DateFormat({ language: "pl", today, now, timeZone: "UTC" });

describe("DateFormat", () => {
  test("full", () => {
    const result = en.full("2026-10-07");

    expect(result).toEqual("Oct 7, 2026");
  });

  test("full - pl", () => {
    const result = pl.full("2026-10-07");

    expect(result).toEqual("7 paź 2026");
  });

  test("short", () => {
    const result = en.short("2026-09-12");

    expect(result).toEqual("Sep 12");
  });

  test("short - another year", () => {
    const result = en.short("2025-09-12");

    expect(result).toEqual("Sep 12, 2025");
  });

  test("short - pl", () => {
    const result = pl.short("2026-09-12");

    expect(result).toEqual("12 wrz");
  });

  test("list", () => {
    const result = en.list("2026-10-07");

    expect(result).toEqual("Wed, Oct 7");
  });

  test("list - another year", () => {
    const result = en.list("2025-10-07");

    expect(result).toEqual("Tue, Oct 7, 2025");
  });

  test("list - pl", () => {
    const result = pl.list("2026-10-07");

    expect(result).toEqual("śr., 7 paź");
  });

  test("dayLabel - yesterday", () => {
    const result = en.dayLabel("2026-10-06");

    expect(result).toEqual("Yesterday");
  });

  test("dayLabel - today", () => {
    const result = en.dayLabel("2026-10-07");

    expect(result).toEqual("Today");
  });

  test("dayLabel - tomorrow", () => {
    const result = en.dayLabel("2026-10-08");

    expect(result).toEqual("Tomorrow");
  });

  test("dayLabel - in two days", () => {
    const result = en.dayLabel("2026-10-09");

    expect(result).toEqual("Fri, Oct 9");
  });

  test("dayLabel - two days ago", () => {
    const result = en.dayLabel("2026-10-05");

    expect(result).toEqual("Mon, Oct 5");
  });

  test("dayLabel - another year", () => {
    const result = en.dayLabel("2025-10-09");

    expect(result).toEqual("Thu, Oct 9, 2025");
  });

  test("dayLabel - pl", () => {
    const result = pl.dayLabel("2026-10-07");

    expect(result).toEqual("Dzisiaj");
  });

  test("relativeDay", () => {
    const result = en.relativeDay("2026-10-07");

    expect(result).toEqual("Today");
  });

  test("relativeDay - 3 days ago", () => {
    const result = en.relativeDay("2026-10-04");

    expect(result).toEqual("3 days ago");
  });

  test("relativeDay - in 3 days", () => {
    const result = en.relativeDay("2026-10-10");

    expect(result).toEqual("In 3 days");
  });

  test("relativeDay - 4 days ago", () => {
    const result = en.relativeDay("2026-10-03");

    expect(result).toEqual("Sat, Oct 3");
  });

  test("relativeDay - in 4 days", () => {
    const result = en.relativeDay("2026-10-11");

    expect(result).toEqual("Sun, Oct 11");
  });

  test("relativeDay - pl", () => {
    const result = pl.relativeDay("2026-10-09");

    expect(result).toEqual("Pojutrze");
  });

  test("freshness - today", () => {
    const result = en.freshness("2026-10-07");

    expect(result).toEqual("today");
  });

  test("freshness - yesterday", () => {
    const result = en.freshness("2026-10-06");

    expect(result).toEqual("yesterday");
  });

  test("freshness - 6 days", () => {
    const result = en.freshness("2026-10-01");

    expect(result).toEqual("6 days ago");
  });

  test("freshness - 7 days", () => {
    const result = en.freshness("2026-09-30");

    expect(result).toEqual("last week");
  });

  test("freshness - 10 days", () => {
    const result = en.freshness("2026-09-27");

    expect(result).toEqual("last week");
  });

  test("freshness - 11 days", () => {
    const result = en.freshness("2026-09-26");

    expect(result).toEqual("2 weeks ago");
  });

  test("freshness - 34 days", () => {
    const result = en.freshness("2026-09-03");

    expect(result).toEqual("5 weeks ago");
  });

  test("freshness - 35 days", () => {
    const result = en.freshness("2026-09-02");

    expect(result).toEqual("last month");
  });

  test("freshness - 11 months", () => {
    const result = en.freshness("2025-11-30");

    expect(result).toEqual("11 months ago");
  });

  test("freshness - 12 months", () => {
    const result = en.freshness("2025-10-07");

    expect(result).toEqual("last year");
  });

  test("freshness - 2 years", () => {
    const result = en.freshness("2024-10-07");

    expect(result).toEqual("2 years ago");
  });

  test("freshness - future", () => {
    const result = en.freshness("2026-10-21");

    expect(result).toEqual("in 2 weeks");
  });

  test("freshness - pl", () => {
    const result = pl.freshness("2026-10-05");

    expect(result).toEqual("przedwczoraj");
  });

  test("range", () => {
    const result = en.range("2026-09-29", "2026-10-05");

    expect(result).toEqual("Sep 29 – Oct 5, 2026");
  });

  test("range - across years", () => {
    const result = en.range("2025-12-29", "2026-01-04");

    expect(result).toEqual("Dec 29, 2025 – Jan 4, 2026");
  });

  test("range - pl", () => {
    const result = pl.range("2026-09-29", "2026-10-05");

    expect(result).toEqual("29.09–05.10.2026");
  });

  test("parts", () => {
    const result = en.parts("2026-10-07");

    expect(result).toEqual({ month: "Oct", day: "7", weekday: "Wed" });
  });

  test("parts - pl", () => {
    const result = pl.parts("2026-10-07");

    expect(result).toEqual({ month: "paź", day: "7", weekday: "śr." });
  });

  test("ago - 59 seconds", () => {
    const result = en.ago(1791374341000);

    expect(result).toEqual("now");
  });

  test("ago - 1 minute", () => {
    const result = en.ago(1791374340000);

    expect(result).toEqual("1 minute ago");
  });

  test("ago - 59 minutes", () => {
    const result = en.ago(1791370860000);

    expect(result).toEqual("59 minutes ago");
  });

  test("ago - 1 hour", () => {
    const result = en.ago(1791370800000);

    expect(result).toEqual("1 hour ago");
  });

  test("ago - 23 hours 59 minutes", () => {
    const result = en.ago(1791288060000);

    expect(result).toEqual("23 hours ago");
  });

  test("ago - 24 hours", () => {
    const result = en.ago(1791288000000);

    expect(result).toEqual("yesterday");
  });

  test("ago - UTC day", () => {
    const result = en.ago(1791239400000);

    expect(result).toEqual("2 days ago");
  });

  test("ago - local day", () => {
    const format = new DateFormat({ language: "en", today, now, timeZone: "Europe/Warsaw" });

    const result = format.ago(1791239400000);

    expect(result).toEqual("yesterday");
  });

  test("ago - pl", () => {
    const result = pl.ago(1791370800000);

    expect(result).toEqual("1 godzinę temu");
  });

  test("instantFull", () => {
    const result = en.instantFull(now);

    expect(result).toEqual("Oct 7, 2026 at 12:00 PM");
  });

  test("instantFull - time zone", () => {
    const format = new DateFormat({ language: "en", today, now, timeZone: "Europe/Warsaw" });

    const result = format.instantFull(now);

    expect(result).toEqual("Oct 7, 2026 at 2:00 PM");
  });

  test("instantFull - pl", () => {
    const format = new DateFormat({ language: "pl", today, now, timeZone: "Europe/Warsaw" });

    const result = format.instantFull(now);

    expect(result).toEqual("7 paź 2026 o 14:00");
  });
});
