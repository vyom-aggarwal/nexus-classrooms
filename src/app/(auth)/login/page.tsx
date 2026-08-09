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
    <NeumorphicCard className="w-full max-w-sm flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Log in to Nexus Classroom</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <NeumorphicInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <NeumorphicInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.error && (
          <p className="text-sm text-[var(--danger)]" role="alert">
            {state.error}
          </p>
        )}
        <NeumorphicButton type="submit" variant="primary" disabled={isPending} className="mt-2">
          {isPending ? "Logging in…" : "Log in"}
        </NeumorphicButton>
      </form>

      <p className="text-sm text-center text-[var(--text-secondary)]">
        New here?{" "}
        <Link href="/signup" className="text-[var(--accent)] font-medium">
          Create an account
        </Link>
      </p>
    </NeumorphicCard>
  );
}
