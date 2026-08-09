"use client";

import { useActionState, useState } from "react";
import { NeumorphicInput, NeumorphicTextarea } from "@/components/ui/input";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicToggle } from "@/components/ui/toggle";
import { saveEventAction } from "@/lib/actions/calendar";
import type { FormState } from "@/lib/actions/auth";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toLocalDateTimeInput(date?: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

interface EventFormProps {
  eventId?: string;
  canScopeToClass: boolean;
  classes: { id: string; name: string }[];
  initial?: {
    title: string;
    description?: string | null;
    scope: "PERSONAL" | "CLASS" | "GLOBAL";
    classId?: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    location?: string | null;
    isVirtual: boolean;
  };
}

export function EventForm({ eventId, canScopeToClass, classes, initial }: EventFormProps) {
  const action = saveEventAction.bind(null, eventId ?? null);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(action, null);
  const [scope, setScope] = useState(initial?.scope ?? "PERSONAL");
  const [freq, setFreq] = useState<"NONE" | "DAILY" | "WEEKLY">("NONE");
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [isVirtual, setIsVirtual] = useState(initial?.isVirtual ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <NeumorphicInput label="Title" name="title" defaultValue={initial?.title} required />

      {canScopeToClass && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="scope" className="text-sm font-medium text-[var(--text-secondary)]">
            Applies to
          </label>
          <select
            id="scope"
            name="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="neu-pressed rounded-[var(--radius-control)] px-4 py-2.5 text-[var(--text-primary)] outline-none"
          >
            <option value="PERSONAL">Just me</option>
            <option value="CLASS">A class</option>
            <option value="GLOBAL">Everyone</option>
          </select>
        </div>
      )}
      {!canScopeToClass && <input type="hidden" name="scope" value="PERSONAL" />}

      {scope === "CLASS" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="classId" className="text-sm font-medium text-[var(--text-secondary)]">
            Class
          </label>
          <select
            id="classId"
            name="classId"
            defaultValue={initial?.classId ?? ""}
            className="neu-pressed rounded-[var(--radius-control)] px-4 py-2.5 text-[var(--text-primary)] outline-none"
          >
            <option value="" disabled>
              Choose a class
            </option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <NeumorphicInput
          label="Start"
          name="startAt"
          type="datetime-local"
          defaultValue={toLocalDateTimeInput(initial?.startAt)}
          required
        />
        <NeumorphicInput
          label="End"
          name="endAt"
          type="datetime-local"
          defaultValue={toLocalDateTimeInput(initial?.endAt)}
          required
        />
      </div>

      <NeumorphicToggle checked={allDay} onCheckedChange={setAllDay} label="All day" />
      <input type="hidden" name="allDay" value={allDay ? "on" : ""} />

      <div className="grid grid-cols-2 gap-4 items-end">
        <NeumorphicInput label="Location (optional)" name="location" defaultValue={initial?.location ?? ""} />
        <NeumorphicToggle checked={isVirtual} onCheckedChange={setIsVirtual} label="Virtual meeting" />
      </div>
      <input type="hidden" name="isVirtual" value={isVirtual ? "on" : ""} />

      <NeumorphicTextarea label="Description (optional)" name="description" defaultValue={initial?.description ?? ""} />

      {!eventId && (
        <div className="flex flex-col gap-2">
          <label htmlFor="freq" className="text-sm font-medium text-[var(--text-secondary)]">
            Repeats
          </label>
          <select
            id="freq"
            name="freq"
            value={freq}
            onChange={(e) => setFreq(e.target.value as typeof freq)}
            className="neu-pressed rounded-[var(--radius-control)] px-4 py-2.5 text-[var(--text-primary)] outline-none w-40"
          >
            <option value="NONE">Doesn&apos;t repeat</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
          {freq === "WEEKLY" && (
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((label, i) => (
                <label key={label} className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" name="weekdays" value={i} />
                  {label}
                </label>
              ))}
            </div>
          )}
          {freq !== "NONE" && (
            <NeumorphicInput label="Repeat until (optional)" name="until" type="date" className="max-w-xs" />
          )}
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {state.error}
        </p>
      )}

      <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="self-end">
        {isPending ? "Saving…" : eventId ? "Save changes" : "Create event"}
      </NeumorphicButton>
    </form>
  );
}
