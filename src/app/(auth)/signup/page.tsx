"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { GraduationCap, Presentation } from "lucide-react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput } from "@/components/ui/input";
import { signupAction, type FormState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type RoleChoice = "TEACHER" | "STUDENT";

const ROLES: { value: RoleChoice; label: string; icon: typeof GraduationCap }[] = [
  { value: "STUDENT", label: "Student", icon: GraduationCap },
  { value: "TEACHER", label: "Teacher", icon: Presentation },
];

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(signupAction, null);
  const [role, setRole] = useState<RoleChoice>("STUDENT");

  return (
    <NeumorphicCard className="w-full max-w-sm flex flex-col gap-7 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Create your account</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">Join Nexus Classroom</p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)] pl-1">I am a…</span>
          <Surface variant="pressed" rounded="control" className="p-1.5 grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Account type">
            {ROLES.map(({ value, label, icon: Icon }) => {
              const selected = role === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-[calc(var(--radius-control)-4px)] text-sm font-medium transition-all duration-200",
                    selected
                      ? "neu-raised-sm text-[var(--accent-text)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <Icon size={20} />
                  {label}
                </button>
              );
            })}
          </Surface>
        </div>
        <input type="hidden" name="role" value={role} />

        <NeumorphicInput label="Full name" name="name" autoComplete="name" required />
        <NeumorphicInput label="Email" name="email" type="email" autoComplete="email" required />
        <NeumorphicInput
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          required
        />
        {state?.error && (
          <p className="text-sm text-[var(--danger-text)] font-medium text-center" role="alert">
            {state.error}
          </p>
        )}
        <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="justify-center mt-1">
          {isPending ? "Creating account…" : "Create account"}
        </NeumorphicButton>
      </form>

      <p className="text-sm text-center text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-text)] font-semibold hover:underline underline-offset-4">
          Log in
        </Link>
      </p>
    </NeumorphicCard>
  );
}
