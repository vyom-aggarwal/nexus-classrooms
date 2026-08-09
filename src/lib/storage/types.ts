export interface StoredFile {
  /** Opaque key the storage driver can use to retrieve or delete the file later. */
  key: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface FileStorage {
  put(file: File): Promise<StoredFile>;
  /** Returns a Buffer + content type for streaming back to a client. */
  get(key: string): Promise<{ data: Buffer; mimeType: string } | null>;
  delete(key: string): Promise<void>;
}
