import { Clock } from "./clock";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export class CalendarDay {
  private constructor(private readonly timestamp: number) {}

  static from(value: string): CalendarDay {
    const [year, month, day] = value.split("-").map(Number);

    // biome-ignore lint: lint/style/noRestrictedGlobals
    return new CalendarDay(Date.UTC(year!, month! - 1, day!));
  }

  static fromInstant(timestamp: number, timeZone?: string): CalendarDay {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(timestamp);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)!.value;

    return CalendarDay.from(`${part("year")}-${part("month")}-${part("day")}`);
  }

  static today(timeZone?: string): CalendarDay {
    return CalendarDay.fromInstant(Clock.now(), timeZone);
  }

  get year(): number {
    return Number(this.toString().slice(0, 4));
  }

  get month(): number {
    return Number(this.toString().slice(5, 7));
  }

  add(days: number): CalendarDay {
    return new CalendarDay(this.timestamp + days * DAY_IN_MS);
  }

  daysUntil(other: CalendarDay): number {
    return (other.timestamp - this.timestamp) / DAY_IN_MS;
  }

  monthsUntil(other: CalendarDay): number {
    return (other.year - this.year) * 12 + (other.month - this.month);
  }

  toUtcTimestamp(): number {
    return this.timestamp;
  }

  toString(): string {
    return Clock.iso(this.timestamp).slice(0, 10);
  }
}
