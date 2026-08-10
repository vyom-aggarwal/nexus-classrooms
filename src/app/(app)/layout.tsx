import { requireUser } from "@/lib/session";
import { getJoinableMeeting } from "@/lib/queries/meetings";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Surface } from "@/components/ui/surface";

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
            ? {
                href: `/meet/${liveEvent.id}`,
                label: liveEvent.class ? `Join ${liveEvent.class.name}` : `Join ${liveEvent.title}`,
              }
            : null
        }
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex md:hidden items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              glow="accent"
              className="h-9 w-9 flex items-center justify-center text-sm font-bold text-[var(--accent-foreground)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))]"
            >
              N
            </Surface>
            <span className="font-semibold text-[var(--text-primary)]">Nexus Classroom</span>
          </div>
          <ThemeToggle />
        </header>

        <div className="hidden md:flex justify-end px-8 pt-6">
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 pb-28 pt-2 md:px-8 md:pb-10 md:pt-6">{children}</main>

        <MobileNav />
      </div>
    </div>
  );
}
