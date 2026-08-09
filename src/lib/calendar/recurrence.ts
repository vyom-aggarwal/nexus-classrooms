import { RRule, Frequency } from "rrule";

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
    freq: input.freq === "DAILY" ? Frequency.DAILY : Frequency.WEEKLY,
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
