import { CalendarDay } from "./calendar-day";

const Shape = {
  full: { day: "numeric", month: "short", year: "numeric" },
  short: { day: "numeric", month: "short" },
  list: { weekday: "short", day: "numeric", month: "short" },
  month: { month: "long", year: "numeric" },
  instant: { dateStyle: "medium", timeStyle: "short" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

const RELATIVE_DAYS = 3;

type DateFormatConfig = { language: string; today: CalendarDay; now: number; timeZone?: string };

export class DateFormat {
  constructor(private readonly config: DateFormatConfig) {}

  // Oct 7, 2026
  full(date: string): string {
    return this.day(date, Shape.full);
  }

  // Oct 7 · Oct 7, 2025
  short(date: string): string {
    return this.day(date, this.withYear(date, Shape.short));
  }

  // Wed, Oct 7 · Tue, Oct 7, 2025
  list(date: string): string {
    return this.day(date, this.withYear(date, Shape.list));
  }

  // October 2026
  month(date: string): string {
    return this.day(date, Shape.month);
  }

  // { month: "Oct", day: "7", weekday: "Wed" }
  parts(date: string) {
    return {
      month: this.day(date, { month: "short" }),
      day: this.day(date, { day: "numeric" }),
      weekday: this.day(date, { weekday: "short" }),
    };
  }

  // Sep 29 – Oct 5, 2026
  range(from: string, to: string): string {
    return new Intl.DateTimeFormat(this.config.language, { ...Shape.full, timeZone: "UTC" }).formatRange(
      CalendarDay.from(from).toUtcTimestamp(),
      CalendarDay.from(to).toUtcTimestamp(),
    );
  }

  // Yesterday · Today · Tomorrow · Fri, Oct 9
  dayLabel(date: string): string {
    return this.nearDay(date, 1);
  }

  // 3 days ago · Yesterday · Today · In 3 days · Sun, Oct 11
  relativeDay(date: string): string {
    return this.nearDay(date, RELATIVE_DAYS);
  }

  // yesterday · 3 days ago · last week · 2 months ago · last year
  freshness(date: string): string {
    const days = this.config.today.daysUntil(CalendarDay.from(date));
    const weeks = Math.sign(days) * Math.round(Math.abs(days) / 7);
    const months = this.config.today.monthsUntil(CalendarDay.from(date));

    if (Math.abs(days) < 7) return this.relative(days, "day");
    if (Math.abs(days) < 35) return this.relative(weeks, "week");
    if (Math.abs(months) < 12) return this.relative(months, "month");
    return this.relative(Math.trunc(months / 12), "year");
  }

  // now · 5 minutes ago · 3 hours ago · yesterday
  ago(instant: number): string {
    const seconds = Math.round((instant - this.config.now) / 1000);
    const minutes = Math.trunc(seconds / 60);
    const hours = Math.trunc(seconds / 3600);

    if (Math.abs(seconds) < 60) return this.relative(0, "second");
    if (Math.abs(minutes) < 60) return this.relative(minutes, "minute");
    if (Math.abs(hours) < 24) return this.relative(hours, "hour");
    return this.freshness(CalendarDay.fromInstant(instant, this.config.timeZone).toString());
  }

  // Oct 7, 2026 at 2:00 PM
  instantFull(instant: number): string {
    return new Intl.DateTimeFormat(this.config.language, {
      ...Shape.instant,
      timeZone: this.config.timeZone,
    }).format(instant);
  }

  private day(date: string, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.config.language, { ...options, timeZone: "UTC" }).format(
      CalendarDay.from(date).toUtcTimestamp(),
    );
  }

  private nearDay(date: string, window: number): string {
    const days = this.config.today.daysUntil(CalendarDay.from(date));

    if (Math.abs(days) > window) return this.list(date);

    const label = this.relative(days, "day");
    return `${label.charAt(0).toLocaleUpperCase(this.config.language)}${label.slice(1)}`;
  }

  private withYear(date: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormatOptions {
    return CalendarDay.from(date).year === this.config.today.year ? options : { ...options, year: "numeric" };
  }

  private relative(value: number, unit: Intl.RelativeTimeFormatUnit): string {
    return new Intl.RelativeTimeFormat(this.config.language, { numeric: "auto" }).format(value, unit);
  }
}
