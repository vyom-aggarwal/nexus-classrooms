"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { NeumorphicButton } from "@/components/ui/button";
import { deleteEventAction } from "@/lib/actions/calendar";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <NeumorphicButton
      type="button"
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this event?")) return;
        startTransition(async () => {
          await deleteEventAction(eventId);
          router.push("/calendar");
        });
      }}
    >
      <Trash2 size={16} />
      Delete
    </NeumorphicButton>
  );
}
