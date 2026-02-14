'use client';

import { motion } from 'framer-motion';
import { Task, TaskPriority } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  CalendarIcon, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  viewMode?: 'list' | 'board';
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20',
  HIGH: 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, viewMode = 'list' }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const CardWrapper = viewMode === 'list' ? motion.div : motion.li;

  return (
    <CardWrapper
      layoutId={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative bg-card/50 hover:bg-card border-border/50 hover:border-border transition-all duration-200",
        viewMode === 'list' ? "mb-3" : "mb-4",
        task.status === 'DONE' && "opacity-60 grayscale-[0.5]"
      )}
    >
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => onStatusChange(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                className={cn(
                  "mt-1 rounded-full p-0.5 transition-colors",
                  task.status === 'DONE' 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {task.status === 'DONE' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={cn(
                    "font-medium leading-none tracking-tight",
                    task.status === 'DONE' && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h3>
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="outline" className={cn("text-[10px] h-5", priorityColors[task.priority])}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500"
                  onClick={() => onDelete(task.id)}
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1.5",
                isOverdue ? "text-red-500 font-medium" : ""
              )}>
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
            )}
          </div>
          
          <Avatar className="h-5 w-5 border border-border">
            <AvatarFallback className="text-[10px]">ME</AvatarFallback>
          </Avatar>
        </CardFooter>
      </Card>
    </CardWrapper>
  );
}
