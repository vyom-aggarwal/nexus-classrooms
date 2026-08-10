import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Segmented control: one recessed track holding several options, with the
 * selected one extruded. Reads far better than a row of individually pressed
 * buttons because the track groups them into a single physical part.
 */
export function SegmentedTrack({
  children,
  className,
  ...props
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("neu-pressed rounded-[var(--radius-control)] p-1.5 inline-flex gap-1.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function segmentedItemClasses({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius-control)-4px)] px-4 h-9 text-sm font-medium whitespace-nowrap transition-all duration-200",
    active
      ? "neu-raised-sm text-[var(--accent-text)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
    className,
  );
}

export function SegmentedButton({
  active,
  className,
  ...props
}: { active: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={segmentedItemClasses({ active, className })}
      {...props}
    />
  );
}
