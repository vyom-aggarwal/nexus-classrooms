export type AnnotationTool = "pen" | "eraser";

export interface StrokePoint {
  x: number; // normalized 0..1, relative to the tile's rendered box
  y: number;
}

export interface StrokeMessage {
  targetIdentity: string; // identity of the participant whose tile is being drawn on
  strokeId: string;
  tool: AnnotationTool;
  color: string;
  size: number; // normalized to tile width (0..1), so it scales with the tile
  kind: "start" | "point" | "end" | "clear";
  point?: StrokePoint;
}

export const ANNOTATION_TOPIC = "annotation";
