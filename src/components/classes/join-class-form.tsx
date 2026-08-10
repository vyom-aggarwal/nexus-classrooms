"use client";

import { useActionState } from "react";
import { NeumorphicInput } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { joinClassAction } from "@/lib/actions/classes";
import type { FormState } from "@/lib/actions/auth";

export function JoinClassForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(joinClassAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <NeumorphicInput
        label="Invite code"
        name="inviteCode"
        placeholder="7F3-KQ2"
        hint="Ask your teacher for this code."
        className="font-mono tracking-widest uppercase"
        required
      />
      {state?.error && (
        <p className="text-sm text-[var(--danger-text)] font-medium" role="alert">
          {state.error}
        </p>
      )}
      <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="justify-center">
        {isPending ? "Joining…" : "Join class"}
      </NeumorphicButton>
    </form>
  );
}
