'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/hooks/use-chat';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
}

export function ChatMessages({ messages, currentUserId, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 p-4 bg-background/30"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, idx) => {
          const isOwn = message.user_id === currentUserId;

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: idx * 0.02 }}
              className={cn('flex', isOwn && 'justify-end')}
            >
              <div
                className={cn(
                  'max-w-xs rounded-lg px-3 py-2 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-card border border-border text-foreground rounded-bl-none'
                )}
              >
                <p className="break-words">{message.content}</p>
                <p
                  className={cn(
                    'text-xs mt-1 opacity-70',
                    isOwn && 'text-primary-foreground/70'
                  )}
                >
                  {format(new Date(message.created_at), 'HH:mm')}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center h-full text-muted-foreground text-sm"
        >
          No messages yet. Start the conversation!
        </motion.div>
      )}
    </div>
  );
}
