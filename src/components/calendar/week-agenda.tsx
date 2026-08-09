import { eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import type { CalendarItem } from "@/lib/queries/calendar";

export function WeekAgenda({ start, end, items }: { start: Date; end: Date; items: CalendarItem[] }) {
  const days = eachDayOfInterval({ start, end });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {days.map((day) => {
        const dayItems = items.filter((i) => isSameDay(i.start, day));
        return (
          <Surface key={day.toISOString()} variant="raised" className="p-3 flex flex-col gap-2">
            <div className={cn("text-xs font-semibold", isToday(day) ? "text-[var(--accent)]" : "text-[var(--text-secondary)]")}>
              {format(day, "EEE d")}
            </div>
            <div className="flex flex-col gap-1.5 min-h-16">
              {dayItems.length === 0 ? (
                <span className="text-xs text-[var(--text-muted)]">—</span>
              ) : (
                dayItems.map((item) => <EventChip key={item.id} item={item} compact />)
              )}
            </div>
          </Surface>
        );
      })}
      {items.length === 0 && (
        <div className="md:col-span-7">
          <EmptyState icon={<CalendarDays size={28} />} title="Nothing scheduled this week" />
        </div>
      )}
    </div>
  );
}
