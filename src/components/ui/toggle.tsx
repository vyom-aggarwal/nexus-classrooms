"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

interface ToggleBaseProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

/**
 * Pill toggle: recessed track, extruded thumb, with a status LED alongside.
 * The default switch for forms and settings.
 */
export function NeumorphicToggle({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  labelClassName,
}: ToggleBaseProps) {
  const id = useId();

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative h-8 w-14 shrink-0 rounded-full neu-pressed transition-opacity",
          disabled && "opacity-45 cursor-not-allowed",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full neu-raised-sm transition-all duration-200 ease-out",
            checked
              ? "left-[calc(100%-1.625rem)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))]"
              : "left-1",
          )}
          style={checked ? { boxShadow: "var(--glow-accent)" } : undefined}
        />
      </button>
      {/* Status LED — reads at a glance without needing to parse the thumb position. */}
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full transition-all duration-200",
          checked ? "bg-[var(--success)]" : "bg-[var(--surface-shadow)]",
        )}
        style={checked ? { boxShadow: "var(--glow-success)" } : undefined}
      />
      {label && (
        <label
          htmlFor={id}
          className={cn("text-sm text-[var(--text-secondary)] select-none cursor-pointer", labelClassName)}
        >
          {label}
        </label>
      )}
    </div>
  );
}

/**
 * Analog rocker switch: an extruded housing with an inset ON/OFF legend and a
 * lit red actuator. Used where a setting deserves physical weight.
 */
export function NeumorphicSwitch({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
  labelClassName,
}: ToggleBaseProps) {
  const id = useId();

  return (
    <div className={cn("inline-flex items-center gap-4", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "neu-raised-sm rounded-[var(--radius-control)] flex items-center gap-3 px-3 py-2 transition-opacity",
          disabled && "opacity-45 cursor-not-allowed",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "text-[11px] font-bold tracking-widest transition-colors duration-200 w-7 text-left",
            checked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
          )}
        >
          {checked ? "ON" : "OFF"}
        </span>
        <span
          aria-hidden
          className={cn(
            "relative h-7 w-12 rounded-md overflow-hidden transition-all duration-200",
            checked ? "" : "brightness-[0.62] saturate-[0.75]",
          )}
          style={{
            background: "linear-gradient(145deg, #ff5c4d, #d8261a)",
            boxShadow: checked
              ? "var(--glow-danger), inset 0 1px 2px rgba(255,255,255,0.45)"
              : "inset 0 2px 5px rgba(0,0,0,0.45)",
          }}
        >
          {/* Ridged actuator face — the "analog" cue. */}
          <span
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 1px, transparent 1px 4px)",
            }}
          />
        </span>
      </button>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm text-[var(--text-secondary)] select-none cursor-pointer leading-snug",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
