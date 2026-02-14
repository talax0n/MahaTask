'use client';

import { motion } from 'framer-motion';
import { Task } from '@/hooks/use-tasks';
import { format, differenceInDays, startOfToday, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

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
    if (totalDays === 0) return 100;
    const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));
    return progress;
  };

  const priorityColor = {
    low: 'bg-blue-500',
    medium: 'bg-yellow-500',
    high: 'bg-red-500'
  };

  return (
    <div className="space-y-4 pr-2">
      {sortedTasks.map((task, idx) => {
        const daysUntil = getDaysUntilDue(task.due_date);
        const isOverdue = daysUntil < 0;
        const progress = getProgressWidth(task.due_date);

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onTaskClick?.(task)}
            className="group cursor-pointer relative overflow-hidden rounded-xl bg-muted/30 border border-transparent hover:border-border hover:bg-muted/50 transition-all duration-200 p-4"
          >
            <div className="flex items-start gap-4">
              {/* Status Icon */}
              <div className="mt-1">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isOverdue ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-semibold text-base leading-none mb-1 group-hover:text-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {task.subject || 'No Subject'}
                    </p>
                  </div>
                  <div className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider',
                    isOverdue 
                      ? 'bg-red-500/10 text-red-500'
                      : daysUntil <= 2
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'bg-green-500/10 text-green-500'
                  )}>
                    {isOverdue 
                      ? 'Overdue'
                      : daysUntil === 0 
                      ? 'Due Today' 
                      : `${daysUntil} Days Left`}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className={cn('h-full rounded-full opacity-80', priorityColor[task.priority])}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                  </div>
                  <span className={cn(
                    'capitalize font-medium',
                    task.priority === 'high' && 'text-red-500',
                    task.priority === 'medium' && 'text-yellow-500',
                    task.priority === 'low' && 'text-blue-500'
                  )}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {sortedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending tasks found.</p>
          </div>
        </div>
      )}
    </div>
  );
}
