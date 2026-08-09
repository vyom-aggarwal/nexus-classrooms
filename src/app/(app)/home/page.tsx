import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, ClipboardCheck, Inbox, Video } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getTeacherHomeData, getStudentHomeData } from "@/lib/queries/home";
import { getJoinableMeeting } from "@/lib/queries/meetings";
import { NeumorphicCard, Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { DayAgenda } from "@/components/calendar/day-agenda";
import type { CalendarItem } from "@/lib/queries/calendar";

export default async function HomePage() {
  const user = await requireUser();
  const liveEvent = await getJoinableMeeting(user.id);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      {liveEvent && (
        <Surface variant="raised" className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Video size={18} className="text-[var(--accent)]" />
            <span className="font-medium">
              {liveEvent.class ? liveEvent.class.name : liveEvent.title} is starting soon
            </span>
          </div>
          <Link href={`/meet/${liveEvent.id}`}>
            <NeumorphicButton variant="primary" size="sm">Join</NeumorphicButton>
          </Link>
        </Surface>
      )}

      {user.role === "TEACHER" ? <TeacherHome userId={user.id} /> : <StudentHome userId={user.id} />}
    </div>
  );
}

async function TeacherHome({ userId }: { userId: string }) {
  const { classes, todaysEvents, pendingGrading } = await getTeacherHomeData(userId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 flex flex-col gap-4">
        <SectionHeader title="Your classes" href="/classes" hrefLabel="View all" />
        {classes.length === 0 ? (
          <EmptyState
            icon={<BookOpen size={28} />}
            title="No classes yet"
            description="Create your first class to start posting assignments and inviting students."
            action={
              <Link href="/classes">
                <NeumorphicButton variant="primary" size="sm">Create a class</NeumorphicButton>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((c) => (
              <Link key={c.id} href={`/classes/${c.id}`}>
                <NeumorphicCard className="flex flex-col gap-2 h-full">
                  <div className="h-2 w-10 rounded-full" style={{ background: c.accentColor }} />
                  <h3 className="font-semibold text-[var(--text-primary)]">{c.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {c._count.enrollments} student{c._count.enrollments === 1 ? "" : "s"}
                  </p>
                </NeumorphicCard>
              </Link>
            ))}
          </div>
        )}

        <SectionHeader title="Pending grading" href="/grades" hrefLabel="Open gradebook" />
        {pendingGrading.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={28} />} title="You're all caught up" description="No submissions are waiting to be graded." />
        ) : (
          <Surface variant="raised" className="p-2 flex flex-col divide-y divide-[var(--surface-shadow)]/20">
            {pendingGrading.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{s.post.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {s.student.name} · {s.post.class.name}
                  </p>
                </div>
                <Link href={`/classes/${s.post.classId}/classwork/${s.postId}/submissions/${s.id}`}>
                  <NeumorphicButton size="sm">Grade</NeumorphicButton>
                </Link>
              </div>
            ))}
          </Surface>
        )}
      </section>

      <TodaySchedule events={todaysEvents} />
    </div>
  );
}

async function StudentHome({ userId }: { userId: string }) {
  const { classes, todaysEvents, upcomingWork } = await getStudentHomeData(userId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <section className="lg:col-span-2 flex flex-col gap-4">
        <SectionHeader title="To-do" href="/classes" hrefLabel="View classes" />
        {classes.length === 0 ? (
          <EmptyState
            icon={<Inbox size={28} />}
            title="You haven't joined a class yet"
            description="Ask your teacher for an invite code, then join from the Classes page."
            action={
              <Link href="/classes">
                <NeumorphicButton variant="primary" size="sm">Join a class</NeumorphicButton>
              </Link>
            }
          />
        ) : upcomingWork.length === 0 ? (
          <EmptyState icon={<ClipboardCheck size={28} />} title="Nothing due" description="You're caught up on assigned work." />
        ) : (
          <Surface variant="raised" className="p-2 flex flex-col divide-y divide-[var(--surface-shadow)]/20">
            {upcomingWork.map((post) => (
              <Link
                key={post.id}
                href={`/classes/${post.classId}/classwork/${post.id}`}
                className="flex items-center justify-between p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{post.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{post.class.name}</p>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {post.dueAt ? format(post.dueAt, "MMM d") : "No due date"}
                </span>
              </Link>
            ))}
          </Surface>
        )}
      </section>

      <TodaySchedule events={todaysEvents} />
    </div>
  );
}

function SectionHeader({ title, href, hrefLabel }: { title: string; href: string; hrefLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <Link href={href} className="text-sm text-[var(--accent)] font-medium">
        {hrefLabel}
      </Link>
    </div>
  );
}

function TodaySchedule({ events }: { events: CalendarItem[] }) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title="Today" href="/calendar" hrefLabel="Open calendar" />
      <DayAgenda items={events} />
    </section>
  );
}
