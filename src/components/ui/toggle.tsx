"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

interface NeumorphicToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function NeumorphicToggle({
  checked,
  onCheckedChange,
  label,
  disabled,
  className,
}: NeumorphicToggleProps) {
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
          "relative h-7 w-13 shrink-0 rounded-full neu-pressed transition-opacity",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        style={{ width: "3.25rem" }}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full neu-raised-sm transition-all duration-150",
            checked ? "left-[calc(100%-1.5rem)] bg-[var(--accent)]" : "left-1",
          )}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm text-[var(--text-secondary)] select-none">
          {label}
        </label>
      )}
    </div>
  );
}
