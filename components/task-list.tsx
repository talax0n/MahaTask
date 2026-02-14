'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/hooks/use-tasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  filter?: 'all' | 'pending' | 'in-progress' | 'completed';
}

const priorityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const subjectColors: Record<string, string> = {
  'Math': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'CS': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Biology': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Physics': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Chemistry': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'History': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onEditTask, filter = 'all' }: TaskListProps) {
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date() && dueDate !== '';

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className={cn(
              'group relative overflow-hidden rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-accent hover:bg-card/80',
              task.status === 'completed' && 'opacity-60'
            )}
          >
            {/* Blocker indicator */}
            {task.blocker_task_id && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded text-xs text-red-400 border border-red-500/30">
                <AlertCircle className="w-3 h-3" />
                Blocked
              </div>
            )}

            <div className="flex items-start gap-3">
              {/* Status checkbox */}
              <button
                onClick={() => onUpdateTask(task.id, { 
                  status: task.status === 'completed' ? 'pending' : 'completed' 
                })}
                className="mt-0.5 text-accent transition-colors hover:text-accent/80 flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className={cn(
                    'text-sm font-semibold text-foreground transition-all',
                    task.status === 'completed' && 'line-through text-muted-foreground'
                  )}>
                    {task.title}
                  </h3>
                </div>

                {task.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', subjectColors[task.subject] || 'bg-slate-500/20 text-slate-400 border-slate-500/30')}
                  >
                    {task.subject}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', priorityColors[task.priority])}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {/* Due date */}
                <div className={cn(
                  'text-xs flex items-center gap-1',
                  isOverdue(task.due_date) 
                    ? 'text-red-400' 
                    : 'text-muted-foreground'
                )}>
                  {isOverdue(task.due_date) && <AlertCircle className="w-3 h-3" />}
                  Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => onEditTask(task)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => onDeleteTask(task.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-muted-foreground"
        >
          <p className="text-sm">No tasks found</p>
        </motion.div>
      )}
    </div>
  );
}
