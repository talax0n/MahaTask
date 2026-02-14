'use client';

import { Task, TaskStatus } from '@/lib/types';
import { TaskCard } from '@/components/task-card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-500/10 border-slate-500/20' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20' },
  { id: 'DONE', title: 'Done', color: 'bg-green-500/10 border-green-500/20' },
];

export function TaskBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask }: TaskBoardProps) {
  
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex h-full gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
      {columns.map(column => (
        <div 
          key={column.id} 
          className={`flex-shrink-0 w-80 snap-center rounded-xl border ${column.color} bg-card/30 backdrop-blur-sm flex flex-col`}
        >
          <div className="p-4 font-semibold text-sm flex items-center justify-between sticky top-0 z-10 bg-background/50 backdrop-blur-md rounded-t-xl border-b border-border/50">
            <h3>{column.title}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          
          <ScrollArea className="flex-1 p-3">
            <div className="flex flex-col gap-3 min-h-[200px]">
              <AnimatePresence mode="popLayout">
                {getTasksByStatus(column.id).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    viewMode="board"
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStatusChange={(id, status) => onUpdateTask(id, { status })}
                  />
                ))}
              </AnimatePresence>
              
              {getTasksByStatus(column.id).length === 0 && (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted rounded-lg m-2">
                  <p className="text-xs text-muted-foreground">Empty</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
