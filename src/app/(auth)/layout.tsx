import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-6">
        <Link href="/" aria-label="Nexus Classroom home">
          <Logo size={40} />
        </Link>
        <ThemeToggle />
      </header>
      <div className="flex-1 flex items-center justify-center p-6 pb-16">{children}</div>
    </div>
  );
}
