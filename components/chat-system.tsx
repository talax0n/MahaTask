'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/use-chat';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSystemProps {
  userId: string;
}

export function ChatSystem({ userId }: ChatSystemProps) {
  const { rooms, currentMessages, createRoom, sendMessage, loadMessages } = useChat(userId);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (selectedRoomId && !currentMessages.some(m => m.room_id === selectedRoomId)) {
      loadMessages(selectedRoomId);
    }
  }, [selectedRoomId]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      const room = await createRoom(newRoomName);
      if (room) {
        setNewRoomName('');
        setShowNewRoom(false);
        setSelectedRoomId(room.id);
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (selectedRoomId) {
      await sendMessage(selectedRoomId, userId, content);
    }
  };

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const roomMessages = selectedRoomId 
    ? currentMessages.filter(m => m.room_id === selectedRoomId)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Study Groups</h2>
        <p className="text-sm text-muted-foreground">Real-time collaboration with classmates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[600px]">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="border-b border-border p-3">
            <Button
              onClick={() => setShowNewRoom(true)}
              size="sm"
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" />
              New Group
            </Button>
          </div>

          {/* Create room form */}
          <AnimatePresence>
            {showNewRoom && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateRoom}
                className="border-b border-border p-3 space-y-2"
              >
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Group name..."
                  className="bg-background border-border text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="flex-1 bg-primary text-xs">
                    Create
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewRoom(false);
                      setNewRoomName('');
                    }}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Rooms list */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {rooms.map((room, idx) => (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={cn(
                    'w-full text-left px-3 py-3 border-b border-border/50 hover:bg-background/50 transition-colors text-sm',
                    selectedRoomId === room.id && 'bg-primary/20 border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate">{room.name}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>

            {rooms.length === 0 && (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
                No groups yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden flex flex-col"
        >
          {selectedRoom ? (
            <>
              {/* Chat header */}
              <div className="border-b border-border p-3 bg-background/50">
                <h3 className="font-semibold text-foreground">{selectedRoom.name}</h3>
                {selectedRoom.description && (
                  <p className="text-xs text-muted-foreground">{selectedRoom.description}</p>
                )}
              </div>

              {/* Messages */}
              <ChatMessages messages={roomMessages} currentUserId={userId} />

              {/* Input */}
              <ChatInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a group to start chatting
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
