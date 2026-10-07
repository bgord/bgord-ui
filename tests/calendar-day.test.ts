import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { CalendarDay } from "../src/services/calendar-day";

afterEach(() => setSystemTime());

describe("CalendarDay", () => {
  test("from", () => {
    const day = CalendarDay.from("2026-10-07");

    expect(day.toString()).toEqual("2026-10-07");
  });

  test("fromInstant", () => {
    const day = CalendarDay.fromInstant(1791239400000, "UTC");

    expect(day.toString()).toEqual("2026-10-05");
  });

  test("fromInstant - ahead of UTC", () => {
    const day = CalendarDay.fromInstant(1791239400000, "Europe/Warsaw");

    expect(day.toString()).toEqual("2026-10-06");
  });

  test("fromInstant - behind UTC", () => {
    const day = CalendarDay.fromInstant(1791334800000, "America/Los_Angeles");

    expect(day.toString()).toEqual("2026-10-06");
  });

  test("today", () => {
    setSystemTime(1791374400000);

    const day = CalendarDay.today("Pacific/Kiritimati");

    expect(day.toString()).toEqual("2026-10-08");
  });

  test("year", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.year;

    expect(result).toEqual(2026);
  });

  test("month", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.month;

    expect(result).toEqual(10);
  });

  test("add", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.add(3);

    expect(result.toString()).toEqual("2026-10-10");
  });

  test("add - negative", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.add(-7);

    expect(result.toString()).toEqual("2026-09-30");
  });

  test("add - across year", () => {
    const day = CalendarDay.from("2026-12-31");

    const result = day.add(1);

    expect(result.toString()).toEqual("2027-01-01");
  });

  test("daysUntil", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.daysUntil(CalendarDay.from("2026-10-01"));

    expect(result).toEqual(-6);
  });

  test("daysUntil - across DST change", () => {
    const day = CalendarDay.from("2026-03-28");

    const result = day.daysUntil(CalendarDay.from("2026-03-30"));

    expect(result).toEqual(2);
  });

  test("monthsUntil", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.monthsUntil(CalendarDay.from("2025-11-30"));

    expect(result).toEqual(-11);
  });

  test("monthsUntil - across year", () => {
    const day = CalendarDay.from("2025-12-31");

    const result = day.monthsUntil(CalendarDay.from("2026-01-01"));

    expect(result).toEqual(1);
  });

  test("toUtcTimestamp", () => {
    const day = CalendarDay.from("2026-10-07");

    const result = day.toUtcTimestamp();

    expect(result).toEqual(1791331200000);
  });
});
