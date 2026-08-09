"use client";

import { useState } from "react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput, NeumorphicTextarea } from "@/components/ui/input";
import { NeumorphicToggle } from "@/components/ui/toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mic, MicOff, Pencil } from "lucide-react";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
        {description && <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [micOn, setMicOn] = useState(true);
  const [notifOn, setNotifOn] = useState(true);
  const [selectedTab, setSelectedTab] = useState<"stream" | "classwork" | "people">("stream");

  return (
    <div className="min-h-screen p-8 md:p-12 flex flex-col gap-14 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Design System</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Neumorphic primitives for Nexus Classroom — checked in isolation before real screens.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section title="Typography" description="One sans-serif family, strong hierarchy.">
        <NeumorphicCard className="flex flex-col gap-3">
          <span className="text-3xl font-bold text-[var(--text-primary)]">Course Title — AP Biology</span>
          <span className="text-lg font-semibold text-[var(--text-primary)]">Assignment Title — Cell Membrane Lab Report</span>
          <p className="text-base text-[var(--text-primary)]">
            Body text sits at a comfortable reading size with high contrast against the surface, even though the
            surface-to-surface contrast is intentionally soft.
          </p>
          <span className="text-sm text-[var(--text-secondary)]">Secondary text — due Friday, 11:59 PM</span>
          <span className="text-xs text-[var(--text-muted)]">Muted text — last edited 2 hours ago</span>
        </NeumorphicCard>
      </Section>

      <Section title="Surfaces" description="Raised, pressed, and flat — the three depth states everything is built from.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Surface variant="raised" className="p-6 flex items-center justify-center text-sm text-[var(--text-secondary)]">
            raised
          </Surface>
          <Surface variant="pressed" className="p-6 flex items-center justify-center text-sm text-[var(--text-secondary)]">
            pressed / inset
          </Surface>
          <Surface variant="flat" className="p-6 flex items-center justify-center text-sm text-[var(--text-secondary)]">
            flat
          </Surface>
        </div>
      </Section>

      <Section title="Buttons" description="Raised is default; primary carries the accent; pressed shows the selected/active state.">
        <NeumorphicCard className="flex flex-wrap items-center gap-4">
          <NeumorphicButton variant="raised">Raised</NeumorphicButton>
          <NeumorphicButton variant="primary">Primary</NeumorphicButton>
          <NeumorphicButton variant="flat">Flat</NeumorphicButton>
          <NeumorphicButton variant="danger">Danger</NeumorphicButton>
          <NeumorphicButton pressed>Pressed (active)</NeumorphicButton>
          <NeumorphicButton disabled>Disabled</NeumorphicButton>
        </NeumorphicCard>

        <NeumorphicCard className="flex flex-wrap items-center gap-4">
          <NeumorphicButton size="sm">Small</NeumorphicButton>
          <NeumorphicButton size="md">Medium</NeumorphicButton>
          <NeumorphicButton size="lg">Large</NeumorphicButton>
          <NeumorphicButton
            size="icon"
            variant={micOn ? "raised" : "danger"}
            pressed={!micOn}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            onClick={() => setMicOn((v) => !v)}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </NeumorphicButton>
          <span className="text-xs text-[var(--text-muted)]">
            ← meeting mic control: click to toggle, uses the same pressed/raised pair
          </span>
        </NeumorphicCard>

        <NeumorphicCard>
          <div className="flex gap-2" role="tablist" aria-label="Class navigation example">
            {(["stream", "classwork", "people"] as const).map((tab) => (
              <NeumorphicButton
                key={tab}
                role="tab"
                aria-selected={selectedTab === tab}
                pressed={selectedTab === tab}
                onClick={() => setSelectedTab(tab)}
                className="capitalize"
              >
                {tab}
              </NeumorphicButton>
            ))}
          </div>
        </NeumorphicCard>
      </Section>

      <Section title="Inputs" description="Text fields read as recessed into the surface.">
        <NeumorphicCard className="flex flex-col gap-5 max-w-md">
          <NeumorphicInput label="Class name" placeholder="AP Biology" />
          <NeumorphicInput label="Invite code" placeholder="7F3-KQ2" hint="Students use this to join." />
          <NeumorphicInput label="Email" type="email" placeholder="you@school.edu" error="Enter a valid email address." />
          <NeumorphicTextarea label="Assignment instructions" placeholder="Describe the assignment..." />
        </NeumorphicCard>
      </Section>

      <Section title="Toggles" description="Track is inset, thumb is raised — the switch equivalent of pressed/raised.">
        <NeumorphicCard className="flex flex-col gap-4 max-w-sm">
          <NeumorphicToggle checked={notifOn} onCheckedChange={setNotifOn} label="Email notifications" />
          <NeumorphicToggle checked={false} onCheckedChange={() => {}} label="Disabled option" disabled />
        </NeumorphicCard>
      </Section>

      <Section title="Composed example" description="A course card as it will appear on a real dashboard.">
        <NeumorphicCard className="max-w-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">AP Biology</h3>
              <p className="text-sm text-[var(--text-secondary)]">Period 3 · Ms. Alvarez</p>
            </div>
            <Surface variant="flat" rounded="full" className="p-2 text-[var(--accent)]">
              <Pencil size={16} />
            </Surface>
          </div>
          <Surface variant="pressed" className="p-3 text-sm text-[var(--text-secondary)]">
            3 assignments due this week
          </Surface>
          <NeumorphicButton variant="primary" size="sm" className="self-start">
            Open class
          </NeumorphicButton>
        </NeumorphicCard>
      </Section>
    </div>
  );
}
