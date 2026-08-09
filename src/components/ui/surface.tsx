import { cn } from "@/lib/utils";
import type { ElementType, ComponentPropsWithoutRef } from "react";

export type SurfaceVariant = "raised" | "pressed" | "flat";
export type SurfaceDepth = "sm" | "md";

const variantClass: Record<SurfaceVariant, Record<SurfaceDepth, string>> = {
  raised: { sm: "neu-raised-sm", md: "neu-raised" },
  pressed: { sm: "neu-pressed", md: "neu-pressed-lg" },
  flat: { sm: "neu-flat", md: "neu-flat" },
};

type SurfaceProps<T extends ElementType> = {
  as?: T;
  variant?: SurfaceVariant;
  depth?: SurfaceDepth;
  rounded?: "card" | "control" | "full";
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

const roundedClass = {
  card: "rounded-[var(--radius-card)]",
  control: "rounded-[var(--radius-control)]",
  full: "rounded-full",
};

export function Surface<T extends ElementType = "div">({
  as,
  variant = "raised",
  depth = "md",
  rounded = "card",
  className,
  ...props
}: SurfaceProps<T>) {
  const Component = as ?? "div";
  return (
    <Component
      className={cn(variantClass[variant][depth], roundedClass[rounded], className)}
      {...props}
    />
  );
}

/** Preset: the default content card used throughout the app. */
export function NeumorphicCard({
  className,
  ...props
}: Omit<SurfaceProps<"div">, "as" | "variant" | "rounded">) {
  return (
    <Surface
      variant="raised"
      rounded="card"
      className={cn("p-6", className)}
      {...props}
    />
  );
}
