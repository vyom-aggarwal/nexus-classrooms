import Link from "next/link";
import { format } from "date-fns";
import { Video, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/queries/calendar";

export function EventChip({ item, compact }: { item: CalendarItem; compact?: boolean }) {
  const color = item.kind === "DEADLINE" ? "var(--danger)" : (item.accentColor ?? "var(--accent)");

  const content = (
    <div
      className={cn(
        "neu-raised-sm rounded-[10px] flex items-center gap-1.5 px-2 py-1.5 w-full overflow-hidden",
        "transition-transform duration-150 hover:scale-[1.02]",
        compact ? "text-[11px]" : "text-sm",
      )}
    >
      {/* Lit spine instead of a flat border — keeps the chip feeling extruded. */}
      <span
        aria-hidden
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ background: color, boxShadow: `0 0 8px color-mix(in srgb, ${color} 60%, transparent)` }}
      />
      {item.kind === "DEADLINE" ? (
        <ClipboardCheck size={11} className="shrink-0" style={{ color }} />
      ) : item.isVirtual ? (
        <Video size={11} className="shrink-0" style={{ color }} />
      ) : null}
      <span className="truncate text-[var(--text-primary)] font-medium">
        {!item.allDay && (
          <span className="text-[var(--text-muted)] mr-1 font-normal">{format(item.start, "h:mma")}</span>
        )}
        {item.title}
      </span>
    </div>
  );

  if (item.kind === "DEADLINE" && item.classId && item.postId) {
    return (
      <Link href={`/classes/${item.classId}/classwork/${item.postId}`} className="block">
        {content}
      </Link>
    );
  }

  if (item.kind === "EVENT" && item.isVirtual && item.eventId) {
    return (
      <Link href={`/meet/${item.eventId}`} className="block">
        {content}
      </Link>
    );
  }

  if (item.editable && item.eventId) {
    return (
      <Link href={`/calendar/${item.eventId}/edit`} className="block">
        {content}
      </Link>
    );
  }

  if (item.classId) {
    return (
      <Link href={`/classes/${item.classId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
