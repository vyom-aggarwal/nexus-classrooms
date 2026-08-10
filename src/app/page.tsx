import Link from "next/link";
import { BookOpen, CalendarDays, Video } from "lucide-react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { neumorphicButtonClasses } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  { icon: BookOpen, label: "Coursework", copy: "Assignments, materials, and grading in one gradebook." },
  { icon: CalendarDays, label: "Calendar", copy: "Class schedules and due dates on a single timeline." },
  { icon: Video, label: "Live class", copy: "Join from the calendar. Draw right on the video." },
];

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-6 md:p-8">
        <div className="flex items-center gap-3">
          <Surface
            variant="raised"
            depth="sm"
            rounded="control"
            glow="accent"
            className="h-10 w-10 flex items-center justify-center font-bold text-[var(--accent-foreground)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))]"
          >
            N
          </Surface>
          <span className="font-semibold text-[var(--text-primary)]">Nexus Classroom</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-12 px-6 py-12">
        <div className="text-center flex flex-col items-center gap-5 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.05]">
            Coursework, calendar, and live class
            <span className="text-[var(--accent-text)]"> in one place.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-lg">
            One workspace for teachers and students — no switching between four tabs to run a single lesson.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link href="/signup" className={neumorphicButtonClasses({ variant: "primary", size: "lg" })}>
              Get started
            </Link>
            <Link href="/login" className={neumorphicButtonClasses({ variant: "raised", size: "lg" })}>
              Log in
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
          {FEATURES.map(({ icon: Icon, label, copy }) => (
            <NeumorphicCard key={label} className="flex flex-col gap-3">
              <Surface
                variant="pressed"
                rounded="control"
                className="h-12 w-12 flex items-center justify-center text-[var(--accent-text)]"
              >
                <Icon size={22} />
              </Surface>
              <h2 className="font-semibold text-[var(--text-primary)]">{label}</h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{copy}</p>
            </NeumorphicCard>
          ))}
        </div>
      </main>

      <footer className="p-6 text-center">
        <Link href="/design-system" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors">
          View the design system →
        </Link>
      </footer>
    </div>
  );
}
