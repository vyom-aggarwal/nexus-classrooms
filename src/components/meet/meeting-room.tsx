"use client";

import "@livekit/components-styles";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GridLayout,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { AnnotatedParticipantTile } from "@/components/meet/annotated-tile";
import { Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  Users,
  PhoneOff,
  Lock,
  Unlock,
  UserX,
} from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { NeumorphicButton } from "@/components/ui/button";
import {
  joinMeetingAction,
  leaveMeetingAction,
  muteAllAction,
  muteParticipantAction,
  removeParticipantAction,
  setMeetingLockAction,
} from "@/lib/actions/meetings";

interface MeetingRoomProps {
  serverUrl: string;
  token: string;
  meetingId: string;
  isHost: boolean;
  initiallyLocked: boolean;
  eventTitle: string;
}

export function MeetingRoom({ serverUrl, token, meetingId, isHost, initiallyLocked, eventTitle }: MeetingRoomProps) {
  const router = useRouter();
  const sessionIdRef = useRef<string | null>(null);

  const handleConnected = useCallback(() => {
    joinMeetingAction(meetingId).then((id) => {
      sessionIdRef.current = id;
    });
  }, [meetingId]);

  const handleDisconnected = useCallback(() => {
    if (sessionIdRef.current) leaveMeetingAction(sessionIdRef.current);
    router.push("/calendar");
  }, [router]);

  return (
    <LiveKitRoom
      serverUrl={serverUrl}
      token={token}
      connect
      audio
      video
      onConnected={handleConnected}
      onDisconnected={handleDisconnected}
      className="flex flex-col gap-4 h-[calc(100vh-8rem)]"
    >
      <RoomAudioRenderer />
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{eventTitle}</h1>
      <VideoGrid isHost={isHost} />
      <RoomControls meetingId={meetingId} isHost={isHost} initiallyLocked={initiallyLocked} />
    </LiveKitRoom>
  );
}

function VideoGrid({ isHost }: { isHost: boolean }) {
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare], { onlySubscribed: false });

  return (
    <Surface variant="pressed" className="flex-1 min-h-64 p-2 overflow-hidden">
      <GridLayout tracks={tracks} style={{ height: "100%" }}>
        <AnnotatedParticipantTile isHost={isHost} />
      </GridLayout>
    </Surface>
  );
}

function RoomControls({
  meetingId,
  isHost,
  initiallyLocked,
}: {
  meetingId: string;
  isHost: boolean;
  initiallyLocked: boolean;
}) {
  const { isMicrophoneEnabled, isCameraEnabled, isScreenShareEnabled, localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [showParticipants, setShowParticipants] = useState(false);
  const [locked, setLocked] = useState(initiallyLocked);
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Surface variant="raised" className="p-3 flex items-center justify-center gap-3 flex-wrap">
        <NeumorphicButton
          size="icon"
          pressed={!isMicrophoneEnabled}
          variant={isMicrophoneEnabled ? "raised" : "danger"}
          aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        >
          {isMicrophoneEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </NeumorphicButton>

        <NeumorphicButton
          size="icon"
          pressed={!isCameraEnabled}
          variant={isCameraEnabled ? "raised" : "danger"}
          aria-label={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        >
          {isCameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}
        </NeumorphicButton>

        <NeumorphicButton
          size="icon"
          pressed={isScreenShareEnabled}
          aria-label={isScreenShareEnabled ? "Stop screen share" : "Share screen"}
          onClick={() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled)}
        >
          {isScreenShareEnabled ? <ScreenShareOff size={18} /> : <ScreenShare size={18} />}
        </NeumorphicButton>

        <NeumorphicButton
          size="icon"
          pressed={showParticipants}
          aria-label="Toggle participant list"
          onClick={() => setShowParticipants((v) => !v)}
        >
          <Users size={18} />
        </NeumorphicButton>

        {isHost && (
          <>
            <NeumorphicButton
              size="icon"
              pressed={locked}
              aria-label={locked ? "Unlock meeting" : "Lock meeting"}
              disabled={isPending}
              onClick={async () => {
                setIsPending(true);
                await setMeetingLockAction(meetingId, !locked);
                setLocked((v) => !v);
                setIsPending(false);
              }}
            >
              {locked ? <Lock size={18} /> : <Unlock size={18} />}
            </NeumorphicButton>
            <NeumorphicButton
              size="sm"
              variant="flat"
              onClick={() => muteAllAction(meetingId)}
            >
              Mute all
            </NeumorphicButton>
          </>
        )}

        <NeumorphicButton
          size="icon"
          variant="danger"
          aria-label="Leave meeting"
          onClick={() => room.disconnect()}
        >
          <PhoneOff size={18} />
        </NeumorphicButton>
      </Surface>

      {showParticipants && <ParticipantPanel meetingId={meetingId} isHost={isHost} />}
    </div>
  );
}

function ParticipantPanel({ meetingId, isHost }: { meetingId: string; isHost: boolean }) {
  const participants = useParticipants();

  return (
    <Surface variant="raised" className="p-4 flex flex-col gap-2 max-w-sm">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Participants ({participants.length})</h3>
      {participants.map((p) => (
        <div key={p.identity} className="flex items-center justify-between text-sm py-1">
          <span className="text-[var(--text-primary)] truncate">
            {p.name || p.identity}
            {p.isLocal && " (You)"}
          </span>
          {isHost && !p.isLocal && (
            <div className="flex gap-1 shrink-0">
              <NeumorphicButton
                size="icon"
                variant="flat"
                aria-label={`Mute ${p.name || p.identity}`}
                onClick={() => muteParticipantAction(meetingId, p.identity)}
              >
                <MicOff size={14} />
              </NeumorphicButton>
              <NeumorphicButton
                size="icon"
                variant="danger"
                aria-label={`Remove ${p.name || p.identity}`}
                onClick={() => removeParticipantAction(meetingId, p.identity)}
              >
                <UserX size={14} />
              </NeumorphicButton>
            </div>
          )}
        </div>
      ))}
    </Surface>
  );
}
