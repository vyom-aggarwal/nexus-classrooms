"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RoomEvent } from "livekit-client";
import { useRoomContext } from "@livekit/components-react";
import { Pencil, Eraser, Trash2, X } from "lucide-react";
import { NeumorphicButton } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";
import { ANNOTATION_TOPIC, type AnnotationTool, type StrokeMessage, type StrokePoint } from "@/lib/annotation/types";

const COLORS = ["#ff5470", "#ffd23f", "#3fcf94", "#6a63f1", "#ffffff"];

interface Stroke {
  tool: AnnotationTool;
  color: string;
  size: number;
  points: StrokePoint[];
}

export function AnnotationCanvas({
  targetIdentity,
  containerRef,
  canAnnotate,
}: {
  targetIdentity: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canAnnotate: boolean;
}) {
  const room = useRoomContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Map<string, Stroke>>(new Map());
  const activeStrokeIdRef = useRef<string | null>(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [tool, setTool] = useState<AnnotationTool>("pen");
  const [color, setColor] = useState(COLORS[0]);

  const getCtx = useCallback(() => canvasRef.current?.getContext("2d") ?? null, []);

  const drawSegment = useCallback(
    (ctx: CanvasRenderingContext2D, from: StrokePoint | undefined, to: StrokePoint, tool: AnnotationTool, color: string, size: number) => {
      const canvas = ctx.canvas;
      const w = canvas.width;
      const h = canvas.height;
      const toPx = (p: StrokePoint) => ({ x: p.x * w, y: p.y * h });
      const start = from ? toPx(from) : toPx(to);
      const end = toPx(to);

      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size * w;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    },
    [],
  );

  const redrawAll = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const stroke of strokesRef.current.values()) {
      let prev: StrokePoint | undefined;
      for (const point of stroke.points) {
        drawSegment(ctx, prev, point, stroke.tool, stroke.color, stroke.size);
        prev = point;
      }
    }
  }, [drawSegment, getCtx]);

  // Keep the canvas backing store matched to the tile's rendered box (which,
  // under object-fit:cover, is exactly the video's rendered box) so drawing
  // stays pixel-aligned across resizes and aspect ratios.
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      redrawAll();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, redrawAll]);

  const broadcast = useCallback(
    (msg: StrokeMessage) => {
      room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), {
        reliable: true,
        topic: ANNOTATION_TOPIC,
      });
    },
    [room],
  );

  // Listen for strokes targeting this tile from any participant.
  useEffect(() => {
    function handleData(payload: Uint8Array, _participant: unknown, _kind: unknown, topic?: string) {
      if (topic !== ANNOTATION_TOPIC) return;
      let msg: StrokeMessage;
      try {
        msg = JSON.parse(new TextDecoder().decode(payload));
      } catch {
        return;
      }
      if (msg.targetIdentity !== targetIdentity) return;

      const ctx = getCtx();
      if (!ctx) return;

      if (msg.kind === "clear") {
        strokesRef.current.clear();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        return;
      }
      if (msg.kind === "start") {
        strokesRef.current.set(msg.strokeId, { tool: msg.tool, color: msg.color, size: msg.size, points: [] });
        return;
      }
      const stroke = strokesRef.current.get(msg.strokeId);
      if (!stroke || !msg.point) return;
      const prev = stroke.points[stroke.points.length - 1];
      stroke.points.push(msg.point);
      drawSegment(ctx, prev, msg.point, stroke.tool, stroke.color, stroke.size);
    }

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, targetIdentity, drawSegment, getCtx]);

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>): StrokePoint {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingMode) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const strokeId = crypto.randomUUID();
    activeStrokeIdRef.current = strokeId;
    const size = tool === "eraser" ? 0.05 : 0.01;
    strokesRef.current.set(strokeId, { tool, color, size, points: [] });
    broadcast({ targetIdentity, strokeId, tool, color, size, kind: "start" });
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingMode || !activeStrokeIdRef.current) return;
    const strokeId = activeStrokeIdRef.current;
    const stroke = strokesRef.current.get(strokeId);
    if (!stroke) return;

    const point = pointFromEvent(e);
    const ctx = getCtx();
    const prev = stroke.points[stroke.points.length - 1];
    stroke.points.push(point);
    if (ctx) drawSegment(ctx, prev, point, stroke.tool, stroke.color, stroke.size);
    broadcast({ targetIdentity, strokeId, tool: stroke.tool, color: stroke.color, size: stroke.size, kind: "point", point });
  }

  function handlePointerUp() {
    if (!activeStrokeIdRef.current) return;
    const strokeId = activeStrokeIdRef.current;
    const stroke = strokesRef.current.get(strokeId);
    activeStrokeIdRef.current = null;
    if (!stroke) return;
    broadcast({ targetIdentity, strokeId, tool: stroke.tool, color: stroke.color, size: stroke.size, kind: "end" });
  }

  function handleClear() {
    strokesRef.current.clear();
    const ctx = getCtx();
    if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    broadcast({ targetIdentity, strokeId: "", tool, color, size: 0, kind: "clear" });
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 h-full w-full touch-none", drawingMode ? "cursor-crosshair" : "pointer-events-none")}
        style={{ pointerEvents: drawingMode ? "auto" : "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {canAnnotate && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-auto">
          {drawingMode && (
            <Surface variant="raised" className="flex items-center gap-1 p-1">
              <NeumorphicButton size="icon" pressed={tool === "pen"} onClick={() => setTool("pen")} aria-label="Pen">
                <Pencil size={14} />
              </NeumorphicButton>
              <NeumorphicButton size="icon" pressed={tool === "eraser"} onClick={() => setTool("eraser")} aria-label="Eraser">
                <Eraser size={14} />
              </NeumorphicButton>
              {COLORS.map((c) => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                  className={cn("h-5 w-5 rounded-full border-2", color === c ? "border-[var(--accent)]" : "border-transparent")}
                  style={{ background: c }}
                />
              ))}
              <NeumorphicButton size="icon" variant="flat" onClick={handleClear} aria-label="Clear all drawings">
                <Trash2 size={14} />
              </NeumorphicButton>
            </Surface>
          )}
          <NeumorphicButton
            size="icon"
            pressed={drawingMode}
            aria-label={drawingMode ? "Stop drawing" : "Draw on this video"}
            onClick={() => setDrawingMode((v) => !v)}
          >
            {drawingMode ? <X size={16} /> : <Pencil size={16} />}
          </NeumorphicButton>
        </div>
      )}
    </>
  );
}
