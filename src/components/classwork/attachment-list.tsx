import { Paperclip, ExternalLink } from "lucide-react";
import { Surface } from "@/components/ui/surface";

export function AttachmentList({
  attachments,
}: {
  attachments: { id: string; filename: string; url: string; mimeType: string }[];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((a) => {
        const isLink = a.mimeType === "text/uri-list";
        return (
          <a
            key={a.id}
            href={isLink ? a.url : `/api/files/${a.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Surface variant="pressed" depth="sm" className="px-4 py-2.5 flex items-center gap-2 text-sm text-[var(--accent)]">
              {isLink ? <ExternalLink size={16} /> : <Paperclip size={16} />}
              <span className="truncate">{a.filename}</span>
            </Surface>
          </a>
        );
      })}
    </div>
  );
}
