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
    <Surface variant="pressed" className="p-8 flex flex-col items-center text-center gap-2">
      {icon && <div className="text-[var(--text-muted)] mb-1">{icon}</div>}
      <p className="font-medium text-[var(--text-primary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-secondary)] max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </Surface>
  );
}
