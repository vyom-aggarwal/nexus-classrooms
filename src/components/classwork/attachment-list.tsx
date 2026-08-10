import { Paperclip, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { Surface } from "@/components/ui/surface";

const LINK_MIME = "text/uri-list";

function iconFor(mimeType: string) {
  if (mimeType === LINK_MIME) return ExternalLink;
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType === "application/pdf") return FileText;
  return Paperclip;
}

export function AttachmentList({
  attachments,
}: {
  attachments: { id: string; filename: string; url: string; mimeType: string }[];
}) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {attachments.map((a) => {
        const isLink = a.mimeType === LINK_MIME;
        const Icon = iconFor(a.mimeType);

        return (
          <a
            key={a.id}
            href={isLink ? a.url : `/api/files/${a.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block max-w-full"
          >
            <Surface
              variant="raised"
              depth="sm"
              rounded="control"
              className="neu-interactive px-4 py-2.5 flex items-center gap-2.5 text-sm text-[var(--text-primary)]"
            >
              <Icon size={16} className="text-[var(--accent-text)] shrink-0" />
              <span className="truncate max-w-[16rem]">{a.filename}</span>
            </Surface>
          </a>
        );
      })}
    </div>
  );
}
