import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "raised" | "primary" | "flat" | "pressed" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-base gap-2",
  icon: "h-11 w-11 p-0 justify-center",
};

/**
 * Shared visual style for anything that should look like a neumorphic
 * button — used by the real <button> below, and by non-button interactive
 * elements (e.g. a nav <Link>) that must not be nested inside one.
 */
export function neumorphicButtonClasses({
  variant = "raised",
  size = "md",
  pressed = false,
  disabled = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressed?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-[var(--radius-control)] font-medium select-none disabled:cursor-not-allowed";

  const variantClass = (() => {
    if (pressed) return "neu-pressed text-[var(--accent)]";
    switch (variant) {
      case "primary":
        return "neu-interactive neu-raised-sm bg-[var(--accent)] text-[var(--accent-foreground)]";
      case "danger":
        return "neu-interactive neu-raised-sm text-[var(--danger)]";
      case "flat":
        return "neu-interactive neu-flat text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
      case "pressed":
        return "neu-pressed text-[var(--accent)]";
      case "raised":
      default:
        return "neu-interactive neu-raised-sm text-[var(--text-primary)]";
    }
  })();

  return cn(base, variantClass, sizeClass[size], disabled && "opacity-50 cursor-not-allowed", className);
}

export interface NeumorphicButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Controlled "pushed in" state — for toggles, selected tabs, active mic/cam controls. */
  pressed?: boolean;
}

export const NeumorphicButton = forwardRef<HTMLButtonElement, NeumorphicButtonProps>(
  ({ variant = "raised", size = "md", pressed, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={pressed}
        disabled={disabled}
        className={neumorphicButtonClasses({ variant, size, pressed, disabled, className })}
        {...props}
      />
    );
  },
);
NeumorphicButton.displayName = "NeumorphicButton";
