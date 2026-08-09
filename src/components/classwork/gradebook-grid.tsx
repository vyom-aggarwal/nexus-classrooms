"use client";

import { useState, useTransition } from "react";
import { Surface } from "@/components/ui/surface";
import { updateGridScoreAction } from "@/lib/actions/grades";

interface GradebookGridProps {
  classId: string;
  assignments: { id: string; title: string; points: number | null }[];
  students: { id: string; name: string }[];
  scores: Record<string, Record<string, number | undefined>>;
  studentAverages: Record<string, number | null>;
  assignmentAverages: Record<string, number | null>;
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
    <Surface variant="raised" className="p-2 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="sticky left-0 bg-[var(--surface)] text-left text-sm font-semibold text-[var(--text-primary)] p-2 min-w-[10rem]">
              Student
            </th>
            {assignments.map((a) => (
              <th key={a.id} className="text-center text-xs font-medium text-[var(--text-secondary)] p-2 min-w-[7rem]">
                {a.title}
                {a.points != null && <div className="text-[var(--text-muted)]">/ {a.points}</div>}
              </th>
            ))}
            <th className="text-center text-xs font-semibold text-[var(--text-primary)] p-2 min-w-[6rem]">Average</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="sticky left-0 bg-[var(--surface)] text-sm font-medium text-[var(--text-primary)] p-2 whitespace-nowrap">
                {student.name}
              </td>
              {assignments.map((a) => (
                <td key={a.id} className="p-1">
                  <ScoreCell
                    classId={classId}
                    postId={a.id}
                    studentId={student.id}
                    initialScore={scores[a.id]?.[student.id]}
                  />
                </td>
              ))}
              <td className="text-center text-sm font-semibold text-[var(--text-primary)] p-2">
                {formatPercent(studentAverages[student.id])}
              </td>
            </tr>
          ))}
          <tr>
            <td className="sticky left-0 bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] p-2">
              Class average
            </td>
            {assignments.map((a) => (
              <td key={a.id} className="text-center text-xs text-[var(--text-secondary)] p-2">
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

function formatPercent(value: number | null | undefined) {
  return value != null ? `${Math.round(value)}%` : "—";
}

function ScoreCell({
  classId,
  postId,
  studentId,
  initialScore,
}: {
  classId: string;
  postId: string;
  studentId: string;
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
    <div className="flex flex-col items-center">
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        disabled={isPending}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        aria-label={`Score for ${studentId} on ${postId}`}
        className="neu-pressed w-20 text-center rounded-[var(--radius-control)] py-1.5 text-sm text-[var(--text-primary)] outline-none disabled:opacity-60"
      />
      {error && <span className="text-[10px] text-[var(--danger)] mt-0.5">{error}</span>}
    </div>
  );
}
