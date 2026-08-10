import { cn } from "@/lib/utils";

export type ProgressTone = "accent" | "success" | "warning" | "danger";

const toneVars: Record<ProgressTone, { from: string; to: string; glow: string }> = {
  accent: { from: "var(--accent-hover)", to: "var(--accent)", glow: "var(--glow-accent)" },
  success: { from: "var(--success)", to: "var(--success)", glow: "var(--glow-success)" },
  warning: { from: "var(--warning)", to: "var(--warning)", glow: "var(--glow-warning)" },
  danger: { from: "var(--danger)", to: "var(--danger)", glow: "var(--glow-danger)" },
};

/** Recessed track with an extruded, lit fill. */
export function NeumorphicProgress({
  value,
  max = 100,
  tone = "accent",
  label,
  className,
}: {
  value: number;
  max?: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const { from, to, glow } = toneVars[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn("neu-pressed rounded-full h-3 w-full p-[3px]", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(145deg, ${from}, ${to})`,
          boxShadow: pct > 0 ? glow : undefined,
        }}
      />
    </div>
  );
}

/** Carousel position indicator — the active dot sits proud of the surface. */
export function PaginationDots({
  count,
  active,
  onSelect,
  className,
}: {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2.5", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const isActive = i === active;
        const dot = (
          <span
            className={cn(
              "block rounded-full transition-all duration-200",
              isActive ? "h-2.5 w-2.5 neu-raised-sm" : "h-2 w-2 neu-pressed",
            )}
            style={isActive ? { background: "var(--accent)", boxShadow: "var(--glow-accent)" } : undefined}
          />
        );

        return onSelect ? (
          <button key={i} type="button" onClick={() => onSelect(i)} aria-label={`Go to item ${i + 1}`} aria-current={isActive}>
            {dot}
          </button>
        ) : (
          <span key={i} aria-hidden>
            {dot}
          </span>
        );
      })}
    </div>
  );
}
