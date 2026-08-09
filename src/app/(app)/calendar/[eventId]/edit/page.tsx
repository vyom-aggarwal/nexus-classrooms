import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getMyClasses } from "@/lib/queries/classes";
import { NeumorphicCard } from "@/components/ui/surface";
import { EventForm } from "@/components/calendar/event-form";
import { DeleteEventButton } from "@/components/calendar/delete-event-button";

export default async function EditEventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const user = await requireUser();

  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event || event.creatorId !== user.id) notFound();

  const classes = user.role === "TEACHER" ? await getMyClasses(user.id, "TEACHER") : [];

  return (
    <NeumorphicCard className="max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Edit event</h1>
        <DeleteEventButton eventId={event.id} />
      </div>
      <EventForm
        eventId={event.id}
        canScopeToClass={user.role === "TEACHER"}
        classes={classes.map((c) => ({ id: c.id, name: c.name }))}
        initial={{
          title: event.title,
          description: event.description,
          scope: event.scope,
          classId: event.classId,
          startAt: event.startAt,
          endAt: event.endAt,
          allDay: event.allDay,
          location: event.location,
          isVirtual: event.isVirtual,
        }}
      />
    </NeumorphicCard>
  );
}
