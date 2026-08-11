// Import RRule only. rrule resolves to its ESM build under Next's bundler but
// its CJS build under plain Node ESM (the seed script), and the two disagree
// on what's importable: there's no `default` in the ESM build, and Node's CJS
// lexer doesn't surface `Frequency`. `RRule` is the one binding both agree on,
// and it carries the frequency constants as statics, so nothing else is needed.
import { RRule } from "rrule";

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
