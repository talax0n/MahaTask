'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';
import { buildAttachmentMessage } from '@/lib/chat-attachment';
import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !isUploading) {
      onSend(message);
      setMessage('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => `${prev}${emojiData.emoji}`);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  const handlePickAttachment = () => {
    if (isLoading || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      const encodedAttachment = await buildAttachmentMessage(file, {
        uploader: async (uploadFile) => {
          const formData = new FormData();
          formData.append('file', uploadFile);
          const uploadResult = await apiClient.post<{ url: string }>(
            API_CONFIG.ENDPOINTS.CHAT.UPLOAD_ATTACHMENT,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
          );
          return uploadResult.url;
        },
      });
      onSend(encodedAttachment);
      toast.success('File berhasil dikirim');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim file');
    } finally {
      setIsUploading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-secondary/50 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleAttachmentChange}
      />
      <div className="flex gap-1">
        <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
          <PopoverTrigger asChild>
             <Button 
                type="button" 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                title="Add Emoji"
            >
                <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 bg-transparent shadow-none">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost" 
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title="Attach File (Max 50 KB)"
          onClick={handlePickAttachment}
          disabled={isLoading || isUploading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
      </div>

      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isLoading || isUploading}
        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 text-base md:text-sm"
        autoComplete="off"
      />
      
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading || isUploading}
        className={cn(
          'h-10 w-10 rounded-xl transition-all duration-200',
          message.trim() && !isLoading && !isUploading
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100' 
            : 'bg-secondary text-muted-foreground scale-95 opacity-50'
        )}
      >
        <Send className="w-5 h-5 ml-0.5" />
      </Button>
    </form>
  );
}
