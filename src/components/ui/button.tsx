import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "raised" | "primary" | "flat" | "pressed" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";
export type ButtonShape = "rounded" | "circle";

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-12 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
  icon: "h-12 w-12 p-0 justify-center",
  "icon-sm": "h-9 w-9 p-0 justify-center",
};

const shapeClass: Record<ButtonShape, string> = {
  rounded: "rounded-[var(--radius-control)]",
  circle: "rounded-full",
};

/**
 * Shared visual style for anything that should look like a neumorphic
 * button — used by the real <button> below, and by non-button interactive
 * elements (e.g. a nav <Link>) that must not be nested inside one.
 */
export function neumorphicButtonClasses({
  variant = "raised",
  size = "md",
  shape = "rounded",
  pressed = false,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
} = {}) {
  const base =
    "inline-flex items-center font-medium select-none disabled:cursor-not-allowed";

  const variantClass = (() => {
    // A controlled pressed state always wins — it's how tabs, toggles and
    // the meeting mic/cam controls read as "on".
    if (pressed) {
      switch (variant) {
        case "primary":
          return "neu-pressed text-[var(--accent-text)]";
        case "danger":
          return "neu-pressed text-[var(--danger-text)]";
        default:
          return "neu-pressed text-[var(--accent-text)]";
      }
    }
    switch (variant) {
      case "primary":
        return "neu-interactive glow-accent text-[var(--accent-foreground)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))] hover:brightness-110";
      case "danger":
        return "neu-interactive glow-danger text-white bg-[linear-gradient(145deg,var(--danger),color-mix(in_srgb,var(--danger)_80%,black))] hover:brightness-110";
      case "success":
        return "neu-interactive glow-success text-white bg-[linear-gradient(145deg,var(--success),color-mix(in_srgb,var(--success)_80%,black))] hover:brightness-110";
      case "flat":
        return "neu-interactive neu-flat text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
      case "pressed":
        return "neu-pressed text-[var(--accent-text)]";
      case "raised":
      default:
        return "neu-interactive neu-raised-sm text-[var(--text-primary)]";
    }
  })();

  return cn(
    base,
    variantClass,
    sizeClass[size],
    shapeClass[shape],
    disabled && "opacity-45 cursor-not-allowed",
    className,
  );
}

export interface NeumorphicButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  /** Controlled "pushed in" state — for toggles, selected tabs, active mic/cam controls. */
  pressed?: boolean;
}

export const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ variant = "raised", size = "md", shape = "rounded", pressed, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={pressed}
        disabled={disabled}
        className={neumorphicButtonClasses({ variant, size, shape, pressed, disabled, className })}
        {...props}
      />
    );
  },
);
NeumorphicButton.displayName = "NeumorphicButton";
