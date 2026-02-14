Project Overview
MahaTask is a comprehensive academic task management system with three core modules:

Task Management: CRUD operations with categories, progress tracking, dependencies, and collaboration
Scheduler: Multi-view calendar (month/week/day) with drag-and-drop, timeline view, and exam management
Chat System: Real-time group discussion for study groups and classes

Tech Stack: Next.js 15, shadcn/ui, Framer Motion, Tailwind CSS (dark theme)
Backend: Next.js API routes with in-memory storage (expandable to database)

Architecture Overview
1. Project Structure
/app
  /api
    /tasks (GET, POST, PUT, DELETE)
    /categories (GET, POST)
    /chat (GET, POST, WebSocket prep)
    /exams (GET, POST, PUT, DELETE)
  /dashboard
    /page.tsx (main dashboard layout)
    /tasks/page.tsx
    /scheduler/page.tsx
    /chat/page.tsx
  /components
    /ui (shadcn components)
    /dashboard
      /sidebar.tsx
      /header.tsx
      /navigation.tsx
    /tasks
      /task-list.tsx
      /task-card.tsx
      /task-form.tsx
      /task-filters.tsx
      /task-dependency-view.tsx
    /scheduler
      /calendar-header.tsx
      /month-view.tsx
      /week-view.tsx
      /day-view.tsx
      /timeline-gantt.tsx
      /drag-drop-handler.tsx
      /exam-manager.tsx
    /chat
      /chat-container.tsx
      /message-list.tsx
      /message-input.tsx
      /group-list.tsx
  /lib
    /api-client.ts (fetch wrapper)
    /data-store.ts (in-memory data management)
    /types.ts (TypeScript interfaces)
    /utils.ts (helpers)
    /animations.ts (Framer Motion presets)
  /hooks
    /useTasks.ts
    /useChat.ts
    /useScheduler.ts
    /useTaskDependencies.ts

2. Data Models
Task
{
  id: string
  title: string
  description: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  category: string (subject: Math, CS, Biology)
  assignedTo: string[] (user emails/IDs)
  dependencies: string[] (task IDs)
  createdAt: Date
  updatedAt: Date
}
Category
{
  id: string
  name: string (Math, CS, Biology)
  color: string
  icon: string
}
Exam
{
  id: string
  title: string
  date: Date
  duration: number (minutes)
  subject: string
  location: string
  prepTasks: string[] (task IDs)
  countdown: boolean
}
ChatMessage
{
  id: string
  groupId: string
  author: string
  content: string
  timestamp: Date
  attachments?: string[]
}
ChatGroup
{
  id: string
  name: string
  members: string[]
  description: string
  createdAt: Date
}
3. API Routes
Tasks

GET /api/tasks - Fetch all tasks (with optional filters)
POST /api/tasks - Create new task
PUT /api/tasks/[id] - Update task
DELETE /api/tasks/[id] - Delete task
GET /api/tasks/[id]/dependencies - Get task dependency tree

Categories

GET /api/categories - Fetch all categories
POST /api/categories - Create category

Exams

GET /api/exams - Fetch all exams
POST /api/exams - Create exam
PUT /api/exams/[id] - Update exam
DELETE /api/exams/[id] - Delete exam

Chat

GET /api/chat/groups - Fetch user's chat groups
POST /api/chat/groups - Create new group
GET /api/chat/groups/[id]/messages - Fetch messages in group
POST /api/chat/groups/[id]/messages - Send message

4. Key Features & Implementation
Task Management

 Task CRUD with form validation
 Category system with color coding
 Progress indicators (pending → in-progress → completed)
 Task dependency visualization (graph/tree view)
 Assignment to multiple users
 Filter/sort by category, priority, due date, assignee

Scheduler

 Month view with task count badges
 Week view with day columns
 Day view with time slots (hourly)
 Drag-and-drop task rescheduling
 Gantt timeline for deadline visualization
 Exam countdown widget
 Exam prep checklist

Chat System

 Group chat rooms for study groups/classes
 Real-time message display (polling initially, WebSocket ready)
 User mention support (@classmate)
 Message timestamps
 Group member list
 Create/join chat groups

Dark Theme & Animations

 Dark theme using Tailwind (slate/dark palette)
 Framer Motion for:

Smooth page transitions
Task list item animations (stagger)
Modal/form slide-ins
Hover effects on cards
Loading skeletons
Notification toasts


 Responsive design (mobile, tablet, desktop)

5. Component Breakdown
Layout Components

Sidebar: Navigation between Tasks, Scheduler, Chat; collapsed state
Header: App title, user profile, theme toggle
DashboardLayout: Main wrapper with sidebar + content area

Task Components

TaskList: Grid/list view with filters and sorting
TaskCard: Individual task with priority badge, due date, status indicator
TaskForm: Modal for creating/editing tasks with category and dependency selection
TaskDependencyGraph: Visual representation of task relationships
TaskFilters: Category, priority, status, assignee filters

Scheduler Components

CalendarHeader: Month/week/day view toggle, navigation arrows
MonthView: Grid calendar with task badges
WeekView: 7-column layout with days
DayView: Hourly time slots with tasks
TimelineGantt: Horizontal bar chart showing task/exam timelines
ExamWidget: Exam countdown and prep checklist
DragDropHandler: Drag-and-drop logic for task rescheduling

Chat Components

ChatContainer: Main chat layout with groups and messages
MessageList: Scrollable message feed with timestamps
MessageInput: Text input with send button
GroupList: Sidebar with group selection and create group button
GroupMemberList: Display group members

6. State Management
Use React hooks with Context API:

TaskContext: Global task state (create, read, update, delete)
ChatContext: Global chat state (messages, groups)
SchedulerContext: Calendar view state, selected date range
UIContext: Sidebar collapse, theme, active module

Optional: Consider Zustand or Jotai for simpler state if needed
7. Animations (Framer Motion)
Presets in /lib/animations.ts:

fadeInUp: Page entrance
staggerContainer: List animations
staggerItem: Individual item animations
slideInRight: Sidebar/modal slides
scaleIn: Card reveals
bounce: Notification toasts

8. Styling Approach

Color Palette: Dark mode (slate-900 background, slate-800 cards, accent color for primary actions)
Primary Accent: Blue or purple (customizable)
Status Colors: Green (completed), Yellow (in-progress), Red (overdue), Gray (pending)
Typography: Inter/Geist font with clear hierarchy
Spacing: Consistent 4px/8px/12px/16px/24px grid

9. Implementation Priority
Phase 1 (MVP)

Dashboard layout with sidebar navigation
Task CRUD with categories and basic filtering
Task list view with animations
Simple month calendar view

Phase 2
5. Task dependencies and dependency graph
6. Assignment to multiple users
7. Week and day views
8. Drag-and-drop rescheduling
Phase 3
9. Chat system with groups and messages
10. Exam manager with countdown
11. Gantt timeline view
12. Polish animations and dark theme refinement
10. Dependencies to Install

framer-motion: Animations
@radix-ui/*: Base components (included with shadcn)
lucide-react: Icons
date-fns: Date utilities
react-beautiful-dnd or dnd-kit: Drag-and-drop (optional, can use native HTML5)
zustand (optional): State management alternative


Design Principles

Academic Focus: Clean, professional UI optimized for student workflows
Dark Theme: Reduce eye strain, modern aesthetic
Visual Hierarchy: Clear distinction between tasks, schedules, and communications
Micro-interactions: Framer Motion for delightful, smooth transitions
Responsive: Works on mobile, tablet, desktop seamlessly
Accessibility: WCAG 2.1 AA standards, keyboard navigation


Success Criteria

 All three modules (Tasks, Scheduler, Chat) are functional
 Dark theme is consistent across all pages
 Animations enhance UX without being distracting
 Drag-and-drop scheduling works smoothly
 API routes handle CRUD operations reliably
 Mobile responsive design works on small screens
 Task dependencies are visualized clearly