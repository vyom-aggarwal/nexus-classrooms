"use client";

import { useActionState } from "react";
import { Surface } from "@/components/ui/surface";
import { NeumorphicTextarea } from "@/components/ui/input";
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
    <Surface variant="raised" className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-primary)]">Your work</h2>
        <StatusBadge status={status} />
      </div>

      {submission?.grade && (
        <Surface variant="pressed" className="p-4 flex flex-col gap-1">
          <p className="font-semibold text-[var(--text-primary)]">
            {submission.grade.score}
            {points != null ? ` / ${points}` : ""}
          </p>
          {submission.grade.feedback && (
            <p className="text-sm text-[var(--text-secondary)]">{submission.grade.feedback}</p>
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="files" className="text-sm font-medium text-[var(--text-secondary)]">
            Attach files
          </label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
            className="text-sm text-[var(--text-primary)] file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-[var(--surface)] file:px-3 file:py-1.5 file:neu-raised-sm"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
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
