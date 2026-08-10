"use client";

import { useActionState, useState } from "react";
import { NeumorphicInput, NeumorphicTextarea, NeumorphicSelect } from "@/components/ui/input";
import { NeumorphicButton, neumorphicButtonClasses } from "@/components/ui/button";
import { NeumorphicToggle } from "@/components/ui/toggle";
import { Surface } from "@/components/ui/surface";
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
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [allDay, setAllDay] = useState(initial?.allDay ?? false);
  const [isVirtual, setIsVirtual] = useState(initial?.isVirtual ?? false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <NeumorphicInput label="Title" name="title" defaultValue={initial?.title} required />

      {canScopeToClass && (
        <NeumorphicSelect
          label="Applies to"
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
        >
          <option value="PERSONAL">Just me</option>
          <option value="CLASS">A class</option>
          <option value="GLOBAL">Everyone</option>
        </NeumorphicSelect>
      )}
      {!canScopeToClass && <input type="hidden" name="scope" value="PERSONAL" />}

      {scope === "CLASS" && (
        <NeumorphicSelect label="Class" name="classId" defaultValue={initial?.classId ?? ""}>
          <option value="" disabled>
            Choose a class
          </option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </NeumorphicSelect>
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

      <NeumorphicInput label="Location (optional)" name="location" defaultValue={initial?.location ?? ""} />

      <Surface variant="pressed" rounded="control" className="p-4 flex flex-col gap-4">
        <NeumorphicToggle checked={allDay} onCheckedChange={setAllDay} label="All day" />
        <NeumorphicToggle
          checked={isVirtual}
          onCheckedChange={setIsVirtual}
          label="Virtual meeting — adds a Join button"
        />
      </Surface>
      <input type="hidden" name="allDay" value={allDay ? "on" : ""} />
      <input type="hidden" name="isVirtual" value={isVirtual ? "on" : ""} />

      <NeumorphicTextarea label="Description (optional)" name="description" defaultValue={initial?.description ?? ""} />

      {!eventId && (
        <div className="flex flex-col gap-4">
          <NeumorphicSelect
            label="Repeats"
            name="freq"
            value={freq}
            onChange={(e) => setFreq(e.target.value as typeof freq)}
            className="max-w-xs"
          >
            <option value="NONE">Doesn&apos;t repeat</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </NeumorphicSelect>

          {freq === "WEEKLY" && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-[var(--text-secondary)] pl-1 mb-2">
                On these days
              </legend>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((label, i) => {
                  const selected = weekdays.includes(i);
                  return (
                    <label
                      key={label}
                      className={neumorphicButtonClasses({
                        variant: selected ? "pressed" : "raised",
                        pressed: selected,
                        size: "sm",
                        className: "cursor-pointer",
                      })}
                    >
                      <input
                        type="checkbox"
                        name="weekdays"
                        value={i}
                        checked={selected}
                        onChange={(e) =>
                          setWeekdays((prev) =>
                            e.target.checked ? [...prev, i] : prev.filter((d) => d !== i),
                          )
                        }
                        className="sr-only"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          {freq !== "NONE" && (
            <NeumorphicInput label="Repeat until (optional)" name="until" type="date" className="max-w-xs" />
          )}
        </div>
      )}

      {state?.error && (
        <p className="text-sm text-[var(--danger-text)] font-medium" role="alert">
          {state.error}
        </p>
      )}

      <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="self-end">
        {isPending ? "Saving…" : eventId ? "Save changes" : "Create event"}
      </NeumorphicButton>
    </form>
  );
}
