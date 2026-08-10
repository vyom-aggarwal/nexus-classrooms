"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { CreateClassForm } from "@/components/classes/create-class-form";
import { JoinClassForm } from "@/components/classes/join-class-form";

export function ClassActionPanel({ role }: { role: "TEACHER" | "STUDENT" }) {
  const [open, setOpen] = useState(false);
  const isTeacher = role === "TEACHER";

  if (!open) {
    return (
      <NeumorphicButton variant="primary" onClick={() => setOpen(true)} className="self-start">
        <Plus size={18} />
        {isTeacher ? "Create class" : "Join class"}
      </NeumorphicButton>
    );
  }

  return (
    <NeumorphicCard className="max-w-md flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-[var(--text-primary)] text-lg">
          {isTeacher ? "Create a class" : "Join a class"}
        </h2>
        <NeumorphicButton
          size="icon-sm"
          shape="circle"
          variant="flat"
          onClick={() => setOpen(false)}
          aria-label="Cancel"
        >
          <X size={16} />
        </NeumorphicButton>
      </div>
      {isTeacher ? <CreateClassForm /> : <JoinClassForm />}
    </NeumorphicCard>
  );
}
