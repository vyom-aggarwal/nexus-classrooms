"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SegmentedTrack, segmentedItemClasses } from "@/components/ui/segmented";

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
    <div className="overflow-x-auto -mx-1 px-1">
      <SegmentedTrack role="tablist" aria-label="Class sections">
        {TABS.map(({ segment, label }) => {
          const href = segment ? `${base}/${segment}` : base;
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              role="tab"
              aria-selected={active}
              className={segmentedItemClasses({ active })}
            >
              {label}
            </Link>
          );
        })}
      </SegmentedTrack>
    </div>
  );
}
