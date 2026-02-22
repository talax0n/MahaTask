'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Users, User, Plus, ArrowLeft, Search, Bell, Video, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat } from '@/hooks/use-chat';
import { useSocial } from '@/hooks/use-social';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';
import { toast } from "sonner";
import { cn } from '@/lib/utils';
import type { Message, Group, Friend } from '@/lib/types';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { VideoCallOverlay } from '@/components/video-call-overlay';
import { VideoCallIncoming } from '@/components/video-call-incoming';
import { decodeVideoCallSignal, encodeVideoCallSignal, type VideoCallSignalPayload } from '@/lib/video-call-signal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

type ConversationType = 'group' | 'direct';

interface Conversation {
  id: string;
  name: string;
  type: ConversationType;
  avatarUrl?: string;
  lastMessage?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [videoCallState, setVideoCallState] = useState<{
    open: boolean;
    type: ConversationType;
    roomId: string;
    title: string;
  }>({
    open: false,
    type: 'group',
    roomId: '',
    title: '',
  });
  const [incomingCall, setIncomingCall] = useState<VideoCallSignalPayload | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [activeGroupCalls, setActiveGroupCalls] = useState<Record<string, { roomId: string; startedBy: string; startedAt: string }>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();
  const { groups, friends, friendRequests, refreshGroups, refreshFriends, refreshFriendRequests, createGroup } = useSocial();
  const {
    messages,
    unreadDirectCounts,
    loadGroupMessages,
    loadDirectMessages,
    sendMessage: sendMessageRest,
    refreshUnreadDirectCounts,
    markDirectMessagesAsRead,
  } = useChat();
  const { isConnected, sendMessage: sendMessageWs, onMessage, onFriendRequest, joinConversation, leaveConversation } = useWebSocket();

  useEffect(() => {
    if (user) {
      refreshGroups();
      refreshFriends();
      refreshFriendRequests();
    }
  }, [user, refreshGroups, refreshFriends, refreshFriendRequests]);

  // Real-time friend request notification
  useEffect(() => {
    const handleFriendRequest = (data: any) => {
      refreshFriendRequests();
      toast.info('New friend request!', {
        description: `${data.senderName || 'Someone'} sent you a friend request.`,
      });
    };

    return onFriendRequest(handleFriendRequest);
  }, [onFriendRequest, refreshFriendRequests]);

  useEffect(() => {
    if (activeConversation) {
      if (activeConversation.type === 'group') {
        loadGroupMessages(activeConversation.id);
      } else {
        loadDirectMessages(activeConversation.id);
        void markDirectMessagesAsRead(activeConversation.id);
      }
    }
  }, [activeConversation, loadGroupMessages, loadDirectMessages, markDirectMessagesAsRead]);

  // Join/leave Socket.IO room when conversation changes so the server routes messages here.
  // isConnected is included so the join is re-emitted if the socket connects after the conversation was already selected.
  useEffect(() => {
    if (activeConversation && isConnected) {
      joinConversation(activeConversation.id, activeConversation.type);
      return () => leaveConversation(activeConversation.id, activeConversation.type);
    }
  }, [activeConversation, isConnected, joinConversation, leaveConversation]);

  // Sync messages from REST API with local state
  useEffect(() => {
    const nextActiveGroupCalls: Record<string, { roomId: string; startedBy: string; startedAt: string }> = {};
    messages.forEach((message) => {
      const signal = decodeVideoCallSignal(message.content);
      if (!signal || signal.callType !== 'group') return;
      const groupId = message.groupId || signal.toConversationId;
      if (!groupId) return;

      if (signal.type === 'group-start') {
        nextActiveGroupCalls[groupId] = {
          roomId: signal.roomId,
          startedBy: signal.fromUserName,
          startedAt: signal.createdAt,
        };
      }
      if (signal.type === 'group-end') {
        delete nextActiveGroupCalls[groupId];
      }
    });
    setActiveGroupCalls(nextActiveGroupCalls);
    setLocalMessages(messages.filter((message) => !decodeVideoCallSignal(message.content)));
  }, [messages]);

  // Auto-scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const sendVideoSignal = async (
    targetType: ConversationType,
    targetId: string,
    payload: VideoCallSignalPayload
  ) => {
    const content = encodeVideoCallSignal(payload);
    if (isConnected) {
      if (targetType === 'group') {
        sendMessageWs(content, targetId);
      } else {
        sendMessageWs(content, undefined, targetId);
      }
      return;
    }

    if (targetType === 'group') {
      await sendMessageRest(content, targetId);
    } else {
      await sendMessageRest(content, undefined, targetId);
    }
  };

  // WebSocket real-time message listener
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      const callSignal = decodeVideoCallSignal(message.content);
      if (callSignal) {
        if (callSignal.callType === 'group') {
          const groupId = message.groupId || callSignal.toConversationId;
          if (!groupId) return;
          if (callSignal.type === 'group-start') {
            setActiveGroupCalls((prev) => ({
              ...prev,
              [groupId]: {
                roomId: callSignal.roomId,
                startedBy: callSignal.fromUserName,
                startedAt: callSignal.createdAt,
              },
            }));
          }
          if (callSignal.type === 'group-end') {
            setActiveGroupCalls((prev) => {
              const next = { ...prev };
              delete next[groupId];
              return next;
            });
          }
          return;
        }

        if (callSignal.type === 'invite' && callSignal.callType === 'direct' && callSignal.fromUserId !== user?.id) {
          setIncomingCall(callSignal);
        }
        if (callSignal.type === 'decline' && callSignal.callType === 'direct' && callSignal.fromUserId !== user?.id) {
          toast.info(`${callSignal.fromUserName} declined the call`);
          setVideoCallState((prev) => ({ ...prev, open: false }));
        }
        if (callSignal.type === 'end' && callSignal.callType === 'direct' && callSignal.fromUserId !== user?.id) {
          toast.info(`${callSignal.fromUserName} ended the call`);
          setVideoCallState((prev) => ({ ...prev, open: false }));
        }
        return;
      }

      if (activeConversation) {
        if (!user) return;
        const directPeerId =
          message.senderId === user.id
            ? (message.recipientId ?? message.directMessageUserId)
            : message.senderId;
        const isDirectMessage = Boolean(message.recipientId || message.directMessageUserId);
        if (isDirectMessage && directPeerId && message.senderId !== user.id) {
          const isActiveDirect =
            activeConversation.type === 'direct' && activeConversation.id === directPeerId;
          if (isActiveDirect) {
            void markDirectMessagesAsRead(directPeerId);
          } else {
            void refreshUnreadDirectCounts();
          }
        }

        const isRelevant =
          (activeConversation.type === 'group' && message.groupId === activeConversation.id) ||
          (activeConversation.type === 'direct' && (
            message.directMessageUserId === activeConversation.id ||
            message.recipientId === activeConversation.id ||
            message.senderId === activeConversation.id
          ));

        if (isRelevant) {
          setLocalMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            const tempIndex = prev.findIndex(
              m => m.id.startsWith('temp-') && m.senderId === message.senderId && m.content === message.content
            );
            if (tempIndex !== -1) {
              const next = [...prev];
              next[tempIndex] = message;
              return next;
            }
            return [...prev, message];
          });
        }
      }
    };

    return onMessage(handleNewMessage);
  }, [activeConversation, onMessage, user, refreshUnreadDirectCounts, markDirectMessagesAsRead]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;

    const content = messageInput.trim();
    setMessageInput('');

    if (isConnected) {
      if (activeConversation.type === 'group') {
        sendMessageWs(content, activeConversation.id);
      } else {
        sendMessageWs(content, undefined, activeConversation.id);
      }
    } else {
      if (activeConversation.type === 'group') {
        await sendMessageRest(content, activeConversation.id);
      } else {
        await sendMessageRest(content, undefined, activeConversation.id);
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreatingGroup(true);
    const group = await createGroup({ name: newGroupName });
    setIsCreatingGroup(false);

    if (group) {
      setNewGroupName('');
      setIsNewChatOpen(false);
      setActiveConversation({
        id: group.id,
        name: group.name,
        type: 'group',
      });
    }
  };

  const conversations: Conversation[] = [
    ...groups.map(g => ({
      id: g.id,
      name: g.name,
      type: 'group' as ConversationType,
      unreadCount: 0,
    })),
    ...friends.map(f => ({
      id: f.id,
      name: f.name,
      type: 'direct' as ConversationType,
      avatarUrl: f.avatarUrl,
      unreadCount: unreadDirectCounts[f.id] ?? 0,
      isOnline: Math.random() > 0.5, // Replace with real status
    })),
  ];

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => `${prev}${emojiData.emoji}`);
    setEmojiOpen(false);
  };

  const resolveParticipantName = (participantUserId: string) => {
    if (participantUserId === user!.id) return `${user!.name} (You)`;
    const friendMatch = friends.find((f) => f.id === participantUserId);
    if (friendMatch) return friendMatch.name;
    const groupMatch = groups
      .flatMap((g) => g.members ?? [])
      .find((m) => m.id === participantUserId);
    if (groupMatch) return groupMatch.name;
    return participantUserId;
  };

  const handleStartVideoCall = () => {
    if (!activeConversation) return;
    const now = new Date().toISOString();
    let roomId = '';

    if (activeConversation.type === 'group') {
      const existingCall = activeGroupCalls[activeConversation.id];
      roomId = existingCall?.roomId ?? `group-${activeConversation.id}`;
      if (!existingCall) {
        void sendVideoSignal('group', activeConversation.id, {
          type: 'group-start',
          roomId,
          callType: 'group',
          fromUserId: user!.id,
          fromUserName: user!.name,
          toConversationId: activeConversation.id,
          createdAt: now,
        });
        setActiveGroupCalls((prev) => ({
          ...prev,
          [activeConversation.id]: {
            roomId,
            startedBy: user!.name,
            startedAt: now,
          },
        }));
      }
    } else {
      roomId = `dm-${[user!.id, activeConversation.id].sort().join('-')}`;
      void sendVideoSignal('direct', activeConversation.id, {
        type: 'invite',
        roomId,
        callType: 'direct',
        fromUserId: user!.id,
        fromUserName: user!.name,
        toConversationId: activeConversation.id,
        createdAt: now,
      });
    }

    setVideoCallState({
      open: true,
      type: activeConversation.type,
      roomId,
      title: activeConversation.name,
    });
  };

  const handleAnswerIncomingCall = () => {
    if (!incomingCall) return;
    setVideoCallState({
      open: true,
      type: incomingCall.callType,
      roomId: incomingCall.roomId,
      title: incomingCall.callType === 'group'
        ? (groups.find((g) => g.id === incomingCall.toConversationId)?.name ?? incomingCall.fromUserName)
        : incomingCall.fromUserName,
    });
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall || !user) return;
    void sendVideoSignal(incomingCall.callType, incomingCall.toConversationId, {
      type: 'decline',
      roomId: incomingCall.roomId,
      callType: incomingCall.callType,
      fromUserId: user.id,
      fromUserName: user.name,
      toConversationId: incomingCall.toConversationId,
      createdAt: new Date().toISOString(),
    });
    setIncomingCall(null);
  };

  const handleEndVideoCall = () => {
    if (!activeConversation || !user) {
      setVideoCallState((prev) => ({ ...prev, open: false }));
      return;
    }
    if (activeConversation.type === 'direct') {
      void sendVideoSignal('direct', activeConversation.id, {
        type: 'end',
        roomId: videoCallState.roomId,
        callType: 'direct',
        fromUserId: user.id,
        fromUserName: user.name,
        toConversationId: activeConversation.id,
        createdAt: new Date().toISOString(),
      });
    }
    setVideoCallState((prev) => ({ ...prev, open: false }));
  };

  // Don't render if user is not authenticated or still loading
  if (loading || !user) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className="h-14 w-14 rounded-full shadow-2xl shadow-primary/50 bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-110"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
            {friendRequests.length > 0 && (
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-background">
                {friendRequests.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 px-4 border-b border-border bg-background/95 backdrop-blur-md flex items-center justify-between shrink-0">
              {activeConversation ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setActiveConversation(null);
                      }}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src={activeConversation.avatarUrl} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {activeConversation.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm leading-none">
                        {activeConversation.name}
                      </h3>
                      {activeConversation.type === 'direct' && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          {activeConversation.isOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          {activeConversation.isOnline ? 'Active now' : 'Offline'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={activeConversation.type === 'group' ? 'Start group video call' : 'Start direct video call'}
                      title={activeConversation.type === 'group' ? 'Group Video Call' : 'Direct Video Call'}
                      onClick={handleStartVideoCall}
                    >
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsNewChatOpen(true)}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Content */}
            {activeConversation ? (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {localMessages.map((message) => {
                      const isOwn = message.senderId === user?.id;
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'flex w-full',
                            isOwn ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[75%] px-3 py-2 rounded-2xl text-sm break-words shadow-sm',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-secondary/80 text-foreground rounded-bl-sm'
                            )}
                          >
                            {!isOwn && activeConversation.type === 'group' && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {message.sender?.name}
                              </p>
                            )}
                            <p>{message.content}</p>
                            <p
                              className={cn(
                                'text-[10px] mt-1 opacity-60',
                                isOwn ? 'text-right' : 'text-left'
                              )}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={bottomRef} />
                    {localMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-2">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                        <p className="text-xs text-muted-foreground">
                          Start the conversation!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-3 border-t border-border bg-background/95 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-2 bg-secondary/50 rounded-full px-3 py-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-8 text-sm"
                    />
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          title="Add Emoji"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 bg-transparent shadow-none" align="end">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          autoFocusSearch={false}
                          previewConfig={{ showPreview: false }}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 rounded-full"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search */}
                <div className="p-3 border-b border-border shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Conversations List */}
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-2 px-4">
                        <div className="h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
                          <MessageSquare className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">No conversations yet</p>
                        <p className="text-xs text-muted-foreground">
                          Create a group or start chatting with friends!
                        </p>
                        <Button
                          size="sm"
                          onClick={() => setIsNewChatOpen(true)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Chat
                        </Button>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => setActiveConversation(conversation)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                        >
                          <div className="relative">
                            <Avatar className="h-12 w-12 border border-border/50">
                              <AvatarImage src={conversation.avatarUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {conversation.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.type === 'direct' && conversation.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
                            )}
                            {conversation.type === 'group' && (
                              <span className="absolute bottom-0 right-0 w-5 h-5 bg-background rounded-full border border-border/50 flex items-center justify-center">
                                <Users className="h-3 w-3 text-muted-foreground" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm truncate">
                                {conversation.name}
                              </h3>
                              {conversation.unreadCount && conversation.unreadCount > 0 && (
                                <Badge
                                  variant="default"
                                  className="h-5 min-w-5 px-1.5 text-xs rounded-full"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
            <DialogDescription>
              Start a direct message with a friend or create a group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Direct Message - Friends List */}
            {friends.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Direct Message
                </Label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => {
                        setActiveConversation({
                          id: friend.id,
                          name: friend.name,
                          type: 'direct',
                          avatarUrl: friend.avatarUrl,
                        });
                        setIsNewChatOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8 border border-border/50">
                        <AvatarImage src={friend.avatarUrl} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {friend.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm truncate">{friend.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{friend.userCode}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Create Group */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Create Group
              </Label>
              <div className="flex gap-2">
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. CS101 Study Group"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateGroup();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isCreatingGroup}
                  className="shrink-0"
                >
                  {isCreatingGroup ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <VideoCallOverlay
        open={videoCallState.open}
        callType={videoCallState.type}
        roomId={videoCallState.roomId}
        title={videoCallState.title}
        currentUserId={user.id}
        currentUserName={user.name}
        resolveName={resolveParticipantName}
        onClose={handleEndVideoCall}
      />
      <VideoCallIncoming
        open={Boolean(incomingCall)}
        callerName={incomingCall?.fromUserName ?? 'Unknown'}
        callType={incomingCall?.callType ?? 'direct'}
        onAnswer={handleAnswerIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />
    </>
  );
}
