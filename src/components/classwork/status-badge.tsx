import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type Status = "DRAFT" | "ASSIGNED" | "TURNED_IN" | "RETURNED" | "MISSING";

const META: Record<Status, { label: string; text: string; dot: string; glow?: string }> = {
  DRAFT: { label: "Draft", text: "text-[var(--text-muted)]", dot: "var(--surface-shadow)" },
  ASSIGNED: { label: "Assigned", text: "text-[var(--text-secondary)]", dot: "var(--text-muted)" },
  TURNED_IN: { label: "Turned in", text: "text-[var(--success-text)]", dot: "var(--success)", glow: "var(--glow-success)" },
  RETURNED: { label: "Graded", text: "text-[var(--accent-text)]", dot: "var(--accent)", glow: "var(--glow-accent)" },
  MISSING: { label: "Missing", text: "text-[var(--danger-text)]", dot: "var(--danger)", glow: "var(--glow-danger)" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const meta = META[status];

  return (
    <Surface
      variant="pressed"
      depth="sm"
      rounded="full"
      className={cn("px-3 py-1.5 text-xs font-semibold inline-flex items-center gap-2 shrink-0", meta.text, className)}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: meta.dot, boxShadow: meta.glow }}
      />
      {meta.label}
    </Surface>
  );
}
