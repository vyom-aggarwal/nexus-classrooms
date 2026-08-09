import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { neumorphicButtonClasses } from "@/components/ui/button";
import type { CalendarView } from "@/lib/calendar/range";
import { shiftDate } from "@/lib/calendar/range";

function dateParam(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function CalendarToolbar({ view, date }: { view: CalendarView; date: Date }) {
  const prev = shiftDate(view, date, -1);
  const next = shiftDate(view, date, 1);
  const today = new Date();

  const heading =
    view === "day" ? format(date, "EEEE, MMMM d, yyyy") : view === "week" ? `Week of ${format(date, "MMMM d, yyyy")}` : format(date, "MMMM yyyy");

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Link href={`/calendar?view=${view}&date=${dateParam(prev)}`} className={neumorphicButtonClasses({ variant: "flat", size: "icon" })} aria-label="Previous">
          <ChevronLeft size={18} />
        </Link>
        <Link href={`/calendar?view=${view}&date=${dateParam(today)}`} className={neumorphicButtonClasses({ variant: "flat", size: "sm" })}>
          Today
        </Link>
        <Link href={`/calendar?view=${view}&date=${dateParam(next)}`} className={neumorphicButtonClasses({ variant: "flat", size: "icon" })} aria-label="Next">
          <ChevronRight size={18} />
        </Link>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] ml-2">{heading}</h2>
      </div>

      <div className="flex gap-1" role="tablist" aria-label="Calendar view">
        {(["month", "week", "day"] as const).map((v) => (
          <Link
            key={v}
            href={`/calendar?view=${v}&date=${dateParam(date)}`}
            role="tab"
            aria-selected={view === v}
            className={neumorphicButtonClasses({ variant: view === v ? "pressed" : "flat", pressed: view === v, size: "sm", className: "capitalize" })}
          >
            {v}
          </Link>
        ))}
      </div>
    </div>
  );
}
