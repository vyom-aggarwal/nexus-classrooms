import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Surface } from "@/components/ui/surface";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-6">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center p-6 pb-16">{children}</div>
    </div>
  );
}
