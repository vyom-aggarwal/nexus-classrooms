import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}. Add it to .env — see .env.example.`);
  return value;
}

export function isLiveKitConfigured() {
  return !!(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
}

export async function createRoomToken({
  roomName,
  identity,
  name,
  canPublish = true,
}: {
  roomName: string;
  identity: string;
  name: string;
  canPublish?: boolean;
}) {
  const token = new AccessToken(requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"), {
    identity,
    name,
  });
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData: true,
  });
  return token.toJwt();
}

let roomService: RoomServiceClient | null = null;

export function getRoomService() {
  if (!roomService) {
    roomService = new RoomServiceClient(requireEnv("LIVEKIT_URL"), requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"));
  }
  return roomService;
}
