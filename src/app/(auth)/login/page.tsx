"use client";

import { useActionState } from "react";
import Link from "next/link";
import { NeumorphicCard } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput } from "@/components/ui/input";
import { loginAction, type FormState } from "@/lib/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(loginAction, null);

  return (
    <NeumorphicCard className="w-full max-w-sm flex flex-col gap-7 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1.5">Log in to Nexus Classroom</p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <NeumorphicInput label="Email" name="email" type="email" autoComplete="email" required />
        <NeumorphicInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.error && (
          <p className="text-sm text-[var(--danger-text)] font-medium text-center" role="alert">
            {state.error}
          </p>
        )}
        <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="justify-center mt-1">
          {isPending ? "Logging in…" : "Log in"}
        </NeumorphicButton>
      </form>

      <p className="text-sm text-center text-[var(--text-secondary)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--accent-text)] font-semibold hover:underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </NeumorphicCard>
  );
}
