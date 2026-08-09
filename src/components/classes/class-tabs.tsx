"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { neumorphicButtonClasses } from "@/components/ui/button";

const TABS = [
  { segment: "", label: "Stream" },
  { segment: "classwork", label: "Classwork" },
  { segment: "people", label: "People" },
  { segment: "grades", label: "Grades" },
];

export function ClassTabs({ classId }: { classId: string }) {
  const pathname = usePathname();
  const base = `/classes/${classId}`;

  return (
    <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Class navigation">
      {TABS.map(({ segment, label }) => {
        const href = segment ? `${base}/${segment}` : base;
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            role="tab"
            aria-selected={active}
            className={neumorphicButtonClasses({
              variant: active ? "pressed" : "flat",
              pressed: active,
              size: "sm",
              className: "shrink-0",
            })}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
