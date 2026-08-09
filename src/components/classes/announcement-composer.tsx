"use client";

import { useActionState, useRef, useEffect } from "react";
import { NeumorphicTextarea } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { postAnnouncementAction } from "@/lib/actions/classes";
import type { FormState } from "@/lib/actions/auth";

export function AnnouncementComposer({ classId }: { classId: string }) {
  const action = postAnnouncementAction.bind(null, classId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === null) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <NeumorphicTextarea
        name="body"
        label="Share something with your class"
        placeholder="Announce a reminder, welcome message, or update…"
        required
      />
      {state?.error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      )}
      <NeumorphicButton type="submit" variant="primary" size="sm" disabled={isPending} className="self-end">
        {isPending ? "Posting…" : "Post"}
      </NeumorphicButton>
    </form>
  );
}
