"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calendar, GraduationCap, Video, LogOut } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { NeumorphicButton, neumorphicButtonClasses } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/classes", label: "Classes", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/grades", label: "Grades", icon: GraduationCap },
];

interface SidebarProps {
  userName: string;
  userRole: "TEACHER" | "STUDENT";
  liveMeeting?: { href: string; label: string } | null;
}

export function Sidebar({ userName, userRole, liveMeeting }: SidebarProps) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

  return (
    <aside className="hidden md:flex w-[17rem] shrink-0 p-6 pr-0">
      <Surface variant="raised" rounded="card" className="flex-1 p-5 flex flex-col gap-8 sticky top-6 h-fit max-h-[calc(100vh-3rem)]">
        <Logo size={40} stacked className="px-1" />

        <nav className="flex flex-col gap-2.5" aria-label="Primary">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={neumorphicButtonClasses({
                  variant: active ? "pressed" : "flat",
                  pressed: active,
                  className: "w-full justify-start gap-3.5",
                })}
              >
                <Icon size={19} className={active ? "text-[var(--accent-text)]" : ""} />
                {label}
              </Link>
            );
          })}
        </nav>

        {liveMeeting && (
          <Link
            href={liveMeeting.href}
            className={neumorphicButtonClasses({
              variant: "primary",
              className: "w-full justify-center gap-2",
            })}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <Video size={17} />
            <span className="truncate">{liveMeeting.label}</span>
          </Link>
        )}

        <Surface variant="pressed" rounded="control" className={cn("p-3 flex flex-col gap-3", !liveMeeting && "mt-auto")}>
          <div className="flex items-center gap-3">
            <Surface
              variant="raised"
              depth="sm"
              rounded="full"
              className="h-9 w-9 shrink-0 flex items-center justify-center text-xs font-bold text-[var(--accent-text)]"
            >
              {initials}
            </Surface>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{userName}</p>
              <p className="text-xs text-[var(--text-muted)] capitalize">{userRole.toLowerCase()}</p>
            </div>
          </div>
          <form action={signOutAction}>
            <NeumorphicButton type="submit" variant="raised" size="sm" className="w-full justify-center">
              <LogOut size={15} />
              Sign out
            </NeumorphicButton>
          </form>
        </Surface>
      </Surface>
    </aside>
  );
}
