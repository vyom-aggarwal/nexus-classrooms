"use client";

import { useActionState } from "react";
import { Surface } from "@/components/ui/surface";
import { NeumorphicTextarea, NeumorphicFileInput } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { AttachmentList } from "@/components/classwork/attachment-list";
import { StatusBadge } from "@/components/classwork/status-badge";
import { submitWorkAction } from "@/lib/actions/classwork";
import type { FormState } from "@/lib/actions/auth";

interface SubmissionComposerProps {
  postId: string;
  points: number | null;
  submission: {
    status: "ASSIGNED" | "TURNED_IN" | "RETURNED" | "MISSING";
    content: string | null;
    attachments: { attachment: { id: string; filename: string; url: string; mimeType: string } }[];
    grade: { score: number; feedback: string | null } | null;
  } | null;
}

export function SubmissionComposer({ postId, points, submission }: SubmissionComposerProps) {
  const action = submitWorkAction.bind(null, postId);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);

  const status = submission?.status ?? "MISSING";

  return (
    <Surface variant="raised" className="p-6 md:p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-[var(--text-primary)] text-lg">Your work</h2>
        <StatusBadge status={status} />
      </div>

      {submission?.grade && (
        <Surface variant="pressed" rounded="control" className="p-5 flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums leading-none">
              {submission.grade.score}
            </span>
            {points != null && (
              <span className="text-base text-[var(--text-muted)] font-medium">/ {points}</span>
            )}
          </div>
          {submission.grade.feedback && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{submission.grade.feedback}</p>
          )}
        </Surface>
      )}

      {submission && submission.attachments.length > 0 && (
        <AttachmentList attachments={submission.attachments.map((a) => a.attachment)} />
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <NeumorphicTextarea
          name="content"
          label={status === "MISSING" ? "Write your answer" : "Update your answer"}
          defaultValue={submission?.content ?? ""}
          placeholder="Type your response here…"
        />
        <NeumorphicFileInput
          id="files"
          name="files"
          label="Attach files"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
        />
        {state?.error && (
          <p className="text-sm text-[var(--danger-text)] font-medium" role="alert">
            {state.error}
          </p>
        )}
        <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="self-end">
          {isPending ? "Submitting…" : status === "MISSING" ? "Turn in" : "Resubmit"}
        </NeumorphicButton>
      </form>
    </Surface>
  );
}
