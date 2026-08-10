import { format } from "date-fns";
import { CalendarDays, MapPin } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { EventChip } from "@/components/calendar/event-chip";
import { EmptyState } from "@/components/empty-state";
import type { CalendarItem } from "@/lib/queries/calendar";

export function DayAgenda({ items }: { items: CalendarItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={<CalendarDays size={26} />} title="Nothing scheduled" />;
  }

  return (
    <Surface variant="raised" className="p-3 flex flex-col neu-divide">
      {items.map((item) => (
        <div key={item.id} className="py-3 px-1 flex items-center gap-4 first:pt-1">
          <span className="text-xs font-semibold text-[var(--text-muted)] w-16 shrink-0 tabular-nums">
            {item.allDay ? "All day" : format(item.start, "h:mm a")}
          </span>
          <div className="flex-1 min-w-0">
            <EventChip item={item} />
          </div>
          {item.location && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-[var(--text-muted)] shrink-0">
              <MapPin size={12} />
              {item.location}
            </span>
          )}
        </div>
      ))}
    </Surface>
  );
}
