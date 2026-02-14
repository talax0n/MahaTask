# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MahaTask** is an academic task management dashboard frontend built with Next.js 16 and React 19. This is a **client-only application** that communicates with a separate NestJS backend API (located in `../backend`). The frontend provides task management, scheduling, study group chat, and social features for students.

## Development Commands

```bash
# Development
pnpm run dev          # Start development server with Turbo mode (default port 3000)

# Building
pnpm run build        # Create production build
pnpm run start        # Run production build

# Code Quality
pnpm run lint         # Run ESLint

# Note: The backend API server must be running separately for this frontend to function
```

## Architecture

### Backend Integration Pattern

This frontend is **NOT a standalone application** - it requires the NestJS backend API to be running:

- **Backend Location**: `../backend` directory (sibling to this frontend)
- **Backend URL**: Configured via `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:3000`)
- **Authentication**: JWT tokens stored in localStorage, automatically injected into requests via axios interceptors
- **API Client**: Located in `lib/api-client.ts` - uses axios with request/response interceptors
- **API Configuration**: All endpoint definitions in `lib/api-config.ts`
- **Type Definitions**: Backend API types defined in `lib/types.ts` (must match backend schema)

**Important**: When making API-related changes:
1. Check if the backend API contract has changed
2. Update types in `lib/types.ts` if backend response shapes change
3. Update endpoint paths in `lib/api-config.ts` if routes change
4. The axios instance automatically adds `Authorization: Bearer {token}` to all requests

### State Management Pattern

This codebase uses **custom React hooks** for state management (no Redux, Zustand, or Context API):

- `hooks/use-auth.ts` - Authentication state and operations (login, register, logout, token management)
- `hooks/use-tasks.ts` - Task CRUD operations and state
- `hooks/use-schedule.ts` - Schedule/calendar operations and state
- `hooks/use-chat.ts` - Chat messaging state
- `hooks/use-social.ts` - Friends, groups, and social features

Each hook encapsulates API calls, loading states, error handling, and local state. When adding features:
- Follow the existing hook pattern (loading, error, data state)
- Use `useCallback` for functions to prevent unnecessary re-renders
- Handle errors from API calls and set appropriate error messages

### Component Architecture

The app uses **shadcn/ui** components built on Radix UI primitives:

- **UI Components**: `components/ui/` - shadcn/ui components (accordion, button, dialog, etc.)
- **Feature Components**: `components/` - Application-specific components (task-list, chat-system, scheduler, etc.)
- **Layout**: `components/sidebar.tsx` and `app/layout.tsx` - Main application shell with collapsible sidebar
- **Pages**: `app/` directory using Next.js App Router

**shadcn/ui Configuration** (`components.json`):
- Style: default
- Base color: neutral
- CSS variables: enabled
- Path aliases: `@/` maps to root directory
- Icon library: lucide-react

When adding new shadcn/ui components:
```bash
npx shadcn@latest add <component-name>
```

### Routing Structure

```
/                    → Redirects to /tasks (see app/page.tsx)
/tasks               → Task management page
/scheduler           → Calendar and schedule management
/chat                → Study group chat interface
/settings            → User settings and preferences
```

All routes use the shared sidebar layout from `components/sidebar.tsx` wrapped in `app/layout.tsx`.

### TypeScript Configuration

- **Strict mode enabled** - all code must be properly typed
- **Path aliases**: `@/` resolves to project root (configured in `tsconfig.json` and `components.json`)
- **Target**: ES6 with modern React JSX transform
- **Module resolution**: bundler mode (Next.js default)

When importing:
```typescript
import { Button } from '@/components/ui/button'       // UI component
import { useAuth } from '@/hooks/use-auth'            // Custom hook
import { apiClient } from '@/lib/api-client'          // API utilities
import type { Task } from '@/lib/types'               // Type definitions
```

### Styling Approach

- **Tailwind CSS** with dark theme as default
- **Dark mode**: Forced via `className="dark"` in root layout (not toggleable currently)
- **Design tokens**: CSS variables defined in `app/globals.css`
- **Color system**: Neutral base with primary (blue #3B82F6) and accent (cyan) colors
- **Responsive**: Mobile-first with sidebar collapsing on small screens

## Key Implementation Patterns

### Authentication Flow

1. User logs in via `useAuth().login()` → API returns `{ access_token, user }`
2. Token stored in localStorage via `setToken()`
3. Axios interceptor automatically adds token to all subsequent requests
4. On 401 responses, token is cleared and user redirected to login
5. `useAuth` hook checks for existing token on mount and fetches user data

### API Request Pattern

```typescript
// Use the apiClient helper
import { apiClient } from '@/lib/api-client'
import { API_CONFIG } from '@/lib/api-config'

// GET request
const tasks = await apiClient.get<Task[]>(API_CONFIG.ENDPOINTS.TASKS.GET_ALL)

// POST request
const newTask = await apiClient.post<Task>(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData)

// Error handling is done in axios interceptor - errors are thrown as Error objects
```

### Custom Hook Pattern

```typescript
export function useFeature() {
  const [data, setData] = useState<DataType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiClient.get<DataType>('/endpoint')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchData }
}
```

## Important Files and Their Purposes

### Core Configuration
- `lib/api-client.ts` - Axios instance with auth interceptors
- `lib/api-config.ts` - All backend API endpoint definitions
- `lib/types.ts` - TypeScript interfaces matching backend API
- `lib/utils.ts` - Tailwind class merging utility (cn function)

### Layout and Navigation
- `app/layout.tsx` - Root layout with dark theme and sidebar provider
- `components/sidebar.tsx` - Main navigation sidebar with collapse functionality
- `app/page.tsx` - Root page that redirects to /tasks

### Features
- `components/task-management.tsx` - Main task management interface
- `components/scheduler.tsx` - Calendar and scheduling interface
- `components/chat-system.tsx` - Study group chat interface

### Database (Legacy/Demo)
- `lib/db.ts` - SQLite database utilities (appears to be legacy code or demo mode)
- Note: Main application flow uses backend API, not this local database

## Common Development Tasks

### Adding a New Feature Page

1. Create page in `app/new-feature/page.tsx`
2. Add route to sidebar in `components/sidebar.tsx` navItems array
3. Create feature component in `components/new-feature.tsx`
4. Create custom hook in `hooks/use-new-feature.ts` if API integration needed
5. Add API endpoints to `lib/api-config.ts` if needed
6. Add types to `lib/types.ts` if needed

### Adding a New API Endpoint

1. Add endpoint path to `lib/api-config.ts` in appropriate section
2. Add request/response types to `lib/types.ts`
3. Use in custom hook or component via `apiClient.get/post/patch/delete()`

### Adding a New shadcn/ui Component

```bash
npx shadcn@latest add button  # Example: adding button component
```

This will:
- Download component to `components/ui/`
- Add necessary dependencies to package.json
- Configure component with project's theme settings

## Environment Variables

Create `.env.local` (or copy from `.env.example`):

```bash
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Critical**: The backend API server must be running at this URL for the frontend to work.

## Dependencies and Tools

### Core Framework
- Next.js 16 with App Router
- React 19 with TypeScript

### UI and Styling
- shadcn/ui components (Radix UI primitives)
- Tailwind CSS v4 (@tailwindcss/postcss)
- Lucide React icons
- Framer Motion for animations

### Data and Forms
- axios for API requests
- React Hook Form with Zod validation
- date-fns for date manipulation

### Database (Demo/Offline)
- better-sqlite3 (appears to be for demo/offline mode)

## Git Workflow Notes

Based on git status, this is an active development repository. Current branch: `main`

When committing changes:
- Follow conventional commit format if established
- Ensure backend compatibility before committing API contract changes
- Test authentication flows if modifying auth-related code
- Verify responsive design on mobile if modifying layout components
