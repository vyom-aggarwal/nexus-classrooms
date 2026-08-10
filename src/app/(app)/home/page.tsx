import Link from "next/link";
import { format } from "date-fns";
import { BookOpen, ClipboardCheck, Inbox, Video, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getTeacherHomeData, getStudentHomeData } from "@/lib/queries/home";
import { getJoinableMeeting } from "@/lib/queries/meetings";
import { Surface } from "@/components/ui/surface";
import { neumorphicButtonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { DayAgenda } from "@/components/calendar/day-agenda";
import { ClassCard } from "@/components/classes/class-card";
import type { CalendarItem } from "@/lib/queries/calendar";

export default async function HomePage() {
  const user = await requireUser();
  const liveEvent = await getJoinableMeeting(user.id);

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1.5">{format(new Date(), "EEEE, MMMM d")}</p>
      </div>

      {liveEvent && (
        <Surface
          variant="raised"
          glow="accent"
          className="p-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              className="h-11 w-11 shrink-0 flex items-center justify-center text-[var(--accent-foreground)] bg-[linear-gradient(145deg,var(--accent-hover),var(--accent))]"
            >
              <Video size={20} />
            </Surface>
            <div className="min-w-0">
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {liveEvent.class ? liveEvent.class.name : liveEvent.title}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Starting soon · {format(liveEvent.startAt, "h:mm a")}
              </p>
            </div>
          </div>
          <Link href={`/meet/${liveEvent.id}`} className={neumorphicButtonClasses({ variant: "primary" })}>
            Join now
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
      <div className="lg:col-span-2 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <SectionHeader title="Your classes" href="/classes" hrefLabel="View all" />
          {classes.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={26} />}
              title="No classes yet"
              description="Create your first class to start posting assignments and inviting students."
              action={
                <Link href="/classes" className={neumorphicButtonClasses({ variant: "primary", size: "sm" })}>
                  Create a class
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.map((c) => (
                <ClassCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  subject={c.subject}
                  section={c.section}
                  accentColor={c.accentColor}
                  studentCount={c._count.enrollments}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4">
          <SectionHeader title="Pending grading" href="/grades" hrefLabel="Open gradebook" />
          {pendingGrading.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={26} />}
              title="You're all caught up"
              description="No submissions are waiting to be graded."
            />
          ) : (
            <Surface variant="raised" className="p-3 flex flex-col neu-divide">
              {pendingGrading.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{s.post.title}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {s.student.name} · {s.post.class.name}
                    </p>
                  </div>
                  <Link
                    href={`/classes/${s.post.classId}/classwork/${s.postId}/submissions/${s.id}`}
                    className={neumorphicButtonClasses({ size: "sm", className: "shrink-0" })}
                  >
                    Grade
                  </Link>
                </div>
              ))}
            </Surface>
          )}
        </section>
      </div>

      <TodaySchedule events={todaysEvents} />
    </div>
  );
}

async function StudentHome({ userId }: { userId: string }) {
  const { classes, todaysEvents, upcomingWork } = await getStudentHomeData(userId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <SectionHeader title="To-do" href="/classes" hrefLabel="View classes" />
          {classes.length === 0 ? (
            <EmptyState
              icon={<Inbox size={26} />}
              title="You haven't joined a class yet"
              description="Ask your teacher for an invite code, then join from the Classes page."
              action={
                <Link href="/classes" className={neumorphicButtonClasses({ variant: "primary", size: "sm" })}>
                  Join a class
                </Link>
              }
            />
          ) : upcomingWork.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck size={26} />}
              title="Nothing due"
              description="You're caught up on assigned work."
            />
          ) : (
            <Surface variant="raised" className="p-3 flex flex-col neu-divide">
              {upcomingWork.map((post) => {
                const overdue = post.dueAt ? post.dueAt < new Date() : false;
                return (
                  <Link
                    key={post.id}
                    href={`/classes/${post.classId}/classwork/${post.id}`}
                    className="flex items-center justify-between gap-3 p-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{post.title}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{post.class.name}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold ${
                          overdue ? "text-[var(--danger-text)]" : "text-[var(--text-secondary)]"
                        }`}
                      >
                        {post.dueAt ? format(post.dueAt, "MMM d") : "No due date"}
                      </span>
                      <ChevronRight
                        size={15}
                        className="text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform"
                      />
                    </div>
                  </Link>
                );
              })}
            </Surface>
          )}
        </section>

        {classes.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionHeader title="Your classes" href="/classes" hrefLabel="View all" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {classes.slice(0, 4).map((c) => (
                <ClassCard
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  subject={c.subject}
                  section={c.section}
                  accentColor={c.accentColor}
                  studentCount={0}
                  ownerName={c.owner.name}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <TodaySchedule events={todaysEvents} />
    </div>
  );
}

function SectionHeader({ title, href, hrefLabel }: { title: string; href: string; hrefLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      <Link
        href={href}
        className="text-sm text-[var(--accent-text)] font-medium hover:underline underline-offset-4 shrink-0"
      >
        {hrefLabel}
      </Link>
    </div>
  );
}

function TodaySchedule({ events }: { events: CalendarItem[] }) {
  return (
    <section className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
      <SectionHeader title="Today" href="/calendar" hrefLabel="Open calendar" />
      <DayAgenda items={events} />
    </section>
  );
}
