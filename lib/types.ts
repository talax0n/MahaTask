// Backend API Types matching the NestJS backend

// Auth Types
export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    userCode: string;
    bio?: string;
    avatarUrl?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  userCode: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateUserRequest {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

// Task Types
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progress: number;
  dueDate?: string;
  scheduleId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  deadline?: string;
  scheduleId?: string;
  groupId?: string;
}

export interface UpdateTaskStatusRequest {
  status: 'IN_PROGRESS' | 'DONE';
}

export interface UpdateTaskProgressRequest {
  progress: number;
}

// Schedule Types
export type ScheduleType = 'STUDY' | 'EXAM' | 'ASSIGNMENT' | 'MEETING' | 'OTHER';
export type ScheduleColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE' | 'ORANGE';
export type ScheduleImportance = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  startTime: string;
  endTime: string;
  type: ScheduleType;
  color: ScheduleColor;
  importance: ScheduleImportance;
  progress: number;
  description?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  title: string;
  startTime: string;
  endTime: string;
  type?: ScheduleType;
  color?: ScheduleColor;
  importance?: ScheduleImportance;
  description?: string;
  groupId?: string;
  taskIds?: string[];
}

export interface UpdateScheduleRequest {
  title?: string;
  startTime?: string;
  endTime?: string;
  type?: ScheduleType;
  color?: ScheduleColor;
  importance?: ScheduleImportance;
  progress?: number;
  description?: string;
  taskIds?: string[];
}

export interface CheckConflictsRequest {
  startTime: string;
  endTime: string;
}

export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflicts: Schedule[];
}

// Chat Types
export interface Message {
  id: string;
  senderId: string;
  content: string;
  groupId?: string;
  directMessageUserId?: string;
  recipientId?: string; // Backend DM field (alias for directMessageUserId)
  readAt?: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

// Social Types
export interface Friend {
  id: string;
  name: string;
  userCode: string;
  bio?: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  sender?: Friend;
  receiver?: Friend;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  canCreateSchedule: boolean;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
}

export interface AddMemberRequest {
  userId?: string;
  userCode?: string;
  canCreateSchedule?: boolean;
}

export interface RequestFriendRequest {
  userCode?: string;
  friendId?: string;
}

export interface SearchUsersRequest {
  email?: string;
  name?: string;
  id?: string;
}
