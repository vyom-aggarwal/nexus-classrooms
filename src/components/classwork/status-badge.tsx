import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  DRAFT: "text-[var(--text-muted)]",
  ASSIGNED: "text-[var(--text-secondary)]",
  TURNED_IN: "text-[var(--success)]",
  RETURNED: "text-[var(--accent)]",
  MISSING: "text-[var(--danger)]",
};

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ASSIGNED: "Assigned",
  TURNED_IN: "Turned in",
  RETURNED: "Graded",
  MISSING: "Missing",
};

export function StatusBadge({ status, className }: { status: keyof typeof LABELS; className?: string }) {
  return (
    <Surface variant="pressed" depth="sm" rounded="full" className={cn("px-3 py-1 text-xs font-medium", STYLES[status], className)}>
      {LABELS[status]}
    </Surface>
  );
}
