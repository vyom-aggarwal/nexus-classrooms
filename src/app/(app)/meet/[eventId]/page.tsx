import { format } from "date-fns";
import { Video, Lock, Clock } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMeetingAccess, ensureMeetingForEvent, isJoinable } from "@/lib/queries/meetings";
import { isLiveKitConfigured, createRoomToken } from "@/lib/livekit";
import { EmptyState } from "@/components/empty-state";
import { MeetingRoom } from "@/components/meet/meeting-room";

export default async function MeetPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const user = await requireUser();
  const { event, isHost } = await getMeetingAccess(eventId, user.id);

  if (!isLiveKitConfigured()) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <EmptyState
          icon={<Video size={28} />}
          title="Meetings aren't configured yet"
          description="Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET to .env to enable live video for this meeting."
        />
      </div>
    );
  }

  if (!isHost && !isJoinable(event)) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <EmptyState
          icon={<Clock size={28} />}
          title="This meeting hasn't started"
          description={`Join opens 15 minutes before ${format(event.startAt, "h:mm a")}.`}
        />
      </div>
    );
  }

  const meeting = await ensureMeetingForEvent(eventId);

  if (meeting.locked && !isHost) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <EmptyState icon={<Lock size={28} />} title="This meeting is locked" description="Ask the host to let you in." />
      </div>
    );
  }

  const token = await createRoomToken({
    roomName: meeting.roomName,
    identity: user.id,
    name: user.name ?? "Guest",
  });

  return (
    <MeetingRoom
      serverUrl={process.env.LIVEKIT_URL!}
      token={token}
      meetingId={meeting.id}
      isHost={isHost}
      initiallyLocked={meeting.locked}
      eventTitle={event.title}
    />
  );
}
