# Dashboard Feature Documentation

## Overview

The MahaTask Dashboard is a comprehensive, visually stunning overview page that gives students a complete view of their academic life at a glance. Built with a bold **"Academic Command Center"** aesthetic, it combines data-driven design with energetic visual elements optimized for student engagement.

## Design Philosophy

### Aesthetic Direction: "Academic Command Center"

The dashboard embraces a modern, technical aesthetic that evokes both precision and energy:

- **Dark theme** with gradient accents creating depth and visual interest
- **Electric blue (#3B82F6)** and **cyan (#48d1cc)** accent colors for high-energy highlights
- **Monospace typography** (Geist Mono) for data and statistics, creating a technical, dashboard-like feel
- **Gradient overlays** and **glow effects** on interactive elements
- **Staggered animations** on component load for a polished, professional feel
- **Card-based layout** with intentional asymmetry and varied sizing

### Typography Strategy

- **Headers**: Bold sans-serif with gradient text effects
- **Statistics/Data**: Geist Mono (monospace) for clarity and technical feel
- **Body text**: Clean Geist Sans for readability
- **Special elements**: Gradient text backgrounds for hero elements

### Color System

Based on the existing MahaTask dark theme with strategic enhancements:

- **Base Background**: `hsl(8 13% 8%)` - Deep charcoal
- **Card Background**: `hsl(15 13% 12%)` - Elevated dark gray
- **Primary**: `hsl(220 90% 56%)` - Electric blue (brand color)
- **Accent**: `hsl(180 85% 55%)` - Vibrant cyan
- **Success**: Green tones for completed items
- **Warning**: Amber/Yellow for urgent items
- **Error**: Red tones for critical alerts

## Features

### 1. Hero Welcome Section

**Location**: Top of dashboard

**Purpose**: Personalized greeting and visual anchor

**Elements**:
- Time-based greeting (Good Morning/Afternoon/Evening)
- User's first name display
- Current date
- User avatar with gradient border
- Animated gradient background glow
- Sparkle icon for visual interest

**Animations**:
- Pulsing gradient background
- Fade-in on load (700ms duration)

---

### 2. Key Metrics Grid

**Layout**: 4-column responsive grid (2 columns on mobile)

**Metrics**:

1. **Total Tasks**
   - Icon: Target
   - Color: Blue gradient
   - Shows total number of tasks in the system

2. **Completed Tasks**
   - Icon: CheckCircle2
   - Color: Green gradient
   - Shows count of tasks with status DONE

3. **In Progress**
   - Icon: Zap (lightning bolt)
   - Color: Amber gradient
   - Shows count of tasks with status IN_PROGRESS

4. **Study Groups**
   - Icon: Users
   - Color: Purple gradient
   - Shows number of active study groups

**Interactions**:
- Hover effect: Scale up (105%), enhanced shadow with color glow
- Background glow appears on hover
- Staggered load animation (100ms delay between cards)

**Visual Design**:
- Gradient backgrounds with semi-transparency
- Colored borders matching the metric theme
- Large monospace numbers for data
- Icon with matching color accent
- Responsive shadow effects

---

### 3. Progress Overview Cards

**Layout**: 2-column grid (stacks on mobile)

#### Overall Progress Card

**Purpose**: Shows task completion statistics

**Elements**:
- Completion percentage (large, bold, monospace)
- Animated progress bar
- Breakdown grid showing:
  - To Do count (neutral)
  - Active count (amber)
  - Done count (green)
- Trending up icon

**Calculation**:
```typescript
completionRate = (completedTasks / totalTasks) * 100
```

#### Today's Schedule Card

**Purpose**: Quick view of today's schedule items

**Elements**:
- Count of today's schedules
- List of up to 3 schedule items showing:
  - Title
  - Start and end time
  - Type badge (STUDY, EXAM, ASSIGNMENT, etc.)
- "View All" button if more than 3 items
- Calendar icon
- Empty state message if no schedules

**Time Display**: Uses date-fns for formatting (e.g., "2:30 PM - 4:00 PM")

---

### 4. Urgent Tasks Section

**Visibility**: Only shown when urgent tasks exist

**Definition of Urgent**: Tasks due within 48 hours that are not completed

**Visual Treatment**:
- Red/orange gradient background
- Red border glow
- Alert icon in red
- Shadow with red tint

**Layout**: Responsive grid (2 columns on desktop, 1 on mobile)

**Task Card Elements**:
- Status icon (circle, clock, or checkmark)
- Task title (truncated if long)
- Priority badge (HIGH/MEDIUM/LOW with color coding)
- Due date with smart formatting:
  - "Due today" for same-day items
  - "Due tomorrow" for next-day items
  - "Due MMM d" for other dates
- Progress bar and percentage if progress > 0
- Hover effect: Primary color text transition

**Sorting**: Tasks sorted by due date (soonest first), limited to 6 items

---

### 5. Upcoming Tasks Card

**Purpose**: Shows next tasks on the horizon

**Selection Criteria**:
- Status ≠ DONE
- Has a due date
- Sorted by due date ascending
- Limited to 5 items

**Elements**:
- Target icon header
- "View All" link to tasks page
- List of task cards with:
  - Status icon
  - Title with truncation
  - Priority badge
  - Due date (full format: "MMM d, yyyy")
  - Progress percentage if > 0
- Hover effects on individual cards
- Empty state message if no upcoming tasks

---

### 6. Social Section

**Layout**: 2-column grid (stacks on mobile)

#### Study Groups Card

**Purpose**: Overview of active study groups

**Elements**:
- Purple gradient theme
- Users icon
- Group count
- List of up to 3 groups showing:
  - Group name
  - Member count badge
- "Open Chat" button linking to /chat
- Empty state message

#### Study Network Card

**Purpose**: Display connected friends

**Elements**:
- Cyan gradient theme
- Friends count
- Grid of up to 4 friend avatars showing:
  - Avatar image or initial fallback
  - First name
- Empty state message encouraging connections

---

## Data Sources

The dashboard pulls data from multiple custom React hooks:

### `useAuth()`
- **user**: Current user object with name, email, avatar

### `useTasks()`
- **tasks**: Array of all tasks for the user
- **loading**: Loading state

### `useSchedule()`
- **schedules**: Array of all schedule items
- **loading**: Loading state

### `useSocial()`
- **groups**: Array of study groups
- **friends**: Array of friends

## Calculated Statistics

All statistics are computed using `useMemo` for performance optimization:

```typescript
stats = {
  totalTasks: tasks.length,
  completedTasks: count where status === 'DONE',
  inProgressTasks: count where status === 'IN_PROGRESS',
  todoTasks: count where status === 'TODO',
  upcomingDeadlines: count where dueDate in future and not DONE,
  todaySchedules: count where schedule is today,
  completionRate: (completed / total) * 100,
  avgProgress: average of all task progress values
}
```

## Smart Filtering Logic

### Today's Schedule
```typescript
isToday(parseISO(schedule.startTime))
```

### Urgent Tasks
```typescript
hoursUntilDue = differenceInHours(dueDate, now)
return hoursUntilDue <= 48 && hoursUntilDue >= 0 && status !== 'DONE'
```

### Upcoming Tasks
```typescript
status !== 'DONE' && dueDate exists
Sort by: dueDate ascending
```

## Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Stats grid: 2 columns
  - Progress cards: 1 column (stacked)
  - Urgent tasks: 1 column
  - Social cards: 1 column (stacked)

- **Desktop**: ≥ 768px
  - Stats grid: 4 columns
  - Progress cards: 2 columns
  - Urgent tasks: 2 columns
  - Social cards: 2 columns

### Mobile Optimizations

- Larger touch targets for buttons
- Simplified layouts with single-column stacking
- Truncated text to prevent overflow
- Reduced padding on small screens

## Performance Optimizations

1. **useMemo for calculations**: All statistics are memoized to prevent unnecessary recalculations
2. **Conditional rendering**: Urgent tasks section only renders when needed
3. **Slice limits**: Lists are limited (e.g., 5 tasks, 3 schedules) to prevent overwhelming UI
4. **Loading states**: Proper loading indicators while data fetches
5. **CSS-only animations**: All animations use CSS transitions and keyframes

## Animations

### Load Sequence

1. **Hero section**: Fade in with pulsing gradient (duration: 700ms)
2. **Stats cards**: Staggered fade-in (100ms delay between each)
3. **Content sections**: Standard fade-in

### Hover Effects

- **Stat cards**: Scale to 105%, add colored shadow glow
- **Task items**: Text color transitions to primary, border color changes
- **Buttons**: Background color transitions

### Interactive Elements

- **Progress bars**: Smooth fill animations
- **Gradient text**: Animated gradient backgrounds
- **Pulse effects**: Sparkle icon and background gradient

## Accessibility

- **Semantic HTML**: Proper heading hierarchy (h1, h3)
- **ARIA labels**: Icons paired with text labels
- **Color contrast**: All text meets WCAG AA standards
- **Keyboard navigation**: All interactive elements are keyboard accessible
- **Loading states**: Screen reader friendly loading messages
- **Empty states**: Informative messages when no data exists

## Empty States

Each section gracefully handles empty data with encouraging messages:

- **No schedules**: "No schedules for today. Time to relax! 🎉"
- **No upcoming tasks**: "No upcoming tasks. You're all caught up! ✨"
- **No groups**: "No study groups yet. Create one to collaborate!"
- **No friends**: "Connect with classmates to build your network!"

## Navigation Integration

The dashboard is integrated into the main navigation sidebar:

- **Route**: `/dashboard`
- **Icon**: LayoutDashboard (lucide-react)
- **Position**: First item in sidebar (primary landing page)
- **Redirect**: Root `/` path redirects to `/dashboard`

## File Structure

```
app/
  dashboard/
    page.tsx          # Main dashboard component
  page.tsx            # Root redirect to dashboard

components/
  sidebar.tsx         # Updated with dashboard nav item

docs/
  DASHBOARD.md        # This documentation
```

## Future Enhancements

Potential improvements for future iterations:

1. **Real-time updates**: WebSocket integration for live data
2. **Customization**: Let users choose which widgets to show
3. **Analytics charts**: Visual graphs for progress over time
4. **Notifications panel**: Quick access to recent notifications
5. **Quick actions**: Inline task creation and quick updates
6. **Study streak tracker**: Gamification element showing consecutive days
7. **Performance insights**: AI-powered suggestions based on patterns
8. **Calendar integration**: Direct scheduling from dashboard
9. **Export functionality**: Download reports of activity
10. **Theme customization**: Let users choose accent colors

## Dependencies

- **React 19**: Core framework
- **Next.js 16**: Routing and SSR
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library
- **shadcn/ui**: Component library
- **Tailwind CSS v4**: Styling

## Browser Support

Tested and optimized for:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

## Development Notes

- Component is fully client-side (`"use client"`)
- Uses TypeScript for type safety
- Follows existing project patterns (custom hooks, shadcn components)
- Mobile-first responsive design
- Dark theme optimized for extended study sessions
