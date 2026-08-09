"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput } from "@/components/ui/input";
import { signupAction, type FormState } from "@/lib/actions/auth";

type RoleChoice = "TEACHER" | "STUDENT";

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(signupAction, null);
  const [role, setRole] = useState<RoleChoice>("STUDENT");

  return (
    <NeumorphicCard className="w-full max-w-sm flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your account</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Join Nexus Classroom</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--text-secondary)]">I am a…</span>
          <div className="flex gap-2" role="radiogroup" aria-label="Account type">
            <NeumorphicButton
              type="button"
              role="radio"
              aria-checked={role === "STUDENT"}
              pressed={role === "STUDENT"}
              onClick={() => setRole("STUDENT")}
              className="flex-1 justify-center"
            >
              Student
            </NeumorphicButton>
            <NeumorphicButton
              type="button"
              role="radio"
              aria-checked={role === "TEACHER"}
              pressed={role === "TEACHER"}
              onClick={() => setRole("TEACHER")}
              className="flex-1 justify-center"
            >
              Teacher
            </NeumorphicButton>
          </div>
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
          <p className="text-sm text-[var(--danger)]" role="alert">
            {state.error}
          </p>
        )}
        <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="mt-2">
          {isPending ? "Creating account…" : "Create account"}
        </NeumorphicButton>
      </form>

      <p className="text-sm text-center text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] font-medium">
          Log in
        </Link>
      </p>
    </NeumorphicCard>
  );
}
