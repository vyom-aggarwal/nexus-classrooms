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
      className="md:hidden fixed bottom-4 left-4 right-4 p-2 flex justify-around z-40"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-[var(--radius-control)] text-[11px] font-medium transition-all duration-200",
              active ? "neu-pressed text-[var(--accent-text)]" : "text-[var(--text-secondary)]",
            )}
          >
            <Icon size={19} />
            {label}
          </Link>
        );
      })}
    </Surface>
  );
}
