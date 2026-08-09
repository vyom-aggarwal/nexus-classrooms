"use client";

import { useActionState } from "react";
import { NeumorphicInput } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { createClassAction } from "@/lib/actions/classes";
import type { FormState } from "@/lib/actions/auth";

export function CreateClassForm() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(createClassAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <NeumorphicInput label="Class name" name="name" placeholder="AP Biology" required />
      <div className="grid grid-cols-2 gap-4">
        <NeumorphicInput label="Subject" name="subject" placeholder="Science" />
        <NeumorphicInput label="Section" name="section" placeholder="Period 3" />
      </div>
      {state?.error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      )}
      <NeumorphicButton type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Creating…" : "Create class"}
      </NeumorphicButton>
    </form>
  );
}
