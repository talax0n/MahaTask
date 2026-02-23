'use client';

import { File as FileIcon, Download } from 'lucide-react';
import type { ChatAttachmentPayload } from '@/lib/chat-attachment';
import { formatAttachmentSize } from '@/lib/chat-attachment';

interface ChatAttachmentContentProps {
  attachment: ChatAttachmentPayload;
  isOwn: boolean;
}

export function ChatAttachmentContent({ attachment, isOwn }: ChatAttachmentContentProps) {
  const source = attachment.url || attachment.dataUrl;
  if (!source) return null;

  return (
    <div className="space-y-2">
      {attachment.isImage ? (
        <a href={source} download={attachment.fileName} target="_blank" rel="noreferrer" className="block">
          <img
            src={source}
            alt={attachment.fileName}
            className="max-h-56 w-auto rounded-lg border border-black/10 object-contain"
          />
        </a>
      ) : (
        <a
          href={source}
          download={attachment.fileName}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2"
        >
          <FileIcon className="h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{attachment.fileName}</p>
            <p className="text-[10px] opacity-75">{formatAttachmentSize(attachment.size)}</p>
          </div>
          <Download className="h-4 w-4 shrink-0" />
        </a>
      )}
      <p className={`text-[10px] ${isOwn ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
        {attachment.fileName} • {formatAttachmentSize(attachment.size)}
      </p>
    </div>
  );
}
