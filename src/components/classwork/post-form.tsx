"use client";

import { useActionState } from "react";
import { NeumorphicInput, NeumorphicTextarea } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { savePostAction } from "@/lib/actions/classwork";
import type { FormState } from "@/lib/actions/auth";

interface PostFormProps {
  classId: string;
  postId?: string;
  type: "ASSIGNMENT" | "MATERIAL";
  topics: { id: string; title: string }[];
  initial?: {
    title: string;
    body?: string | null;
    topicId?: string | null;
    dueAt?: Date | null;
    points?: number | null;
  };
}

function toLocalDateTimeInput(date?: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PostForm({ classId, postId, type, topics, initial }: PostFormProps) {
  const action = savePostAction.bind(null, classId, postId ?? null);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="type" value={type} />

      <NeumorphicInput
        label={type === "ASSIGNMENT" ? "Assignment title" : "Material title"}
        name="title"
        defaultValue={initial?.title}
        required
      />

      <NeumorphicTextarea
        label="Instructions"
        name="body"
        defaultValue={initial?.body ?? ""}
        placeholder="Add instructions, context, or a description…"
      />

      {topics.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="topicId" className="text-sm font-medium text-[var(--text-secondary)]">
            Topic
          </label>
          <select
            id="topicId"
            name="topicId"
            defaultValue={initial?.topicId ?? ""}
            className="neu-pressed rounded-[var(--radius-control)] px-4 py-2.5 text-[var(--text-primary)] outline-none"
          >
            <option value="">No topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {type === "ASSIGNMENT" && (
        <div className="grid grid-cols-2 gap-4">
          <NeumorphicInput
            label="Due date"
            name="dueAt"
            type="datetime-local"
            defaultValue={toLocalDateTimeInput(initial?.dueAt)}
          />
          <NeumorphicInput
            label="Points"
            name="points"
            type="number"
            min={0}
            defaultValue={initial?.points ?? 100}
          />
        </div>
      )}

      <Surface variant="pressed" className="p-4 flex flex-col gap-3">
        <label htmlFor="attachments" className="text-sm font-medium text-[var(--text-secondary)]">
          Attach files
        </label>
        <input
          id="attachments"
          name="attachments"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
          className="text-sm text-[var(--text-primary)] file:mr-3 file:rounded-[var(--radius-control)] file:border-0 file:bg-[var(--surface)] file:px-3 file:py-1.5 file:neu-raised-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <NeumorphicInput name="linkLabel" placeholder="Link label (optional)" />
          <NeumorphicInput name="linkUrl" placeholder="https://…" type="url" />
        </div>
      </Surface>

      {state?.error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 justify-end">
        <NeumorphicButton type="submit" name="intent" value="draft" variant="flat" disabled={isPending}>
          Save draft
        </NeumorphicButton>
        <NeumorphicButton type="submit" name="intent" value="publish" variant="primary" disabled={isPending}>
          {isPending ? "Saving…" : "Publish"}
        </NeumorphicButton>
      </div>
    </form>
  );
}
