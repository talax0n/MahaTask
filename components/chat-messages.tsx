'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/types'; // Import from types, not hooks
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 h-full overflow-y-auto p-4 space-y-6"
    >
      <AnimatePresence mode="popLayout">
        {messages.map((message, idx) => {
          const isOwn = message.senderId === currentUserId;
          const showAvatar = !isOwn && (idx === 0 || messages[idx - 1].senderId !== message.senderId);

          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex w-full items-end gap-2',
                isOwn ? 'justify-end' : 'justify-start'
              )}
            >
              {!isOwn && (
                <div className="w-8 flex-shrink-0">
                  {showAvatar ? (
                    <Avatar className="h-8 w-8 border border-border/40 shadow-sm">
                      <AvatarImage src={message.sender?.avatarUrl} />
                      <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-bold">
                        {message.sender?.name?.substring(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                  ) : <div className="w-8" />}
                </div>
              )}

              <div
                className={cn(
                  'max-w-[70%] relative group',
                  isOwn ? 'items-end' : 'items-start'
                )}
              >
                {!isOwn && showAvatar && (
                   <span className="text-[10px] text-muted-foreground ml-1 mb-1 block">
                      {message.sender?.name || 'Unknown'}
                   </span>
                )}
                <div
                  className={cn(
                    'px-4 py-2.5 shadow-sm text-sm break-words',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                      : 'bg-secondary/80 text-foreground rounded-2xl rounded-tl-sm backdrop-blur-sm'
                  )}
                >
                  {message.content}
                </div>
                <span className={cn(
                    "text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 min-w-max",
                     isOwn ? "right-1" : "left-1"
                )}>
                  {format(new Date(message.createdAt), 'h:mm a')}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8"
        >
          <div className="h-32 w-32 bg-secondary/20 rounded-full flex items-center justify-center">
             <span className="text-4xl">👋</span>
          </div>
          <div className="space-y-1">
             <h3 className="text-lg font-medium">No messages yet</h3>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto">
               Be the first to send a message to this group and start the conversation!
             </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}