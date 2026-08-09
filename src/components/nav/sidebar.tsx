"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calendar, GraduationCap, Video, LogOut } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { NeumorphicButton, neumorphicButtonClasses } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

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

  return (
    <Surface
      as="aside"
      variant="raised"
      rounded="card"
      className="hidden md:flex w-64 shrink-0 m-4 mr-0 p-5 flex-col gap-6"
    >
      <div className="flex items-center gap-2 px-1">
        <Surface variant="pressed" rounded="full" className="h-9 w-9 flex items-center justify-center font-bold text-[var(--accent)]">
          N
        </Surface>
        <span className="font-semibold text-[var(--text-primary)]">Nexus Classroom</span>
      </div>

      <nav className="flex flex-col gap-2" aria-label="Primary">
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
                className: "w-full justify-start",
              })}
            >
              <Icon size={18} />
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
            className: "w-full justify-center animate-pulse mt-auto",
          })}
        >
          <Video size={18} />
          {liveMeeting.label}
        </Link>
      )}

      <div className={liveMeeting ? "" : "mt-auto"}>
        <Surface variant="pressed" className="p-3 flex flex-col gap-2">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{userName}</p>
            <p className="text-xs text-[var(--text-muted)] capitalize">{userRole.toLowerCase()}</p>
          </div>
          <form action={signOutAction}>
            <NeumorphicButton type="submit" variant="flat" size="sm" className="w-full justify-center">
              <LogOut size={16} />
              Sign out
            </NeumorphicButton>
          </form>
        </Surface>
      </div>
    </Surface>
  );
}
