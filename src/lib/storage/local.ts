import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { FileStorage, StoredFile } from "./types";

const BASE_DIR = path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR ?? "./storage/uploads");

// Attachment mimeType is stored alongside the file on disk as a tiny sidecar
// JSON file, since the local filesystem has nowhere else to keep it.
function metaPath(diskName: string) {
  return path.join(BASE_DIR, `${diskName}.json`);
}

export class LocalFileStorage implements FileStorage {
  async put(file: File): Promise<StoredFile> {
    await mkdir(BASE_DIR, { recursive: true });

    const ext = path.extname(file.name);
    const diskName = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(BASE_DIR, diskName), buffer);
    await writeFile(
      metaPath(diskName),
      JSON.stringify({ filename: file.name, mimeType: file.type || "application/octet-stream" }),
    );

    return {
      key: diskName,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: buffer.byteLength,
    };
  }

  async get(key: string) {
    try {
      const [data, metaRaw] = await Promise.all([
        readFile(path.join(BASE_DIR, key)),
        readFile(metaPath(key), "utf-8"),
      ]);
      const meta = JSON.parse(metaRaw) as { mimeType: string };
      return { data, mimeType: meta.mimeType };
    } catch {
      return null;
    }
  }

  async delete(key: string) {
    await Promise.allSettled([unlink(path.join(BASE_DIR, key)), unlink(metaPath(key))]);
  }
}
