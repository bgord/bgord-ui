import { createContext, useContext } from "react";
import { CalendarDay } from "../services/calendar-day";
import { TimeZone } from "../services/time-zone";

export const TimeZoneContext = createContext(TimeZone.DEFAULT);

export function useTimeZone() {
  return useContext(TimeZoneContext);
}

export function useToday() {
  return CalendarDay.today(useTimeZone());
}
