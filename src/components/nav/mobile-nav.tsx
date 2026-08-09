"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Calendar, GraduationCap } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/classes", label: "Classes", icon: BookOpen },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/grades", label: "Grades", icon: GraduationCap },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Surface
      as="nav"
      aria-label="Primary"
      variant="raised"
      rounded="card"
      className="md:hidden fixed bottom-4 left-4 right-4 p-2 flex justify-around"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-1.5 rounded-[var(--radius-control)] text-xs",
              active ? "neu-pressed text-[var(--accent)]" : "text-[var(--text-secondary)]",
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </Surface>
  );
}
