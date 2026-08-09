import { randomUUID } from "crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { FileStorage, StoredFile } from "./types";

// Sidecar metadata (original filename/mimeType) is stored as S3 object
// metadata rather than a separate file, since S3 supports that natively.
export class S3FileStorage implements FileStorage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = requireEnv("S3_BUCKET");
    this.client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
      },
    });
  }

  async put(file: File): Promise<StoredFile> {
    const key = `attachments/${randomUUID()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: { filename: encodeURIComponent(file.name) },
      }),
    );

    return { key, filename: file.name, mimeType, size: buffer.byteLength };
  }

  async get(key: string) {
    try {
      const res = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
      const bytes = await res.Body?.transformToByteArray();
      if (!bytes) return null;
      return { data: Buffer.from(bytes), mimeType: res.ContentType ?? "application/octet-stream" };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var for S3 storage: ${name}`);
  return value;
}
