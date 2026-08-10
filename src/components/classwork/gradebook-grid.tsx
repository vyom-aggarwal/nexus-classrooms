"use client";

import { useState, useTransition } from "react";
import { Surface } from "@/components/ui/surface";
import { updateGridScoreAction } from "@/lib/actions/grades";
import { cn } from "@/lib/utils";

interface GradebookGridProps {
  classId: string;
  assignments: { id: string; title: string; points: number | null }[];
  students: { id: string; name: string }[];
  scores: Record<string, Record<string, number | undefined>>;
  studentAverages: Record<string, number | null>;
  assignmentAverages: Record<string, number | null>;
}

function formatPercent(value: number | null | undefined) {
  return value != null ? `${Math.round(value)}%` : "—";
}

/** Colour the running average so outliers are visible at a glance. */
function averageTone(value: number | null | undefined) {
  if (value == null) return "text-[var(--text-muted)]";
  if (value >= 80) return "text-[var(--success-text)]";
  if (value >= 60) return "text-[var(--warning-text)]";
  return "text-[var(--danger-text)]";
}

export function GradebookGrid({
  classId,
  assignments,
  students,
  scores,
  studentAverages,
  assignmentAverages,
}: GradebookGridProps) {
  return (
    <Surface variant="raised" className="p-4 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-x-2 border-spacing-y-1.5">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[var(--surface)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] p-3 min-w-[11rem] rounded-l-[var(--radius-control)]">
              Student
            </th>
            {assignments.map((a) => (
              <th key={a.id} className="p-2 min-w-[7.5rem] align-bottom">
                <div className="text-xs font-semibold text-[var(--text-secondary)] leading-tight line-clamp-2">
                  {a.title}
                </div>
                {a.points != null && (
                  <div className="text-[11px] text-[var(--text-muted)] mt-1 font-normal">/ {a.points}</div>
                )}
              </th>
            ))}
            <th className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] p-3 min-w-[6rem]">
              Average
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="sticky left-0 z-10 bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] p-3 whitespace-nowrap">
                {student.name}
              </td>
              {assignments.map((a) => (
                <td key={a.id} className="p-1">
                  <ScoreCell
                    classId={classId}
                    postId={a.id}
                    studentId={student.id}
                    studentName={student.name}
                    assignmentTitle={a.title}
                    initialScore={scores[a.id]?.[student.id]}
                  />
                </td>
              ))}
              <td className="p-2">
                <Surface
                  variant="pressed"
                  depth="sm"
                  rounded="control"
                  className={cn(
                    "py-2 text-center text-sm font-bold tabular-nums",
                    averageTone(studentAverages[student.id]),
                  )}
                >
                  {formatPercent(studentAverages[student.id])}
                </Surface>
              </td>
            </tr>
          ))}
          <tr>
            <td className="sticky left-0 z-10 bg-[var(--surface)] text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] p-3 whitespace-nowrap">
              Class average
            </td>
            {assignments.map((a) => (
              <td
                key={a.id}
                className="text-center text-sm font-semibold text-[var(--text-secondary)] p-2 tabular-nums"
              >
                {assignmentAverages[a.id] != null ? assignmentAverages[a.id]!.toFixed(1) : "—"}
              </td>
            ))}
            <td />
          </tr>
        </tbody>
      </table>
    </Surface>
  );
}

function ScoreCell({
  classId,
  postId,
  studentId,
  studentName,
  assignmentTitle,
  initialScore,
}: {
  classId: string;
  postId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  initialScore: number | undefined;
}) {
  const [value, setValue] = useState(initialScore != null ? String(initialScore) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function commit() {
    if (value.trim() === (initialScore != null ? String(initialScore) : "")) return;
    startTransition(async () => {
      try {
        await updateGridScoreAction(classId, postId, studentId, value);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't save");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        disabled={isPending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        aria-label={`Score for ${studentName} on ${assignmentTitle}`}
        aria-invalid={!!error}
        className={cn(
          "neu-pressed w-full max-w-[6rem] text-center rounded-[var(--radius-control)] py-2.5 text-sm font-medium",
          "text-[var(--text-primary)] outline-none transition-opacity tabular-nums",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          isPending && "opacity-50",
          error && "text-[var(--danger-text)]",
        )}
      />
      {error && <span className="text-[10px] text-[var(--danger-text)] font-medium">{error}</span>}
    </div>
  );
}
