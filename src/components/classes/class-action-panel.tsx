"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { CreateClassForm } from "@/components/classes/create-class-form";
import { JoinClassForm } from "@/components/classes/join-class-form";

export function ClassActionPanel({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <NeumorphicButton variant="primary" onClick={() => setOpen(true)} className="self-start">
        <Plus size={18} />
        {role === "TEACHER" ? "Create class" : "Join class"}
      </NeumorphicButton>
    );
  }

  return (
    <NeumorphicCard className="max-w-md flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[var(--text-primary)]">
          {role === "TEACHER" ? "Create a class" : "Join a class"}
        </h2>
        <NeumorphicButton variant="flat" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </NeumorphicButton>
      </div>
      {role === "TEACHER" ? <CreateClassForm /> : <JoinClassForm />}
    </NeumorphicCard>
  );
}
