import Link from "next/link";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <NeumorphicCard className="max-w-md flex flex-col gap-4 text-center items-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Nexus Classroom</h1>
        <p className="text-[var(--text-secondary)]">
          Coursework, calendar, and live class in one place.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <NeumorphicButton variant="primary">Log in</NeumorphicButton>
          </Link>
          <Link href="/signup">
            <NeumorphicButton variant="raised">Sign up</NeumorphicButton>
          </Link>
        </div>
        <Link href="/design-system" className="text-sm text-[var(--accent)]">
          View design system
        </Link>
      </NeumorphicCard>
    </div>
  );
}
