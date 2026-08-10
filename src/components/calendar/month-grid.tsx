import { eachDayOfInterval, format, isSameDay, isSameMonth, isToday } from "date-fns";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/queries/calendar";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 3;

export function MonthGrid({
  start,
  end,
  month,
  items,
}: {
  start: Date;
  end: Date;
  month: Date;
  items: CalendarItem[];
}) {
  const days = eachDayOfInterval({ start, end });

  return (
    <Surface variant="raised" className="p-4">
      <div className="grid grid-cols-7 gap-2 mb-3">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] py-1"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayItems = items.filter((i) => isSameDay(i.start, day));
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          return (
            <Surface
              key={day.toISOString()}
              variant="pressed"
              depth="sm"
              rounded="control"
              className={cn("min-h-28 p-2 flex flex-col gap-1.5", !inMonth && "opacity-40")}
            >
              <span
                className={cn(
                  "text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full shrink-0",
                  today ? "text-[var(--accent-foreground)]" : "text-[var(--text-secondary)]",
                )}
                style={
                  today
                    ? {
                        background: "linear-gradient(145deg,var(--accent-hover),var(--accent))",
                        boxShadow: "var(--glow-accent)",
                      }
                    : undefined
                }
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-1 min-w-0">
                {dayItems.slice(0, MAX_VISIBLE).map((item) => (
                  <EventChip key={item.id} item={item} compact />
                ))}
                {dayItems.length > MAX_VISIBLE && (
                  <span className="text-[10px] text-[var(--text-muted)] px-1 font-medium">
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
