import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { EmptyState } from "@/components/empty-state";
import type { CalendarItem } from "@/lib/queries/calendar";

export function DayAgenda({ items }: { items: CalendarItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={<CalendarDays size={28} />} title="Nothing scheduled today" />;
  }

  return (
    <Surface variant="raised" className="p-2 flex flex-col divide-y divide-[var(--surface-shadow)]/20">
      {items.map((item) => (
        <div key={item.id} className="p-3 flex items-center gap-4">
          <span className="text-sm text-[var(--text-secondary)] w-20 shrink-0">
            {item.allDay ? "All day" : format(item.start, "h:mm a")}
          </span>
          <div className="flex-1 min-w-0">
            <EventChip item={item} />
          </div>
          {item.location && <span className="text-xs text-[var(--text-muted)] shrink-0">{item.location}</span>}
        </div>
      ))}
    </Surface>
  );
}
