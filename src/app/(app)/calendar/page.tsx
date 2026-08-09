import { requireUser } from "@/lib/session";
import { getCalendarItems } from "@/lib/queries/calendar";
import { getMyClasses } from "@/lib/queries/classes";
import { parseCalendarParams, getRange } from "@/lib/calendar/range";
import { CalendarToolbar } from "@/components/calendar/toolbar";
import { MonthGrid } from "@/components/calendar/month-grid";
import { WeekAgenda } from "@/components/calendar/week-agenda";
import { DayAgenda } from "@/components/calendar/day-agenda";
import { NewEventPanel } from "@/components/calendar/new-event-panel";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const user = await requireUser();
  const { view, date } = parseCalendarParams(await searchParams);
  const { start, end } = getRange(view, date);

  const [items, classes] = await Promise.all([
    getCalendarItems(user.id, start, end),
    user.role === "TEACHER" ? getMyClasses(user.id, "TEACHER") : Promise.resolve([]),
  ]);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Calendar</h1>
        <NewEventPanel canScopeToClass={user.role === "TEACHER"} classes={classes.map((c) => ({ id: c.id, name: c.name }))} />
      </div>

      <CalendarToolbar view={view} date={date} />

      {view === "month" && <MonthGrid start={start} end={end} month={date} items={items} />}
      {view === "week" && <WeekAgenda start={start} end={end} items={items} />}
      {view === "day" && <DayAgenda items={items} />}
    </div>
  );
}
