"use client";

import { useRef } from "react";
import { ParticipantTile, useLocalParticipant, useTrackRefContext } from "@livekit/components-react";
import { AnnotationCanvas } from "@/components/meet/annotation-canvas";

export function AnnotatedParticipantTile({ isHost }: { isHost: boolean }) {
  const trackRef = useTrackRefContext();
  const { localParticipant } = useLocalParticipant();
  const containerRef = useRef<HTMLDivElement>(null);

  const identity = trackRef.participant.identity;
  const canAnnotate = isHost || identity === localParticipant.identity;

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <ParticipantTile />
      <AnnotationCanvas targetIdentity={identity} containerRef={containerRef} canAnnotate={canAnnotate} />
    </div>
  );
}
