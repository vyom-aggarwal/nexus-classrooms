import { eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/queries/calendar";

export function WeekAgenda({ start, end, items }: { start: Date; end: Date; items: CalendarItem[] }) {
  const days = eachDayOfInterval({ start, end });

  if (items.length === 0) {
    return <EmptyState icon={<CalendarDays size={26} />} title="Nothing scheduled this week" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map((day) => {
        const dayItems = items.filter((i) => isSameDay(i.start, day));
        const today = isToday(day);

        return (
          <Surface key={day.toISOString()} variant="raised" className="p-3 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full shrink-0",
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
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {format(day, "EEE")}
              </span>
            </div>
            <div className="flex flex-col gap-1.5 min-h-12">
              {dayItems.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)]">—</span>
              ) : (
                dayItems.map((item) => <EventChip key={item.id} item={item} compact />)
              )}
            </div>
          </Surface>
        );
      })}
    </div>
  );
}
