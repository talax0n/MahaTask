import { useState, useCallback, useEffect } from 'react';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import type { Message } from '@/lib/types';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  loadGroupMessages: (groupId: string) => Promise<void>;
  loadDirectMessages: (userId: string) => Promise<void>;
  clearMessages: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGroupMessages = useCallback(async (groupId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Message[]>(
        API_CONFIG.ENDPOINTS.CHAT.GET_GROUP_MESSAGES(groupId)
      );
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDirectMessages = useCallback(async (userId: string) => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Message[]>(
        API_CONFIG.ENDPOINTS.CHAT.GET_DIRECT_MESSAGES(userId)
      );
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    loadGroupMessages,
    loadDirectMessages,
    clearMessages,
  };
}

// Note: For real-time messaging, you'll need to implement WebSocket connection
// This hook provides REST API endpoints for fetching messages
// For sending messages, you'll need to connect to the WebSocket gateway at ws://localhost:3000
