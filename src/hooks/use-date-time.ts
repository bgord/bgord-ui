import { Clock } from "../services/clock";
import { useDateFormat } from "./use-date-format";

export type UseDateTimeOptions =
  | { value: string; format: "dayLabel" | "freshness" | "list" | "relativeDay" | "short" }
  | { value: number; format: "ago" };

export function useDateTime(options: UseDateTimeOptions) {
  const format = useDateFormat();

  if (options.format === "ago") {
    return {
      text: format.ago(options.value),
      full: format.instantFull(options.value),
      dateTime: Clock.iso(options.value),
    };
  }

  return {
    text: format[options.format](options.value),
    full: format.full(options.value),
    dateTime: options.value,
  };
}
