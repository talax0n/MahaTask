import { useState, useCallback, useEffect } from 'react';

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

interface UseChatReturn {
  rooms: ChatRoom[];
  currentMessages: Message[];
  loading: boolean;
  error: string | null;
  createRoom: (name: string, description?: string) => Promise<ChatRoom | null>;
  sendMessage: (roomId: string, userId: string, content: string) => Promise<Message | null>;
  loadMessages: (roomId: string) => Promise<void>;
  refreshRooms: () => Promise<void>;
}

export function useChat(userId: string | null): UseChatReturn {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRooms = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chat?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  const createRoom = useCallback(async (name: string, description?: string) => {
    if (!userId) return null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, createdBy: userId })
      });
      if (!response.ok) throw new Error('Failed to create room');
      const newRoom = await response.json();
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [userId]);

  const sendMessage = useCallback(async (roomId: string, userId: string, content: string) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, userId, content })
      });
      if (!response.ok) throw new Error('Failed to send message');
      const newMessage = await response.json();
      setCurrentMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?roomId=${roomId}&limit=100`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setCurrentMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, []);

  return {
    rooms,
    currentMessages,
    loading,
    error,
    createRoom,
    sendMessage,
    loadMessages,
    refreshRooms
  };
}
