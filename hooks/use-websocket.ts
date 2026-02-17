import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import { io, Socket } from 'socket.io-client';
import type { Message } from '@/lib/types';

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (content: string, groupId?: string, directMessageUserId?: string) => void;
  onMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: { userId: string; isTyping: boolean; groupId?: string }) => void) => () => void;
  onFriendRequest: (callback: (data: any) => void) => () => void;
  sendTyping: (isTyping: boolean, groupId?: string, directMessageUserId?: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messageCallbacksRef = useRef<((message: Message) => void)[]>([]);
  const typingCallbacksRef = useRef<((data: any) => void)[]>([]);
  const friendRequestCallbacksRef = useRef<((data: any) => void)[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.log('No token available for WebSocket connection');
      return;
    }

    // Close existing connection if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Socket.IO URL - use the same base URL as API
    const socket = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    });

    socket.on('receive_message', (message: Message) => {
      // New message received
      messageCallbacksRef.current.forEach(callback => {
        callback(message);
      });
    });

    socket.on('typing', (data: any) => {
      // Typing indicator
      typingCallbacksRef.current.forEach(callback => {
        callback(data);
      });
    });

    socket.on('friendRequest', (data: any) => {
      // New friend request received
      friendRequestCallbacksRef.current.forEach(callback => {
        callback(data);
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnect attempt:', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
      console.log('Socket.IO reconnection failed');
    });

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, groupId?: string, directMessageUserId?: string) => {
    if (socketRef.current && socketRef.current.connected) {
      if (groupId) {
        // Send group message
        socketRef.current.emit('send_message', {
          type: 'group',
          groupId,
          content,
        });
      } else if (directMessageUserId) {
        // Send direct message
        socketRef.current.emit('send_message', {
          type: 'dm',
          recipientId: directMessageUserId,
          content,
        });
      }
    } else {
      console.error('Socket.IO is not connected');
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean, groupId?: string, directMessageUserId?: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', {
        isTyping,
        groupId,
        directMessageUserId,
      });
    }
  }, []);

  const onMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbacksRef.current.push(callback);
    return () => {
      messageCallbacksRef.current = messageCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const onTyping = useCallback((callback: (data: any) => void) => {
    typingCallbacksRef.current.push(callback);
    return () => {
      typingCallbacksRef.current = typingCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const onFriendRequest = useCallback((callback: (data: any) => void) => {
    friendRequestCallbacksRef.current.push(callback);
    return () => {
      friendRequestCallbacksRef.current = friendRequestCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    onMessage,
    onTyping,
    onFriendRequest,
    sendTyping,
  };
}
