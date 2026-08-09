"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { EventForm } from "@/components/calendar/event-form";

export function NewEventPanel({ canScopeToClass, classes }: { canScopeToClass: boolean; classes: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <NeumorphicButton variant="primary" onClick={() => setOpen(true)}>
        <Plus size={18} />
        New event
      </NeumorphicButton>
    );
  }

  return (
    <NeumorphicCard className="max-w-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-primary)]">New event</h2>
        <NeumorphicButton variant="flat" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </NeumorphicButton>
      </div>
      <EventForm canScopeToClass={canScopeToClass} classes={classes} />
    </NeumorphicCard>
  );
}
