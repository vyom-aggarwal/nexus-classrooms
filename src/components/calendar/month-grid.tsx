import { eachDayOfInterval, format, isSameDay, isSameMonth, isToday } from "date-fns";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/queries/calendar";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 3;

export function MonthGrid({ start, end, month, items }: { start: Date; end: Date; month: Date; items: CalendarItem[] }) {
  const days = eachDayOfInterval({ start, end });

  return (
    <Surface variant="raised" className="p-3">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-semibold text-[var(--text-muted)] py-1">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayItems = items.filter((i) => isSameDay(i.start, day));
          const inMonth = isSameMonth(day, month);
          return (
            <Surface
              key={day.toISOString()}
              variant={isToday(day) ? "pressed" : "flat"}
              depth="sm"
              className={cn("min-h-24 p-1.5 flex flex-col gap-1", !inMonth && "opacity-40")}
            >
              <span className={cn("text-xs font-medium", isToday(day) ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-1">
                {dayItems.slice(0, MAX_VISIBLE).map((item) => (
                  <EventChip key={item.id} item={item} compact />
                ))}
                {dayItems.length > MAX_VISIBLE && (
                  <span className="text-[10px] text-[var(--text-muted)] px-1">
                    +{dayItems.length - MAX_VISIBLE} more
                  </span>
                )}
              </div>
            </Surface>
          );
        })}
      </div>
    </Surface>
  );
}
