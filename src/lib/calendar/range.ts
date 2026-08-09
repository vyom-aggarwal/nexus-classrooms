import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarView = "month" | "week" | "day";

export function parseCalendarParams(searchParams: { view?: string; date?: string }) {
  const view: CalendarView =
    searchParams.view === "week" || searchParams.view === "day" ? searchParams.view : "month";
  const date = searchParams.date && !Number.isNaN(Date.parse(searchParams.date)) ? new Date(searchParams.date) : new Date();
  return { view, date };
}

export function getRange(view: CalendarView, date: Date) {
  switch (view) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "week":
      return { start: startOfWeek(date), end: endOfWeek(date) };
    case "month":
    default:
      return { start: startOfWeek(startOfMonth(date)), end: endOfWeek(endOfMonth(date)) };
  }
}

export function shiftDate(view: CalendarView, date: Date, direction: 1 | -1) {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addWeeks(date, direction);
  return addMonths(date, direction);
}
