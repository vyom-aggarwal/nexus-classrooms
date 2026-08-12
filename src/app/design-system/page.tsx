"use client";

import { useState } from "react";
import {
  Home,
  Plus,
  Layers,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Fingerprint,
  ArrowLeft,
  GripVertical,
  ChevronRight,
  Search,
} from "lucide-react";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { NeumorphicInput, NeumorphicTextarea, NeumorphicSelect } from "@/components/ui/input";
import { NeumorphicToggle, NeumorphicSwitch } from "@/components/ui/toggle";
import { NeumorphicProgress, PaginationDots } from "@/components/ui/progress";
import { SegmentedTrack, SegmentedButton } from "@/components/ui/segmented";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo, LogoMark, LogoTile } from "@/components/logo";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{title}</h2>
        {description && <p className="text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      <div className="flex items-center gap-4 flex-wrap">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [notify, setNotify] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [tab, setTab] = useState<"stream" | "classwork" | "people">("stream");
  const [page, setPage] = useState(0);

  return (
    <div className="min-h-screen px-6 py-12 md:px-12 md:py-16">
      <div className="max-w-5xl mx-auto flex flex-col gap-20">
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <LogoTile size={56} />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                Design System
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">Nexus Classroom — neumorphic primitives</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <Section
          title="Elements"
          description="Familiar, analog-feeling controls in a minimal frame. Every surface shares the page background; depth is produced by a soft dual shadow and a subtle gradient across the surface, never by borders. Pressed states invert both."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <Spec label="Pagination">
              <div className="flex items-center gap-6">
                <PaginationDots count={3} active={page} onSelect={setPage} />
                <span className="text-xs text-[var(--text-muted)]">click to change</span>
              </div>
            </Spec>

            <Spec label="Icons — default / pressed">
              <div className="flex gap-3">
                {[Home, Plus, Layers, Settings].map((Icon, i) => (
                  <NeumorphicButton key={i} size="icon-sm" variant="flat" aria-label={`Icon ${i + 1}`}>
                    <Icon size={18} />
                  </NeumorphicButton>
                ))}
              </div>
              <div className="flex gap-3">
                {[Home, Plus, Layers, Settings].map((Icon, i) => (
                  <NeumorphicButton key={i} size="icon-sm" pressed aria-label={`Icon pressed ${i + 1}`}>
                    <Icon size={18} />
                  </NeumorphicButton>
                ))}
              </div>
            </Spec>

            <Spec label="Buttons — rounded">
              <NeumorphicButton size="icon" aria-label="Rounded default">
                <Home size={20} />
              </NeumorphicButton>
              <NeumorphicButton size="icon" pressed aria-label="Rounded pressed">
                <Home size={20} />
              </NeumorphicButton>
            </Spec>

            <Spec label="Buttons — circle">
              <NeumorphicButton size="icon" shape="circle" aria-label="Circle default">
                <Home size={20} />
              </NeumorphicButton>
              <NeumorphicButton size="icon" shape="circle" pressed aria-label="Circle pressed">
                <Home size={20} />
              </NeumorphicButton>
            </Spec>

            <Spec label="Rocker switch">
              <NeumorphicSwitch
                checked={notify}
                onCheckedChange={setNotify}
                label="Notify about new services"
                labelClassName="max-w-[9rem]"
              />
            </Spec>

            <Spec label="Pill toggle">
              <NeumorphicToggle checked={emailAlerts} onCheckedChange={setEmailAlerts} label="Email notifications" />
            </Spec>

            <div className="md:col-span-2">
              <Spec label="Progress">
                <div className="flex flex-col gap-4 w-full max-w-md">
                  <NeumorphicProgress value={22} label="Credit used" />
                  <NeumorphicProgress value={64} tone="success" label="Course completion" />
                  <NeumorphicProgress value={88} tone="warning" label="Storage used" />
                </div>
              </Spec>
            </div>

            <Spec label="Segmented control">
              <SegmentedTrack role="tablist" aria-label="Example tabs">
                {(["stream", "classwork", "people"] as const).map((t) => (
                  <SegmentedButton key={t} active={tab === t} onClick={() => setTab(t)} className="capitalize">
                    {t}
                  </SegmentedButton>
                ))}
              </SegmentedTrack>
            </Spec>

            <Spec label="Nav cluster">
              <Surface variant="raised" rounded="control" className="flex items-center gap-1 p-1.5">
                <NeumorphicButton size="icon-sm" variant="flat" aria-label="Back">
                  <ArrowLeft size={16} />
                </NeumorphicButton>
                <NeumorphicButton size="icon-sm" pressed aria-label="Grid">
                  <GripVertical size={16} />
                </NeumorphicButton>
              </Surface>
            </Spec>

            <div className="md:col-span-2">
              <Spec label="Inputs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                  <NeumorphicInput label="Class name" placeholder="AP Biology" />
                  <NeumorphicInput
                    label="Search"
                    placeholder="Find an assignment…"
                    trailing={<Search size={18} />}
                  />
                  <NeumorphicInput label="Invite code" placeholder="7F3-KQ2" hint="Students use this to join." />
                  <NeumorphicInput label="Email" type="email" defaultValue="not-an-email" error="Enter a valid email address." />
                  <NeumorphicSelect label="Period" defaultValue="30">
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </NeumorphicSelect>
                  <NeumorphicTextarea label="Instructions" placeholder="Describe the assignment…" />
                </div>
              </Spec>
            </div>
          </div>
        </Section>

        <Section title="Buttons" description="Raised is the default. Primary and destructive actions carry a lit gradient fill so they read first.">
          <NeumorphicCard className="flex flex-wrap items-center gap-4">
            <NeumorphicButton variant="primary">Publish</NeumorphicButton>
            <NeumorphicButton variant="raised">Save draft</NeumorphicButton>
            <NeumorphicButton variant="flat">Cancel</NeumorphicButton>
            <NeumorphicButton variant="danger">Delete</NeumorphicButton>
            <NeumorphicButton variant="success">Return grade</NeumorphicButton>
            <NeumorphicButton disabled>Disabled</NeumorphicButton>
          </NeumorphicCard>

          <NeumorphicCard className="flex flex-wrap items-center gap-4">
            <NeumorphicButton size="sm">Small</NeumorphicButton>
            <NeumorphicButton size="md">Medium</NeumorphicButton>
            <NeumorphicButton size="lg">Large</NeumorphicButton>
          </NeumorphicCard>
        </Section>

        <Section
          title="Brand"
          description="The mark is an N drawn as one connected path, its terminal rendered as a node — the letterform and the “point where things connect” idea in a single shape. It holds together down to favicon size."
        >
          <NeumorphicCard className="flex flex-wrap items-end gap-10">
            <div className="flex items-end gap-6">
              {[64, 40, 28, 16].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <LogoMark
                    size={s}
                    className="text-[var(--text-primary)]"
                    nodeClassName="text-[var(--accent)]"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">{s}px</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <Logo size={40} />
              <Logo size={40} stacked />
            </div>
          </NeumorphicCard>
        </Section>

        <Section
          title="Typography"
          description="One rounded geometric family. Hierarchy comes from weight and size; body copy always clears WCAG AA against the surface."
        >
          <NeumorphicCard className="flex flex-col gap-4">
            <span className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">AP Biology</span>
            <span className="text-xl font-semibold text-[var(--text-primary)]">Cell Membrane Lab Report</span>
            <p className="text-base text-[var(--text-primary)] leading-relaxed max-w-2xl">
              Body text sits at a comfortable reading size with strong contrast against the surface, even though
              surface-to-surface contrast is intentionally soft.
            </p>
            <span className="text-sm text-[var(--text-secondary)]">Secondary — due Friday, 11:59 PM</span>
            <span className="text-xs text-[var(--text-muted)]">Muted — last edited 2 hours ago</span>
            <span className="font-mono text-sm text-[var(--text-primary)] tracking-widest">7F3-KQ2</span>
          </NeumorphicCard>
        </Section>

        <Section title="UI parts" description="The primitives composed into the shapes they actually take in the product.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <NeumorphicCard className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-lg">AP Biology</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Period 3 · Ms. Alvarez</p>
                </div>
                <Surface
                  variant="raised"
                  depth="sm"
                  rounded="full"
                  className="h-3 w-3 mt-1.5"
                  style={{ background: "var(--success)", boxShadow: "var(--glow-success)" }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Term progress</span>
                  <span className="text-[var(--text-primary)] font-semibold">64%</span>
                </div>
                <NeumorphicProgress value={64} tone="success" label="Term progress" />
              </div>
              <NeumorphicButton variant="primary" size="sm" className="self-start">
                Open class
              </NeumorphicButton>
            </NeumorphicCard>

            <NeumorphicCard className="flex flex-col items-center justify-center gap-4 text-center">
              <Surface
                variant="pressed"
                rounded="full"
                className="h-24 w-24 flex items-center justify-center text-[var(--accent-text)]"
              >
                <Fingerprint size={40} />
              </Surface>
              <p className="text-sm text-[var(--text-secondary)]">Confirm submission</p>
            </NeumorphicCard>

            <NeumorphicCard className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Meeting controls</p>
              <div className="flex gap-3 flex-wrap">
                <NeumorphicButton
                  size="icon"
                  shape="circle"
                  pressed={!micOn}
                  variant={micOn ? "raised" : "danger"}
                  aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                  onClick={() => setMicOn((v) => !v)}
                >
                  {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                </NeumorphicButton>
                <NeumorphicButton
                  size="icon"
                  shape="circle"
                  pressed={!camOn}
                  variant={camOn ? "raised" : "danger"}
                  aria-label={camOn ? "Turn off camera" : "Turn on camera"}
                  onClick={() => setCamOn((v) => !v)}
                >
                  {camOn ? <Video size={20} /> : <VideoOff size={20} />}
                </NeumorphicButton>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Click to toggle — active controls push into the surface.
              </p>
            </NeumorphicCard>
          </div>

          <Surface variant="raised" className="p-2 neu-divide">
            {[
              { title: "Cell Membrane Lab Report", meta: "AP Biology", value: "92 / 100" },
              { title: "Problem Set 1", meta: "Algebra II", value: "18 / 20" },
              { title: "Mitosis Quiz", meta: "AP Biology", value: "—" },
            ].map((row) => (
              <div key={row.title} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{row.meta}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{row.value}</span>
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </div>
              </div>
            ))}
          </Surface>
        </Section>
      </div>
    </div>
  );
}
