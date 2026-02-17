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

const columns: { id: TaskStatus; title: string; color: string; dot: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'border-t-amber-500/50', dot: 'bg-amber-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-blue-500/50', dot: 'bg-blue-500' },
  { id: 'DONE', title: 'Done', color: 'border-t-emerald-500/50', dot: 'bg-emerald-500' },
];

export function TaskBoard({ tasks, onUpdateTask, onDeleteTask, onEditTask }: TaskBoardProps) {
  
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="flex h-full gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory">
      {columns.map((column, i) => (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          key={column.id} 
          className="flex-shrink-0 w-80 snap-center rounded-2xl bg-black/20 backdrop-blur-xl border border-white/5 flex flex-col shadow-xl"
        >
          <div className={`p-5 flex items-center justify-between sticky top-0 z-10 bg-white/5 backdrop-blur-md rounded-t-2xl border-b border-white/5 ${column.color} border-t-2`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${column.dot} shadow-[0_0_10px_currentColor] opacity-80`} />
              <h3 className="font-bold text-white tracking-wide">{column.title}</h3>
            </div>
            <span className="text-xs font-bold text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4 min-h-[150px]">
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
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-xl m-2 bg-white/5/50">
                  <p className="text-sm font-medium text-white/20">Empty</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </motion.div>
      ))}
    </div>
  );
}
