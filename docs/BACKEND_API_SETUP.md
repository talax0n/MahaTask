# Backend API Integration Guide

This document explains how the frontend is configured to use the NestJS backend API endpoints.

## Overview

The frontend communicates directly with your NestJS backend using the axios client. All API calls go through the backend server, which handles authentication, data persistence, and business logic. The custom hooks use the configured axios client to make HTTP requests directly to the backend endpoints.

## Architecture

### API Configuration

- **Configuration File**: [`lib/api-config.ts`](lib/api-config.ts)
  - Contains the base URL for the backend API
  - Defines all API endpoints
  - Can be customized via environment variable `NEXT_PUBLIC_API_URL`

### API Client

- **Client File**: [`lib/api-client.ts`](lib/api-client.ts)
  - Uses Axios for HTTP requests to the backend
  - Manages JWT token authentication via interceptors
  - Provides convenience methods (get, post, patch, delete, put)
  - Automatically handles error responses and token injection

### Type Definitions

- **Types File**: [`lib/types.ts`](lib/types.ts)
  - TypeScript interfaces matching backend DTOs
  - Ensures type safety across the application

## Custom Hooks

New hooks have been created to interact with the backend API:

### Authentication Hook
- **File**: [`hooks/use-auth.ts`](hooks/use-auth.ts)
- **Features**:
  - Login and register
  - User profile management
  - Token management
  - Auto-refresh user data

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  // Use the hook
}
```

### Tasks Hook
- **File**: [`hooks/use-tasks.ts`](hooks/use-tasks.ts)
- **Features**:
  - Fetch all tasks
  - Create tasks
  - Update task status and progress
  - Delete tasks

```typescript
import { useTasks } from '@/hooks/use-tasks-backend';

function TaskManager() {
  const { tasks, createTask, updateStatus, deleteTask } = useTasks();
  
  // Use the hook
}
```

### Schedules Hook
- **File**: [`hooks/use-schedule.ts`](hooks/use-schedule.ts)
- **Features**:
  - Fetch all schedules
  - Create schedules
  - Update schedules
  - Delete schedules
  - Check for conflicts

```typescript
import { useSchedule } from '@/hooks/use-schedule-backend';

function ScheduleManager() {
  const { schedules, createSchedule, updateSchedule, checkConflicts } = useSchedule();
  
  // Use the hook
}
```

### Chat Hook
- **File**: [`hooks/use-chat.ts`](hooks/use-chat.ts)
- **Features**:
  - Load group messages
  - Load direct messages
  - Note: Real-time messaging requires WebSocket connection

```typescript
import { useChat } from '@/hooks/use-chat-backend';

function ChatComponent() {
  const { messages, loadGroupMessages, loadDirectMessages } = useChat();
  
  // Use the hook
}
```

### Social Hook
- **File**: [`hooks/use-social.ts`](hooks/use-social.ts)
- **Features**:
  - Manage friends
  - Send and accept friend requests
  - Create and manage groups
  - Search for users

```typescript
import { useSocial } from '@/hooks/use-social';

function SocialComponent() {
  const { friends, groups, searchUsers, requestFriend, createGroup } = useSocial();
  
  // Use the hook
}
```

## Setup Instructions

### 1. Install Dependencies

Install axios for HTTP requests:

```bash
cd frontend
npm install axios
```

### 2. Configure Environment Variables

Create a `.env.local` file in the frontend directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Or copy the example file:

```bash
cp .env.example .env.local
```

### 3. Start the Backend Server

Make sure your NestJS backend is running:

```bash
cd backend
npm run start:dev
```

The backend should be running on `http://localhost:3000` (or the port configured in your backend).

### 4. Start the Frontend

Start the Next.js development server:

```bash
cd frontend
npm run dev
```

The frontend should now be able to communicate with the backend.

## Migration Guide

### Switching from Local Database to Backend

If you were using the old hooks that used the local database:

1. **Replace imports**:
   ```typescript
   // Import the hook (it already uses the axios client)
   import { useTasks } from '@/hooks/use-tasks';
   ```

2. **Update component logic**:
   - Remove `userId` parameters (authentication is handled automatically)
   - Update task data structure to match backend types
   - Use the new methods provided by the hooks

3. **Add authentication**:
   ```typescript
   import { useAuth } from '@/hooks/use-auth';
   
   function App() {
     const { isAuthenticated } = useAuth();
     
     if (!isAuthenticated) {
       return <LoginForm />;
     }
     
     return <Dashboard />;
   }
   ```

## Authentication Flow

1. **Login/Register**: User provides credentials → Backend validates → Returns JWT token
2. **Token Storage**: Token is stored in localStorage
3. **API Requests**: Token is automatically included in Authorization header
4. **Token Refresh**: User data is refreshed on component mount

## Data Format Differences

### Tasks

| Local Database | Backend |
|----------------|---------|
| `user_id` | `userId` |
| `due_date` | `dueDate` |
| `priority: 'low'|'medium'|'high'` | `priority: 'LOW'|'MEDIUM'|'HIGH'` |
| `status: 'pending'|'in-progress'|'completed'` | `status: 'TODO'|'IN_PROGRESS'|'DONE'` |

### Schedules

| Local Database | Backend |
|----------------|---------|
| `user_id` | `userId` |
| `start_time` | `startTime` |
| `end_time` | `endTime` |
| `type: string` | `type: 'STUDY'|'EXAM'|'ASSIGNMENT'|'MEETING'|'OTHER'` |
| `color: string` | `color: 'RED'|'BLUE'|'GREEN'|'YELLOW'|'PURPLE'|'ORANGE'` |

## Troubleshooting

### CORS Errors

If you see CORS errors:

1. Check that your backend CORS configuration includes your frontend URL
2. Backend CORS is configured in [`backend/src/main.ts`](../backend/src/main.ts)

```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

### 401 Unauthorized Errors

If you get 401 errors:

1. Make sure you're logged in
2. Check that the JWT token is valid
3. Verify the token is being sent in the Authorization header

### Connection Refused

If you can't connect to the backend:

1. Ensure the backend server is running
2. Check the port number matches your configuration
3. Verify `NEXT_PUBLIC_API_URL` is set correctly

## Next Steps

1. Update your components to use the new backend hooks
2. Implement login/register pages using `useAuth` hook
3. Add error handling for API failures
4. Implement loading states for better UX
5. Consider adding WebSocket support for real-time chat

## Additional Resources

- Backend API Documentation: http://localhost:3000/api (Swagger)
- Backend Source: [`../backend/`](../backend/)
- Frontend Source: [`./`](./)
