"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput } from "@/components/ui/input";
import { createTopicAction } from "@/lib/actions/classwork";
import type { FormState } from "@/lib/actions/auth";

export function NewTopicButton({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false);
  const action = createTopicAction.bind(null, classId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // Reacting to the server action's result (an external system), not to a
    // local render — this is the documented exception to the lint rule.
    if (state === null) {
      formRef.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <NeumorphicButton variant="flat" onClick={() => setOpen(true)}>
        <Plus size={18} />
        Add topic
      </NeumorphicButton>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-2">
      <NeumorphicInput name="title" placeholder="Unit 1" autoFocus className="w-40" />
      <NeumorphicButton type="submit" variant="primary" size="sm" disabled={isPending}>
        Add
      </NeumorphicButton>
      <NeumorphicButton type="button" variant="flat" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </NeumorphicButton>
      {state?.error && <p className="text-xs text-[var(--danger)]">{state.error}</p>}
    </form>
  );
}
