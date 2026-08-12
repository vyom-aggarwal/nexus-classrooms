import * as rruleModule from "rrule";

/*
 * rrule ships no `exports` map, so consumers land on different builds:
 * bundlers follow `module` (dist/esm) and get real named exports, while Node
 * follows `main` (dist/es5, CommonJS) and hangs everything off `default`.
 * Importing the ESM build directly isn't an option either — it uses
 * extensionless relative imports that Node's resolver rejects.
 *
 * So no single static import works everywhere. A namespace import plus this
 * probe does, and stays synchronous.
 */
const rrule = ("RRule" in rruleModule
  ? rruleModule
  : (rruleModule as unknown as { default: typeof rruleModule }).default) as typeof rruleModule;

const { RRule } = rrule;

export type RecurrenceFreq = "NONE" | "DAILY" | "WEEKLY";

export interface RecurrenceInput {
  freq: RecurrenceFreq;
  weekdays?: number[]; // 0=Mon..6=Sun (RRule convention), only used for WEEKLY
  until?: Date | null;
}

const WEEKDAY_CONSTANTS = [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA, RRule.SU];

/** Builds an RFC5545 RRULE string anchored to `dtstart`, or null for a one-off event. */
export function buildRecurrenceRule(input: RecurrenceInput, dtstart: Date): string | null {
  if (input.freq === "NONE") return null;

  const rule = new RRule({
    // RRule exposes the frequency constants as statics, avoiding a second
    // import that would hit the same CJS interop problem.
    freq: input.freq === "DAILY" ? RRule.DAILY : RRule.WEEKLY,
    dtstart,
    until: input.until ?? undefined,
    byweekday:
      input.freq === "WEEKLY" && input.weekdays?.length
        ? input.weekdays.map((i) => WEEKDAY_CONSTANTS[i])
        : undefined,
  });

  return rule.toString();
}

/** Returns occurrence start Date[] within [rangeStart, rangeEnd] for a recurring event (DTSTART is embedded in the rule string). */
export function expandOccurrences(recurrenceRule: string, rangeStart: Date, rangeEnd: Date): Date[] {
  const rule = RRule.fromString(recurrenceRule);
  return rule.between(rangeStart, rangeEnd, true);
}
