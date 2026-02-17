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
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-white/5 bg-white/5/50 backdrop-blur-sm">
              <p className="text-sm font-medium text-white/30">No tasks found</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}