import { cn } from "@/lib/utils";

/**
 * The Nexus mark: an "N" drawn as a single connected path with the terminal
 * rendered as a node — the letterform and the "point where things connect"
 * idea in one shape. Strokes are geometric and evenly weighted so it stays
 * legible down to favicon size.
 */
export function LogoMark({
  size = 32,
  className,
  nodeClassName,
  title,
}: {
  size?: number;
  className?: string;
  nodeClassName?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {title && <title>{title}</title>}
      {/* bottom-left → top-left → bottom-right → top-right */}
      <path
        d="M9 24V8l14 16V8"
        stroke="currentColor"
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={23} cy={8} r={3.6} className={cn("fill-current", nodeClassName)} />
    </svg>
  );
}

/**
 * Mark inside a neumorphic tile — the app-icon lockup used in nav and headers.
 */
export function LogoTile({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "neu-raised-sm rounded-[var(--radius-control)] inline-flex items-center justify-center shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <LogoMark
        size={Math.round(size * 0.62)}
        className="text-[var(--text-primary)]"
        nodeClassName="text-[var(--accent)]"
      />
    </span>
  );
}

/**
 * Full lockup: tile + wordmark. `stacked` puts "Classroom" on a second line,
 * which is what the narrow sidebar needs.
 */
export function Logo({
  size = 40,
  stacked = false,
  className,
}: {
  size?: number;
  stacked?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoTile size={size} />
      {stacked ? (
        <span className="leading-tight">
          <span className="block font-semibold text-[var(--text-primary)] tracking-tight">Nexus</span>
          <span className="block text-xs text-[var(--text-muted)]">Classroom</span>
        </span>
      ) : (
        <span className="font-semibold text-[var(--text-primary)] tracking-tight">
          Nexus <span className="text-[var(--text-muted)] font-normal">Classroom</span>
        </span>
      )}
    </span>
  );
}
