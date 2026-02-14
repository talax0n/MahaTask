# MahaTask Frontend

## Project Overview
This directory contains the **frontend** application for MahaTask, an academic task management dashboard. It is built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript**. The application features a modern dark-themed UI using **shadcn/ui** components and **Tailwind CSS**, with smooth animations powered by **Framer Motion**.

The frontend is designed to interact with a separate backend service (likely a NestJS application found in the sibling `backend` directory).

## Tech Stack
- **Framework:** Next.js 16.1.6 (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion
- **State Management:** React Hooks (`use-auth`, `use-tasks`, etc.)
- **HTTP Client:** Axios (via `lib/api-client.ts`)
- **Package Manager:** pnpm (recommended)

## Project Structure
```
frontend/
├── app/                 # Next.js App Router pages and layouts
│   ├── chat/            # Study group chat feature
│   ├── login/           # Authentication pages
│   ├── register/
│   ├── scheduler/       # Calendar and scheduling feature
│   ├── tasks/           # Task management feature
│   ├── layout.tsx       # Root layout (fonts, providers)
│   └── page.tsx         # Landing/Loading page
├── components/          # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── calendar-view.tsx
│   ├── task-form.tsx
│   ├── sidebar.tsx      # Main navigation sidebar
│   └── ...
├── hooks/               # Custom React hooks for logic and state
│   ├── use-auth.ts      # Authentication logic
│   ├── use-tasks.ts     # Task CRUD operations
│   └── ...
├── lib/                 # Utilities and configurations
│   ├── api-client.ts    # Axios instance and interceptors
│   ├── api-config.ts    # API endpoints and base URL
│   └── types.ts         # TypeScript interfaces (User, Task, etc.)
└── styles/              # Global styles
```

## Key Commands
- **Development Server:** `npm run dev` or `pnpm dev`
- **Build:** `npm run build` or `pnpm build`
- **Lint:** `npm run lint` or `pnpm lint`

## Architecture & Conventions
- **Client-Side Logic:** Most interactive components are marked with `'use client'`.
- **API Integration:**
  - All API calls are routed through `lib/api-client.ts`.
  - API endpoints are defined in `lib/api-config.ts`.
  - Data fetching and mutations are encapsulated in custom hooks (e.g., `hooks/use-tasks.ts`).
- **Styling:**
  - Uses standard Tailwind CSS utility classes.
  - Dark mode is the default, configured in `tailwind.config.ts` and `app/globals.css`.
  - Typography uses `Geist` and `Geist Mono` fonts via CSS variables.
- **Authentication:**
  - JWT-based authentication.
  - Tokens are managed in local storage via `lib/api-client.ts`.
  - `use-auth.ts` provides login/register/logout methods and user state.

## Configuration
- **Environment Variables:**
  - `NEXT_PUBLIC_API_URL`: Base URL for the backend API (defaults to `http://localhost:3000` in `lib/api-config.ts`, but likely needs to point to the backend server port).
