import { useState, useCallback, useEffect } from 'react';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import type {
  Friend,
  FriendRequest,
  Group,
  GroupMember,
  CreateGroupRequest,
  AddMemberRequest,
  RequestFriendRequest,
  SearchUsersRequest,
} from '@/lib/types';

interface UseSocialReturn {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  groups: Group[];
  loading: boolean;
  error: string | null;
  searchUsers: (request: SearchUsersRequest) => Promise<Friend[]>;
  requestFriend: (request: RequestFriendRequest) => Promise<FriendRequest | null>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendId: string) => Promise<boolean>;
  createGroup: (request: CreateGroupRequest) => Promise<Group | null>;
  addMemberToGroup: (groupId: string, request: AddMemberRequest) => Promise<boolean>;
  leaveGroup: (groupId: string) => Promise<boolean>;
  kickMember: (groupId: string, memberId: string) => Promise<boolean>;
  promoteMember: (groupId: string, memberId: string) => Promise<boolean>;
  demoteMember: (groupId: string, memberId: string) => Promise<boolean>;
  transferAdmin: (groupId: string, targetUserId: string) => Promise<boolean>;
  refreshFriends: () => Promise<void>;
  refreshFriendRequests: () => Promise<void>;
  refreshSentRequests: () => Promise<void>;
  refreshGroups: () => Promise<void>;
}

export function useSocial(): UseSocialReturn {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFriends = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Friend[]>(API_CONFIG.ENDPOINTS.SOCIAL.GET_FRIENDS);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friends');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshFriendRequests = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<FriendRequest[]>(
        API_CONFIG.ENDPOINTS.SOCIAL.GET_FRIEND_REQUESTS
      );
      setFriendRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch friend requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSentRequests = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<FriendRequest[]>(
        API_CONFIG.ENDPOINTS.SOCIAL.GET_SENT_REQUESTS
      );
      setSentRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sent requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGroups = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Group[]>(API_CONFIG.ENDPOINTS.SOCIAL.GET_GROUPS);
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFriends();
    refreshFriendRequests();
    refreshSentRequests();
    refreshGroups();
  }, [refreshFriends, refreshFriendRequests, refreshSentRequests, refreshGroups]);

  const searchUsers = useCallback(async (request: SearchUsersRequest) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (request.email) {
        endpoint = API_CONFIG.ENDPOINTS.SOCIAL.SEARCH_USERS;
        const data = await apiClient.post<Friend[]>(endpoint, { email: request.email });
        return data;
      } else if (request.name) {
        endpoint = API_CONFIG.ENDPOINTS.SOCIAL.SEARCH_USERS_BY_NAME;
        const data = await apiClient.post<Friend[]>(endpoint, { name: request.name });
        return data;
      } else if (request.id) {
        endpoint = API_CONFIG.ENDPOINTS.SOCIAL.SEARCH_USERS_BY_ID;
        const data = await apiClient.post<Friend[]>(endpoint, { id: request.id });
        return data;
      }
      return [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const requestFriend = useCallback(async (request: RequestFriendRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.post<FriendRequest | { ok: boolean; autoAccepted: boolean }>(
        API_CONFIG.ENDPOINTS.SOCIAL.REQUEST_FRIEND,
        request
      );
      
      // If auto-accepted, refresh friends
      if ((result as any).autoAccepted) {
        await refreshFriends();
        return null;
      }
      
      await refreshSentRequests();
      return result as FriendRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshFriends, refreshSentRequests]);

  const acceptRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(API_CONFIG.ENDPOINTS.SOCIAL.ACCEPT_REQUEST(requestId));
      await refreshFriendRequests();
      await refreshFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshFriendRequests, refreshFriends]);

  const rejectRequest = useCallback(async (requestId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(API_CONFIG.ENDPOINTS.SOCIAL.REJECT_REQUEST(requestId));
      await refreshFriendRequests();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshFriendRequests]);

  const removeFriend = useCallback(async (friendId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete<{ message: string }>(API_CONFIG.ENDPOINTS.SOCIAL.REMOVE_FRIEND(friendId));
      await refreshFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove friend');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshFriends]);

  const createGroup = useCallback(async (request: CreateGroupRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newGroup = await apiClient.post<Group>(API_CONFIG.ENDPOINTS.SOCIAL.CREATE_GROUP, request);
      await refreshGroups();
      return newGroup;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
      return null;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const addMemberToGroup = useCallback(async (groupId: string, request: AddMemberRequest) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(
        API_CONFIG.ENDPOINTS.SOCIAL.ADD_MEMBER(groupId),
        request
      );
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const promoteMember = useCallback(async (groupId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(
        API_CONFIG.ENDPOINTS.SOCIAL.PROMOTE_MEMBER(groupId, memberId)
      );
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to promote member');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const leaveGroup = useCallback(async (groupId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(API_CONFIG.ENDPOINTS.SOCIAL.LEAVE_GROUP(groupId));
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const kickMember = useCallback(async (groupId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(API_CONFIG.ENDPOINTS.SOCIAL.KICK_MEMBER(groupId, memberId));
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to kick member');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const demoteMember = useCallback(async (groupId: string, memberId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(
        API_CONFIG.ENDPOINTS.SOCIAL.DEMOTE_MEMBER(groupId, memberId)
      );
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to demote member');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  const transferAdmin = useCallback(async (groupId: string, targetUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post<{ ok: boolean }>(
        API_CONFIG.ENDPOINTS.SOCIAL.TRANSFER_ADMIN(groupId),
        { targetUserId }
      );
      await refreshGroups();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer admin');
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshGroups]);

  return {
    friends,
    friendRequests,
    sentRequests,
    groups,
    loading,
    error,
    searchUsers,
    requestFriend,
    acceptRequest,
    rejectRequest,
    removeFriend,
    createGroup,
    addMemberToGroup,
    leaveGroup,
    kickMember,
    promoteMember,
    demoteMember,
    transferAdmin,
    refreshFriends,
    refreshFriendRequests,
    refreshSentRequests,
    refreshGroups,
  };
}
