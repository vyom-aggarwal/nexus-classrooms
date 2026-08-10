import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

export type SurfaceVariant = "raised" | "pressed" | "flat";
export type SurfaceDepth = "sm" | "md" | "lg";
export type SurfaceGlow = "accent" | "danger" | "warning" | "success";

const variantClass: Record<SurfaceVariant, Record<SurfaceDepth, string>> = {
  raised: { sm: "neu-raised-sm", md: "neu-raised", lg: "neu-raised-lg" },
  // Pressed only has two useful weights; `lg` maps to the deeper inset.
  pressed: { sm: "neu-pressed", md: "neu-pressed-lg", lg: "neu-pressed-lg" },
  flat: { sm: "neu-flat", md: "neu-flat", lg: "neu-flat" },
};

const glowClass: Record<SurfaceGlow, string> = {
  accent: "glow-accent",
  danger: "glow-danger",
  warning: "glow-warning",
  success: "glow-success",
};

const roundedClass = {
  card: "rounded-[var(--radius-card)]",
  control: "rounded-[var(--radius-control)]",
  full: "rounded-full",
  none: "",
};

type SurfaceProps<T extends ElementType> = {
  as?: T;
  variant?: SurfaceVariant;
  depth?: SurfaceDepth;
  rounded?: keyof typeof roundedClass;
  /** Adds a coloured halo on top of the depth shadow. Carries most of the visual weight in dark mode. */
  glow?: SurfaceGlow;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Surface<T extends ElementType = "div">({
  as,
  variant = "raised",
  depth = "md",
  rounded = "card",
  glow,
  className,
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(
        variantClass[variant][depth],
        roundedClass[rounded],
        // Glow replaces the box-shadow, so it must win over the depth class.
        glow && glowClass[glow],
        className,
      )}
      {...props}
    />
  );
}

/** Preset: the default content card used throughout the app. */
export function NeumorphicCard({
  className,
  ...props
}: Omit<SurfaceProps<"div">, "as" | "rounded">) {
  return <Surface rounded="card" className={cn("p-6", className)} {...props} />;
}
