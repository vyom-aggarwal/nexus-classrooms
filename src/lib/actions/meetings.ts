"use server";

import { revalidatePath } from "next/cache";
import { TrackType } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getRoomService } from "@/lib/livekit";

async function assertHost(meetingId: string, userId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: { calendarEvent: { include: { class: { select: { ownerId: true } } } } },
  });
  if (!meeting) throw new Error("Meeting not found.");
  const isHost = meeting.calendarEvent.creatorId === userId || meeting.calendarEvent.class?.ownerId === userId;
  if (!isHost) throw new Error("Only the host can do that.");
  return meeting;
}

export async function joinMeetingAction(meetingId: string) {
  const user = await requireUser();

  await prisma.meeting.updateMany({
    where: { id: meetingId, startedAt: null },
    data: { status: "LIVE", startedAt: new Date() },
  });

  const session = await prisma.meetingSession.create({ data: { meetingId, userId: user.id } });
  return session.id;
}

export async function leaveMeetingAction(sessionId: string) {
  await prisma.meetingSession.update({ where: { id: sessionId }, data: { leftAt: new Date() } });
}

export async function muteParticipantAction(meetingId: string, participantIdentity: string) {
  const user = await requireUser();
  const meeting = await assertHost(meetingId, user.id);

  const room = getRoomService();
  const participant = await room.getParticipant(meeting.roomName, participantIdentity);
  for (const track of participant.tracks) {
    if (track.type === TrackType.AUDIO) {
      await room.mutePublishedTrack(meeting.roomName, participantIdentity, track.sid, true);
    }
  }
}

export async function muteAllAction(meetingId: string) {
  const user = await requireUser();
  const meeting = await assertHost(meetingId, user.id);

  const room = getRoomService();
  const participants = await room.listParticipants(meeting.roomName);
  for (const p of participants) {
    for (const track of p.tracks) {
      if (track.type === TrackType.AUDIO) {
        await room.mutePublishedTrack(meeting.roomName, p.identity, track.sid, true);
      }
    }
  }
}

export async function removeParticipantAction(meetingId: string, participantIdentity: string) {
  const user = await requireUser();
  const meeting = await assertHost(meetingId, user.id);

  await getRoomService().removeParticipant(meeting.roomName, participantIdentity);
}

export async function setMeetingLockAction(meetingId: string, locked: boolean) {
  const user = await requireUser();
  await assertHost(meetingId, user.id);

  await prisma.meeting.update({ where: { id: meetingId }, data: { locked } });
  revalidatePath("/calendar");
}

export async function endMeetingAction(meetingId: string) {
  const user = await requireUser();
  const meeting = await assertHost(meetingId, user.id);

  await prisma.meeting.update({ where: { id: meetingId }, data: { status: "ENDED", endedAt: new Date() } });
  await getRoomService()
    .deleteRoom(meeting.roomName)
    .catch(() => {});
}
