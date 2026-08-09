import type { FileStorage } from "./types";
import { LocalFileStorage } from "./local";
import { S3FileStorage } from "./s3";

export type { FileStorage, StoredFile } from "./types";

function createStorage(): FileStorage {
  return process.env.STORAGE_DRIVER === "s3" ? new S3FileStorage() : new LocalFileStorage();
}

declare global {
  var __fileStorage: FileStorage | undefined;
}

export const storage = globalThis.__fileStorage ?? createStorage();
if (process.env.NODE_ENV !== "production") {
  globalThis.__fileStorage = storage;
}
