import { format } from "date-fns";
import { FileText, ClipboardList, Megaphone } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/surface";

const TYPE_META = {
  ANNOUNCEMENT: { icon: Megaphone, label: "Announcement" },
  ASSIGNMENT: { icon: ClipboardList, label: "Assignment" },
  MATERIAL: { icon: FileText, label: "Material" },
} as const;

export function PostCard({
  type,
  title,
  body,
  authorName,
  createdAt,
  dueAt,
  points,
}: {
  type: "ANNOUNCEMENT" | "ASSIGNMENT" | "MATERIAL";
  title: string;
  body?: string | null;
  authorName: string;
  createdAt: Date;
  dueAt?: Date | null;
  points?: number | null;
}) {
  const { icon: Icon, label } = TYPE_META[type];

  return (
    <NeumorphicCard className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <Icon size={14} />
        <span>{label}</span>
        <span>·</span>
        <span>{authorName}</span>
        <span>·</span>
        <span>{format(createdAt, "MMM d, h:mm a")}</span>
      </div>
      {type !== "ANNOUNCEMENT" && <h3 className="font-semibold text-[var(--text-primary)]">{title}</h3>}
      {body && <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{body}</p>}
      {(dueAt || points != null) && (
        <div className="flex gap-3 text-xs text-[var(--text-secondary)] mt-1">
          {dueAt && <span>Due {format(dueAt, "MMM d, h:mm a")}</span>}
          {points != null && <span>{points} pts</span>}
        </div>
      )}
    </NeumorphicCard>
  );
}
