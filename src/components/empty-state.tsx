import type { ReactNode } from "react";
import { Surface } from "@/components/ui/surface";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Surface variant="pressed" className="p-10 flex flex-col items-center text-center gap-3">
      {icon && (
        <Surface
          variant="raised"
          depth="sm"
          rounded="full"
          className="h-16 w-16 flex items-center justify-center text-[var(--text-muted)] mb-1"
        >
          {icon}
        </Surface>
      )}
      <p className="font-semibold text-[var(--text-primary)]">{title}</p>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Surface>
  );
}
