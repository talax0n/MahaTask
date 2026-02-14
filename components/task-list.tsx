'use client';

import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from '@/components/task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  filter?: TaskStatus | 'all';
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onEditTask, filter = 'all' }: TaskListProps) {
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 pb-8">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                viewMode="list"
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={(id, status) => onUpdateTask(id, { status })}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
              <p className="text-sm text-muted-foreground">No tasks found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}