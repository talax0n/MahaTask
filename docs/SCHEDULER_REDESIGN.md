I have redesigned the **Scheduler UI** to be modern, clean, and dashboard-oriented.

### Key Changes:

1.  **Modern Dashboard Layout (`components/scheduler.tsx`)**:
    *   Switched to a **2-column grid**: The main schedule view takes up the left side, while a new "Focus Sidebar" on the right shows **Upcoming Deadlines** and **Today's Stats**.
    *   Added a **Glassmorphic Header** with a clear page title.
    *   Replaced standard tabs with a **Segmented Control** for switching between Calendar, Daily, and Timeline views.

2.  **Revamped Calendar View (`components/calendar-view.tsx`)**:
    *   **Minimalist Design**: Removed heavy grid lines and borders.
    *   **Interactivity**: Used rounded selection states, distinct "Today" highlighting, and color-coded dot indicators for tasks.
    *   **Typography**: Improved readability with cleaner fonts and better spacing.

3.  **Refined Timeline View (`components/timeline-view.tsx`)**:
    *   **Cleaner Cards**: Simplified the task cards with a subtle background and hover effects.
    *   **Visual Progress**: Added progress bars indicating time elapsed vs. due date.
    *   **Status Indicators**: Clear badges for "Overdue", "Due Today", etc.

4.  **Integrated Daily Schedule (`components/daily-schedule.tsx`)**:
    *   Removed outer borders to fit seamlessly into the new dashboard container.
    *   Polished the time slots and hour markers.

The scheduler now looks and feels like a modern productivity app. You can verify the changes by running `npm run dev` and navigating to the Scheduler page.