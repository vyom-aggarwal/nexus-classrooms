import Link from "next/link";
import { format } from "date-fns";
import { Video, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarItem } from "@/lib/queries/calendar";

export function EventChip({ item, compact }: { item: CalendarItem; compact?: boolean }) {
  const color = item.kind === "DEADLINE" ? "var(--danger)" : item.accentColor ?? "var(--accent)";

  const content = (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-[var(--radius-control)] px-2 py-1 text-left w-full",
        "bg-[var(--surface)] neu-raised-sm",
        compact && "text-xs",
      )}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {item.kind === "DEADLINE" ? (
        <ClipboardCheck size={12} className="shrink-0" style={{ color }} />
      ) : item.isVirtual ? (
        <Video size={12} className="shrink-0" style={{ color }} />
      ) : null}
      <span className="truncate text-[var(--text-primary)]">
        {!item.allDay && <span className="text-[var(--text-muted)] mr-1">{format(item.start, "h:mma")}</span>}
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
