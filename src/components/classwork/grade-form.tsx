"use client";

import { useActionState } from "react";
import { NeumorphicInput, NeumorphicTextarea } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { gradeSubmissionAction } from "@/lib/actions/grades";
import type { FormState } from "@/lib/actions/auth";

export function GradeForm({
  classId,
  postId,
  submissionId,
  points,
  initial,
}: {
  classId: string;
  postId: string;
  submissionId: string;
  points: number | null;
  initial: { score: number | null; feedback: string | null };
}) {
  const action = gradeSubmissionAction.bind(null, classId, postId, submissionId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <NeumorphicInput
          label={`Score${points != null ? ` (out of ${points})` : ""}`}
          name="score"
          type="number"
          min={0}
          step="any"
          defaultValue={initial.score ?? ""}
          required
          className="max-w-[10rem]"
        />
      </div>
      <NeumorphicTextarea
        label="Feedback (optional)"
        name="feedback"
        defaultValue={initial.feedback ?? ""}
        placeholder="Leave a note for the student…"
      />
      {state?.error && (
        <p className="text-sm text-[var(--danger-text)] font-medium" role="alert">
          {state.error}
        </p>
      )}
      <NeumorphicButton type="submit" variant="success" disabled={isPending} className="self-end">
        {isPending ? "Saving…" : "Return grade"}
      </NeumorphicButton>
    </form>
  );
}
