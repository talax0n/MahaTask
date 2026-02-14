'use client';

import { motion } from 'framer-motion';
import { Task } from '@/hooks/use-tasks';
import { format, differenceInDays, startOfToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
  const today = startOfToday();
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  );

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(parseISO(dueDate), today);
  };

  const getProgressWidth = (dueDate: string) => {
    const created = new Date(tasks.find(t => t.due_date === dueDate)?.created_at || new Date());
    const due = parseISO(dueDate);
    const totalDays = differenceInDays(due, created);
    const daysRemaining = getDaysUntilDue(dueDate);
    const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
    return progress;
  };

  const priorityColor = {
    low: 'from-blue-500 to-blue-600',
    medium: 'from-yellow-500 to-yellow-600',
    high: 'from-red-500 to-red-600'
  };

  const statusIcon = {
    pending: '◯',
    'in-progress': '◐',
    completed: '◉'
  };

  return (
    <div className="space-y-3">
      {sortedTasks.map((task, idx) => {
        const daysUntil = getDaysUntilDue(task.due_date);
        const isOverdue = daysUntil < 0;
        const progress = getProgressWidth(task.due_date);

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onTaskClick?.(task)}
            className="group cursor-pointer bg-card border border-border rounded-lg p-3 hover:border-accent transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{statusIcon[task.status]}</span>
                  <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{task.subject}</p>
              </div>
              <div className={cn(
                'text-xs font-medium px-2 py-1 rounded',
                isOverdue 
                  ? 'bg-red-500/20 text-red-400'
                  : daysUntil === 0
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : daysUntil <= 7
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-green-500/20 text-green-400'
              )}>
                {isOverdue 
                  ? `${Math.abs(daysUntil)}d overdue`
                  : daysUntil === 0 
                  ? 'Today' 
                  : daysUntil === 1
                  ? 'Tomorrow'
                  : `${daysUntil}d left`}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-2">
              <div className="h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className={cn(
                    'h-full rounded-full bg-gradient-to-r',
                    priorityColor[task.priority]
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Due: {format(new Date(task.due_date), 'MMM d')}
              </span>
              <span className={cn(
                'px-2 py-0.5 rounded text-xs',
                task.priority === 'high' && 'bg-red-500/20 text-red-400',
                task.priority === 'medium' && 'bg-yellow-500/20 text-yellow-400',
                task.priority === 'low' && 'bg-blue-500/20 text-blue-400'
              )}>
                {task.priority.toUpperCase()}
              </span>
            </div>
          </motion.div>
        );
      })}

      {sortedTasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tasks to display
        </div>
      )}
    </div>
  );
}
