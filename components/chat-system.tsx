'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/hooks/use-chat';
import { useSocial } from '@/hooks/use-social';
import { useWebSocket } from '@/hooks/use-websocket';
import { ChatMessages } from '@/components/chat-messages';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, Search, MessageSquare, UserPlus, Copy, Check, Bell, User, Video, UserMinus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import type { Message, Friend } from '@/lib/types';
import { VideoCallOverlay } from '@/components/video-call-overlay';
import { VideoCallIncoming } from '@/components/video-call-incoming';
import { decodeVideoCallSignal, encodeVideoCallSignal, type VideoCallSignalPayload } from '@/lib/video-call-signal';

type ConversationType = 'group' | 'direct';

interface ChatSystemProps {
  userId: string;
  userCode: string;
  userName: string;
}

export function ChatSystem({ userId, userCode, userName }: ChatSystemProps) {
  const {
    groups,
    friends,
    friendRequests,
    createGroup,
    addMemberToGroup,
    leaveGroup,
    kickMember,
    promoteMember,
    demoteMember,
    transferAdmin,
    refreshGroups,
    requestFriend,
    acceptRequest,
    rejectRequest,
    refreshFriendRequests,
    refreshFriends,
  } = useSocial();

  const {
    messages,
    unreadDirectCounts,
    loadGroupMessages,
    loadDirectMessages,
    sendMessage: sendMessageRest,
    refreshUnreadDirectCounts,
    markDirectMessagesAsRead,
    loading: chatLoading
  } = useChat();

  const {
    isConnected,
    sendMessage: sendMessageWs,
    onMessage,
    onFriendRequest,
    joinConversation,
    leaveConversation,
  } = useWebSocket();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversationType, setSelectedConversationType] = useState<ConversationType>('group');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'groups' | 'friends'>('groups');
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
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
  const [activeGroupCalls, setActiveGroupCalls] = useState<Record<string, {
    roomId: string;
    startedBy: string;
    startedAt: string;
  }>>({});

  // Initial load
  useEffect(() => {
    refreshGroups();
    refreshFriendRequests();
    refreshFriends();
  }, [refreshGroups, refreshFriendRequests, refreshFriends]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      if (selectedConversationType === 'group') {
        loadGroupMessages(selectedConversationId);
      } else {
        loadDirectMessages(selectedConversationId);
      }
    }
  }, [selectedConversationId, selectedConversationType, loadGroupMessages, loadDirectMessages]);

  // Join/leave Socket.IO room when conversation changes so the server routes messages here.
  // isConnected is included so the join is re-emitted if the socket connects after the conversation was already selected.
  useEffect(() => {
    if (selectedConversationId && isConnected) {
      joinConversation(selectedConversationId, selectedConversationType);
      return () => leaveConversation(selectedConversationId, selectedConversationType);
    }
  }, [selectedConversationId, selectedConversationType, isConnected, joinConversation, leaveConversation]);

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

  // WebSocket real-time friend request listener
  useEffect(() => {
    const handleFriendRequest = (data: any) => {
      refreshFriendRequests();
      toast.info('New friend request!', {
        description: `${data.senderName || 'Someone'} sent you a friend request.`,
      });
    };

    return onFriendRequest(handleFriendRequest);
  }, [onFriendRequest, refreshFriendRequests]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const group = await createGroup({ name: newGroupName });
    if (group) {
      setNewGroupName('');
      setIsCreateGroupOpen(false);
      setSelectedConversationId(group.id);
      setSelectedConversationType('group');
      toast.success('Group created', {
        description: `${newGroupName} has been created successfully.`,
      });
    }
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedConversationId(groupId);
    setSelectedConversationType('group');
  };

  const handleSelectFriend = (friend: Friend) => {
    setSelectedConversationId(friend.id);
    setSelectedConversationType('direct');
    void markDirectMessagesAsRead(friend.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;

    if (isConnected) {
      if (selectedConversationType === 'group') {
        sendMessageWs(content, selectedConversationId);
      } else {
        sendMessageWs(content, undefined, selectedConversationId);
      }
    } else {
      if (selectedConversationType === 'group') {
        await sendMessageRest(content, selectedConversationId);
      } else {
        await sendMessageRest(content, undefined, selectedConversationId);
      }
    }
  };

  const sendVideoSignal = useCallback(async (
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
  }, [isConnected, sendMessageWs, sendMessageRest]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setCopiedCode(true);
      toast.success('Code copied!', {
        description: 'Your friend code has been copied to clipboard.',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast.error('Failed to copy', {
        description: 'Could not copy code to clipboard.',
      });
    }
  };

  const handleAddFriend = async () => {
    if (!friendCode.trim()) {
      toast.error('Invalid code', {
        description: 'Please enter a valid friend code.',
      });
      return;
    }

    if (friendCode === userCode) {
      toast.error('Invalid code', {
        description: 'You cannot add yourself as a friend.',
      });
      return;
    }

    const result = await requestFriend({ userCode: friendCode });

    if (result) {
      toast.success('Friend request sent!', {
        description: 'Your friend request has been sent.',
      });
      setFriendCode('');
      setIsAddFriendOpen(false);
    } else {
      // Auto-accepted or error already handled by the hook
      setFriendCode('');
      setIsAddFriendOpen(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptRequest(requestId);
    if (success) {
      toast.success('Friend request accepted', {
        description: 'You are now friends!',
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const success = await rejectRequest(requestId);
    if (success) {
      toast.success('Friend request rejected', {
        description: 'The request has been removed.',
      });
    }
  };

  const selectedGroup = groups.find(g => g.id === selectedConversationId);
  const selectedFriend = friends.find(f => f.id === selectedConversationId);

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeName = selectedConversationType === 'group'
    ? selectedGroup?.name
    : selectedFriend?.name;
  const activeGroupCall = selectedConversationType === 'group' && selectedConversationId
    ? activeGroupCalls[selectedConversationId]
    : null;
  const currentGroupMembership = selectedGroup?.members?.find((member) => member.id === userId);
  const canManageMembers = currentGroupMembership?.role === 'ADMIN' || currentGroupMembership?.role === 'MODERATOR';
  const canChangeRoles = currentGroupMembership?.role === 'ADMIN';
  const groupMemberIds = new Set((selectedGroup?.members ?? []).map((member) => member.id));
  const addableFriends = friends.filter((friend) => !groupMemberIds.has(friend.id));

  const resolveParticipantName = useCallback((participantUserId: string) => {
    if (participantUserId === userId) return `${userName} (You)`;
    const friendMatch = friends.find((f) => f.id === participantUserId);
    if (friendMatch) return friendMatch.name;
    const groupMatch = groups
      .flatMap((g) => g.members ?? [])
      .find((m) => m.id === participantUserId);
    if (groupMatch) return groupMatch.name;
    return participantUserId;
  }, [friends, groups, userId, userName]);

  const handleStartVideoCall = useCallback(() => {
    if (!selectedConversationId || !activeName) return;
    const now = new Date().toISOString();
    let roomId = '';

    if (selectedConversationType === 'group') {
      roomId = activeGroupCall?.roomId ?? `group-${selectedConversationId}`;
      if (!activeGroupCall) {
        void sendVideoSignal('group', selectedConversationId, {
          type: 'group-start',
          roomId,
          callType: 'group',
          fromUserId: userId,
          fromUserName: userName,
          toConversationId: selectedConversationId,
          createdAt: now,
        });
        setActiveGroupCalls((prev) => ({
          ...prev,
          [selectedConversationId]: {
            roomId,
            startedBy: userName,
            startedAt: now,
          },
        }));
      }
    } else {
      roomId = `dm-${[userId, selectedConversationId].sort().join('-')}`;
      void sendVideoSignal('direct', selectedConversationId, {
        type: 'invite',
        roomId,
        callType: 'direct',
        fromUserId: userId,
        fromUserName: userName,
        toConversationId: selectedConversationId,
        createdAt: now,
      });
    }

    setVideoCallState({
      open: true,
      type: selectedConversationType,
      roomId,
      title: activeName,
    });
  }, [selectedConversationId, selectedConversationType, activeName, userId, userName, sendVideoSignal, activeGroupCall]);

  const handleAddFriendToSelectedGroup = useCallback(async (friendId: string) => {
    if (!selectedGroup) return;
    if (!friendId) {
      toast.error('Invalid user');
      return;
    }
    const ok = await addMemberToGroup(selectedGroup.id, { userId: friendId });
    if (ok) {
      toast.success('Member added', { description: 'User has been added to the group.' });
    } else {
      toast.error('Failed to add member');
    }
  }, [selectedGroup, addMemberToGroup]);

  const handlePromoteMember = useCallback(async (memberId: string) => {
    if (!selectedGroup) return;
    const ok = await promoteMember(selectedGroup.id, memberId);
    if (ok) toast.success('Member promoted', { description: 'Role updated to moderator.' });
    else toast.error('Failed to promote member');
  }, [selectedGroup, promoteMember]);

  const handleDemoteMember = useCallback(async (memberId: string) => {
    if (!selectedGroup) return;
    const ok = await demoteMember(selectedGroup.id, memberId);
    if (ok) toast.success('Member demoted', { description: 'Role updated to member.' });
    else toast.error('Failed to demote member');
  }, [selectedGroup, demoteMember]);

  const handleTransferAdmin = useCallback(async (memberId: string) => {
    if (!selectedGroup) return;
    const ok = await transferAdmin(selectedGroup.id, memberId);
    if (ok) toast.success('Admin transferred', { description: 'Admin role has been transferred.' });
    else toast.error('Failed to transfer admin');
  }, [selectedGroup, transferAdmin]);

  const handleLeaveGroup = useCallback(async () => {
    if (!selectedGroup) return;
    const ok = await leaveGroup(selectedGroup.id);
    if (ok) {
      toast.success('You left the group');
      setIsManageMembersOpen(false);
      setSelectedConversationId(null);
    } else {
      toast.error('Failed to leave group');
    }
  }, [selectedGroup, leaveGroup]);

  const handleKickMember = useCallback(async (memberId: string) => {
    if (!selectedGroup) return;
    const ok = await kickMember(selectedGroup.id, memberId);
    if (ok) toast.success('Member kicked from group');
    else toast.error('Failed to kick member');
  }, [selectedGroup, kickMember]);

  const handleAnswerIncomingCall = useCallback(() => {
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
  }, [incomingCall, groups]);

  const handleDeclineIncomingCall = useCallback(() => {
    if (!incomingCall) return;
    void sendVideoSignal(incomingCall.callType, incomingCall.toConversationId, {
      type: 'decline',
      roomId: incomingCall.roomId,
      callType: incomingCall.callType,
      fromUserId: userId,
      fromUserName: userName,
      toConversationId: incomingCall.toConversationId,
      createdAt: new Date().toISOString(),
    });
    setIncomingCall(null);
  }, [incomingCall, sendVideoSignal, userId, userName]);

  const handleEndVideoCall = useCallback(() => {
    setVideoCallState((prev) => {
      if (prev.open && prev.type === 'direct' && selectedConversationId && selectedConversationType === 'direct') {
        void sendVideoSignal('direct', selectedConversationId, {
          type: 'end',
          roomId: prev.roomId,
          callType: 'direct',
          fromUserId: userId,
          fromUserName: userName,
          toConversationId: selectedConversationId,
          createdAt: new Date().toISOString(),
        });
      }
      return { ...prev, open: false };
    });
  }, [selectedConversationId, selectedConversationType, sendVideoSignal, userId, userName]);

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

        if (callSignal.type === 'invite' && callSignal.callType === 'direct' && callSignal.fromUserId !== userId) {
          setIncomingCall(callSignal);
        }
        if (callSignal.type === 'decline' && callSignal.callType === 'direct' && callSignal.fromUserId !== userId) {
          toast.info(`${callSignal.fromUserName} declined the call`);
          setVideoCallState((prev) => ({ ...prev, open: false }));
        }
        if (callSignal.type === 'end' && callSignal.callType === 'direct' && callSignal.fromUserId !== userId) {
          toast.info(`${callSignal.fromUserName} ended the call`);
          setVideoCallState((prev) => ({ ...prev, open: false }));
        }
        return;
      }

      const directPeerId =
        message.senderId === userId
          ? (message.recipientId ?? message.directMessageUserId)
          : message.senderId;
      const isDirectMessage = Boolean(message.recipientId || message.directMessageUserId);
      if (isDirectMessage && directPeerId && message.senderId !== userId) {
        const isActiveDirect =
          selectedConversationType === 'direct' && selectedConversationId === directPeerId;
        if (isActiveDirect) {
          void markDirectMessagesAsRead(directPeerId);
        } else {
          void refreshUnreadDirectCounts();
        }
      }

      if (!selectedConversationId) return;
      const isRelevant =
        (selectedConversationType === 'group' && message.groupId === selectedConversationId) ||
        (selectedConversationType === 'direct' && (
          message.directMessageUserId === selectedConversationId ||
          message.recipientId === selectedConversationId ||
          message.senderId === selectedConversationId
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
    };

    return onMessage(handleNewMessage);
  }, [
    selectedConversationId,
    selectedConversationType,
    onMessage,
    userId,
    refreshUnreadDirectCounts,
    markDirectMessagesAsRead,
  ]);

  return (
    <div className="h-[calc(100vh-2rem)] flex gap-4 p-4 overflow-hidden">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 flex flex-col bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-sm overflow-hidden"
      >
        {/* User Code Section */}
        <div className="p-4 border-b border-border/40 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Your Friend Code</h3>
              {isConnected && (
                <Badge variant="outline" className="gap-1 text-xs border-green-500/30 bg-green-500/10 text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Dialog open={isAddFriendOpen} onOpenChange={setIsAddFriendOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>
                      Enter your friend's unique code to send them a friend request.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="friendCode" className="text-right">Code</Label>
                      <Input
                        id="friendCode"
                        value={friendCode}
                        onChange={(e) => setFriendCode(e.target.value)}
                        placeholder="Enter friend code"
                        className="col-span-3 font-mono"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddFriend(); }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddFriend} disabled={!friendCode.trim()}>
                      Send Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-2.5">
            <code className="flex-1 text-sm font-mono font-semibold tracking-wide">{userCode}</code>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-md hover:bg-background"
              onClick={handleCopyCode}
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Friend Requests Banner */}
        <AnimatePresence>
          {friendRequests.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden shrink-0"
            >
              <div className="px-4 py-2 border-b border-border/40 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Friend Requests
                    </span>
                    <Badge className="h-4 px-1.5 text-[10px]">{friendRequests.length}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {friendRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border/50 shrink-0">
                        <AvatarImage src={request.sender?.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                          {request.sender?.name?.substring(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium truncate text-xs">{request.sender?.name || 'Unknown'}</div>
                        <div className="text-[10px] text-muted-foreground truncate font-mono">{request.sender?.userCode}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-green-500/10 hover:text-green-500"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <Plus className="h-3 w-3 rotate-45" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Header */}
        <div className="px-4 pt-3 pb-2 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
            {activeTab === 'groups' && (
              <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a study group to collaborate with your peers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Name</Label>
                      <Input
                        id="name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="e.g. CS101 Study Group"
                        className="col-span-3"
                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateGroup(); }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateGroup} disabled={!newGroupName.trim()}>Create Group</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('groups')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md transition-all",
                activeTab === 'groups'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md transition-all",
                activeTab === 'friends'
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-3.5 w-3.5" />
              Direct
              {friends.length > 0 && (
                <span className="text-[10px] text-muted-foreground">({friends.length})</span>
              )}
            </button>
          </div>

          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'groups' ? "Search groups..." : "Search friends..."}
              className="pl-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {activeTab === 'groups' ? (
              filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No groups found</div>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedConversationId === group.id && selectedConversationType === 'group'
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-secondary/50 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarFallback className={cn(
                        "text-xs font-medium",
                        selectedConversationId === group.id && selectedConversationType === 'group'
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {group.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.members?.length || 0} members
                      </div>
                    </div>
                  </button>
                ))
              )
            ) : (
              filteredFriends.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-muted-foreground text-sm">No friends yet</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-xs"
                    onClick={() => setIsAddFriendOpen(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add a friend
                  </Button>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200",
                      selectedConversationId === friend.id && selectedConversationType === 'direct'
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-secondary/50 text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <Avatar className="h-10 w-10 border border-border/50">
                      <AvatarImage src={friend.avatarUrl} />
                      <AvatarFallback className={cn(
                        "text-xs font-medium",
                        selectedConversationId === friend.id && selectedConversationType === 'direct'
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {friend.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium truncate flex items-center gap-2">
                        <span className="truncate">{friend.name}</span>
                        {(unreadDirectCounts[friend.id] ?? 0) > 0 && (
                          <Badge className="h-5 min-w-5 px-1.5 rounded-full text-[10px]">
                            {unreadDirectCounts[friend.id]}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono">{friend.userCode}</div>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        </ScrollArea>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex flex-col bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl shadow-sm overflow-hidden relative"
      >
        {activeName ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-background/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/50">
                  <AvatarImage src={selectedConversationType === 'direct' ? selectedFriend?.avatarUrl : undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {activeName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg leading-none">{activeName}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {selectedConversationType === 'group' ? (
                      <>
                        <Users className="h-3 w-3" />
                        {selectedGroup?.members?.length || 0} members
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                        Direct Message
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConversationType === 'group' && activeGroupCall && (
                  <Badge variant="outline" className="border-green-500/40 bg-green-500/10 text-green-500">
                    Live Call
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size={selectedConversationType === 'group' ? 'sm' : 'icon'}
                  className={cn(
                    'text-muted-foreground hover:text-foreground',
                    selectedConversationType === 'group' && 'gap-2'
                  )}
                  aria-label={
                    selectedConversationType === 'group'
                      ? (activeGroupCall ? 'Join group video call' : 'Start group video call')
                      : 'Start direct video call'
                  }
                  title={
                    selectedConversationType === 'group'
                      ? (activeGroupCall ? 'Join Group Video Call' : 'Start Group Video Call')
                      : 'Direct Video Call'
                  }
                  onClick={handleStartVideoCall}
                >
                  <Video className="h-5 w-5" />
                  {selectedConversationType === 'group' && (
                    <span className="text-xs">{activeGroupCall ? 'Join' : 'Start'}</span>
                  )}
                </Button>
                {selectedConversationType === 'group' && (
                  <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Users className="h-5 w-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[560px]">
                      <DialogHeader>
                        <DialogTitle>Manage Members</DialogTitle>
                        <DialogDescription>
                          Add members and manage roles in this group.
                        </DialogDescription>
                      </DialogHeader>

                      {selectedGroup && (
                        <div className="space-y-4">
                          {canManageMembers ? (
                            <div className="space-y-2">
                              <Label>Add from Friend List</Label>
                              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                {addableFriends.length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    All friends are already in this group.
                                  </p>
                                ) : (
                                  addableFriends.map((friend) => (
                                    <div
                                      key={friend.id}
                                      className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                                    >
                                      <div className="min-w-0">
                                        <p className="font-medium truncate">{friend.name}</p>
                                        <p className="text-xs text-muted-foreground font-mono truncate">{friend.userCode}</p>
                                      </div>
                                      <Button size="sm" onClick={() => handleAddFriendToSelectedGroup(friend.id)}>
                                        Add
                                      </Button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              You do not have permission to add members.
                            </p>
                          )}

                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {selectedGroup.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{member.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">{member.role}</Badge>
                                  {canManageMembers && member.id !== userId && (
                                    <Button size="sm" variant="outline" onClick={() => handleKickMember(member.id)}>
                                      <UserMinus className="h-3.5 w-3.5 mr-1" />
                                      Kick
                                    </Button>
                                  )}
                                  {canChangeRoles && member.id !== userId && member.role === 'MEMBER' && (
                                    <Button size="sm" variant="outline" onClick={() => handlePromoteMember(member.id)}>
                                      Promote
                                    </Button>
                                  )}
                                  {canChangeRoles && member.id !== userId && member.role === 'MODERATOR' && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => handleDemoteMember(member.id)}>
                                        Demote
                                      </Button>
                                      <Button size="sm" onClick={() => handleTransferAdmin(member.id)}>
                                        Transfer Admin
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-border/50">
                            <Button variant="outline" className="w-full" onClick={handleLeaveGroup}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Group
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
              <ChatMessages
                messages={localMessages}
                currentUserId={userId}
                isLoading={chatLoading}
              />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/40 backdrop-blur-md border-t border-border/40">
              <ChatInput onSend={handleSendMessage} isLoading={chatLoading} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold tracking-tight">No Chat Selected</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Select a group or friend to start chatting, or create a new group.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { setActiveTab('groups'); setIsCreateGroupOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                New Group
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('friends')} className="gap-2">
                <User className="h-4 w-4" />
                Direct Message
              </Button>
            </div>
          </div>
        )}
      </motion.div>
      <VideoCallOverlay
        open={videoCallState.open}
        callType={videoCallState.type}
        roomId={videoCallState.roomId}
        title={videoCallState.title}
        currentUserId={userId}
        currentUserName={userName}
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
    </div>
  );
}
