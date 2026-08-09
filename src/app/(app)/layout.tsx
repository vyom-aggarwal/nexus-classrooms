import { requireUser } from "@/lib/session";
import { getJoinableMeeting } from "@/lib/queries/meetings";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const liveEvent = await getJoinableMeeting(user.id);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        userName={user.name ?? user.email ?? "You"}
        userRole={user.role}
        liveMeeting={
          liveEvent
            ? { href: `/meet/${liveEvent.id}`, label: liveEvent.class ? `Join ${liveEvent.class.name}` : `Join ${liveEvent.title}` }
            : null
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex md:hidden items-center justify-between p-4">
          <span className="font-semibold text-[var(--text-primary)]">Nexus Classroom</span>
          <ThemeToggle />
        </header>

        <div className="hidden md:flex justify-end p-4 pb-0">
          <ThemeToggle />
        </div>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">{children}</main>

        <MobileNav />
      </div>
    </div>
  );
}
