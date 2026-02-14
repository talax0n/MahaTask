# Backend API Integration - Summary of Changes

This document summarizes all changes made to configure the frontend to use the NestJS backend API.

## New Files Created

### Configuration & Utilities

1. **[`lib/api-config.ts`](lib/api-config.ts)**
   - Centralized API configuration
   - Base URL for backend API
   - All API endpoint definitions
   - Helper function to construct full URLs

2. **[`lib/api-client.ts`](lib/api-client.ts)**
   - Axios-based HTTP client
   - JWT token management
   - Request/response interceptors
   - Convenience methods for all HTTP operations
   - Automatic error handling

3. **[`lib/types.ts`](lib/types.ts)**
   - TypeScript interfaces matching backend DTOs
   - Type definitions for all API requests/responses
   - Ensures type safety across the application

### Custom Hooks

4. **[`hooks/use-auth.ts`](hooks/use-auth.ts)**
   - Authentication management
   - Login and register functionality
   - User profile management
   - Token storage and retrieval
   - Auto-refresh user data

5. **[`hooks/use-tasks-backend.ts`](hooks/use-tasks-backend.ts)**
   - Task management using backend API
   - Create, update, delete tasks
   - Update task status and progress
   - Automatic token authentication

6. **[`hooks/use-schedule-backend.ts`](hooks/use-schedule-backend.ts)**
   - Schedule management using backend API
   - Create, update, delete schedules
   - Conflict checking
   - Automatic token authentication

7. **[`hooks/use-chat-backend.ts`](hooks/use-chat-backend.ts)**
   - Chat message fetching
   - Group and direct message support
   - Note: Real-time messaging requires WebSocket

8. **[`hooks/use-social.ts`](hooks/use-social.ts)**
   - Social features management
   - Friend management (add, remove, search)
   - Friend request handling
   - Group management (create, add members)
   - All with automatic authentication

### Documentation

9. **[`BACKEND_API_SETUP.md`](BACKEND_API_SETUP.md)**
   - Comprehensive setup guide
   - Architecture overview
   - API documentation
   - Migration guide
   - Troubleshooting tips

10. **[`.env.example`](.env.example)**
    - Environment variable template
    - Backend API URL configuration

## Modified Files

### API Routes (Updated to proxy to backend)

1. **[`app/api/tasks/route.ts`](app/api/tasks/route.ts)**
   - Changed from local database to backend API
   - Added JWT token forwarding
   - Error handling for backend responses

2. **[`app/api/tasks/[id]/route.ts`](app/api/tasks/[id]/route.ts)**
   - Changed from local database to backend API
   - Added support for status and progress updates
   - Added JWT token forwarding

3. **[`app/api/schedule/route.ts`](app/api/schedule/route.ts)**
   - Changed from local database to backend API
   - Added JWT token forwarding
   - Simplified to match backend endpoints

4. **[`app/api/chat/route.ts`](app/api/chat/route.ts)**
   - Changed from local database to backend API
   - Updated to fetch group and direct messages
   - Added JWT token forwarding

5. **[`app/api/chat/messages/route.ts`](app/api/chat/messages/route.ts)**
   - Changed from local database to backend API
   - Updated to fetch group and direct messages
   - Added JWT token forwarding

## Key Features

### Authentication
- JWT-based authentication
- Automatic token injection via Axios interceptors
- Token storage in localStorage
- Auto-refresh user data on mount

### Error Handling
- Centralized error handling in API client
- User-friendly error messages
- Automatic token cleanup on 401 errors

### Type Safety
- Full TypeScript support
- Type definitions matching backend DTOs
- Compile-time error checking

### Convenience Methods
- Simplified API calls via hooks
- Automatic state management
- Built-in loading states
- Error state handling

## Migration Path

### For Existing Components

1. **Replace hook imports**:
   ```typescript
   // Old
   import { useTasks } from '@/hooks/use-tasks';
   
   // New
   import { useTasks } from '@/hooks/use-tasks-backend';
   ```

2. **Remove userId parameters**:
   - Authentication is handled automatically
   - No need to pass userId to hooks

3. **Update data structures**:
   - Backend uses camelCase (e.g., `userId`, `dueDate`)
   - Backend enums are uppercase (e.g., `'LOW'`, `'MEDIUM'`, `'HIGH'`)

4. **Add authentication check**:
   ```typescript
   import { useAuth } from '@/hooks/use-auth';
   
   function MyComponent() {
     const { isAuthenticated } = useAuth();
     
     if (!isAuthenticated) {
       return <LoginPage />;
     }
     
     return <Dashboard />;
   }
   ```

## Dependencies

### Required
- `axios` - HTTP client library
- `@types/axios` - TypeScript definitions

### Installation
```bash
npm install axios
npm install -D @types/axios
```

## Environment Variables

### Required
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Optional
```bash
# If backend runs on different port
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Backend API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update user profile
- `POST /users/me/avatar` - Upload avatar

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create task
- `PATCH /tasks/:id/status` - Update task status
- `PATCH /tasks/:id/progress` - Update task progress
- `DELETE /tasks/:id` - Delete task

### Schedules
- `GET /schedules` - Get all schedules
- `POST /schedules` - Create schedule
- `PATCH /schedules/:id` - Update schedule
- `DELETE /schedules/:id` - Delete schedule
- `POST /schedules/conflicts` - Check for conflicts

### Chat
- `GET /chat/group/:groupId` - Get group messages
- `GET /chat/dm/:userId` - Get direct messages

### Social
- `GET /social/friends` - Get friends
- `POST /social/friends/search` - Search by email
- `POST /social/friends/search-name` - Search by name
- `POST /social/friends/search-id` - Search by ID
- `POST /social/friends/request` - Send friend request
- `GET /social/friends/requests` - Get received requests
- `GET /social/friends/requests/sent` - Get sent requests
- `POST /social/friends/requests/:id/accept` - Accept request
- `POST /social/friends/requests/:id/reject` - Reject request
- `DELETE /social/friends/:friendId` - Remove friend
- `GET /social/groups` - Get groups
- `POST /social/groups` - Create group
- `POST /social/groups/:groupId/members` - Add member to group

## Next Steps

1. **Install axios**: `npm install axios`
2. **Configure environment**: Copy `.env.example` to `.env.local`
3. **Start backend**: `cd backend && npm run start:dev`
4. **Update components**: Replace old hooks with new backend hooks
5. **Test functionality**: Verify all features work with backend

## Notes

- The old hooks ([`use-tasks.ts`](hooks/use-tasks.ts), [`use-schedule.ts`](hooks/use-schedule.ts), [`use-chat.ts`](hooks/use-chat.ts)) are still available for backward compatibility
- The frontend API routes act as proxies to maintain compatibility with existing code
- Real-time chat features require WebSocket implementation (not included in this setup)
- All backend endpoints require authentication except for `/auth/register` and `/auth/login`

## Support

For issues or questions:
1. Check [`BACKEND_API_SETUP.md`](BACKEND_API_SETUP.md) for detailed setup instructions
2. Review backend API documentation at `http://localhost:3000/api`
3. Verify backend server is running
4. Check environment variables are set correctly
