'use client';

import { motion } from 'framer-motion';
import { Task, TaskPriority } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarIcon, 
  MoreHorizontal, 
  CheckCircle2, 
  Circle,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  viewMode?: 'list' | 'board';
}

const priorityConfig: Record<TaskPriority, { color: string; border: string; bg: string; icon: any }> = {
  LOW: { 
    color: 'text-emerald-500', 
    border: 'border-l-emerald-500', 
    bg: 'bg-emerald-500/10',
    icon: Circle
  },
  MEDIUM: { 
    color: 'text-amber-500', 
    border: 'border-l-amber-500', 
    bg: 'bg-amber-500/10',
    icon: ArrowRight
  },
  HIGH: { 
    color: 'text-rose-500', 
    border: 'border-l-rose-500', 
    bg: 'bg-rose-500/10',
    icon: AlertCircle
  }
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, viewMode = 'list' }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  
  // Safely handle priority (default to MEDIUM if missing or invalid)
  const rawPriority = task.priority?.toString().toUpperCase() as TaskPriority;
  const effectivePriority = priorityConfig[rawPriority] ? rawPriority : 'MEDIUM';
  const priority = priorityConfig[effectivePriority];
  
  const isDone = task.status === 'DONE';

  const CardWrapper = viewMode === 'list' ? motion.div : motion.li;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const handleStatusToggle = () => {
    onStatusChange(task.id, isDone ? 'TODO' : 'DONE');
  };

  if (viewMode === 'list') {
    return (
      <CardWrapper
        layoutId={`${task.id}-${viewMode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ scale: 1.005 }}
        className={cn(
          "group relative mb-3 transition-all duration-200",
          isDone && "opacity-75"
        )}
      >
        <Card className={cn(
          "flex items-center p-3 gap-4 border-l-4 hover:shadow-md transition-shadow",
          priority.border,
          isDone ? "bg-muted/30 border-l-muted-foreground/30" : "bg-card"
        )}>
          {/* Status Checkbox */}
          <button
            onClick={handleStatusToggle}
            className={cn(
              "flex-shrink-0 rounded-full p-1 transition-colors hover:bg-muted",
              isDone ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>

          {/* Main Content */}
          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Title & Description */}
            <div className="md:col-span-6">
              <h3 className={cn(
                "font-medium truncate transition-all",
                isDone && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground truncate">
                  {task.description}
                </p>
              )}
            </div>

            {/* Badges & Meta */}
            <div className="md:col-span-4 flex items-center gap-2 text-xs text-muted-foreground">
               <Badge variant="outline" className={cn("text-[10px] px-1.5 h-5 font-normal capitalize", priority.bg, priority.color, "border-0")}>
                  {effectivePriority.toLowerCase()}
               </Badge>
               
               {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50",
                  isOverdue ? "text-red-500 bg-red-500/10" : ""
                )}>
                  <CalendarIcon className="w-3 h-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
               )}
            </div>

             {/* Progress (if active) */}
             {task.status === 'IN_PROGRESS' && (
              <div className="md:col-span-2 w-full">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}>
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500"
                onClick={() => onDelete(task.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </CardWrapper>
    );
  }

  // Board View (Card Layout)
  return (
    <CardWrapper
      layoutId={`${task.id}-${viewMode}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={cn(
        "group relative mb-4",
        isDone && "opacity-75"
      )}
    >
      <Card className={cn(
        "flex flex-col border-t-4 shadow-sm hover:shadow-md transition-all",
        priority.border.replace('border-l-', 'border-t-'), // Use top border for cards
        isDone ? "bg-muted/30" : "bg-card"
      )}>
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
          <Badge variant="outline" className={cn("text-[10px] font-normal px-2", priority.bg, priority.color, "border-0")}>
            {effectivePriority}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}>Mark In Progress</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => onDelete(task.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-1 space-y-3">
          <div>
            <div className="flex items-start gap-2">
              <button
                onClick={handleStatusToggle}
                className={cn(
                  "mt-0.5 rounded-full transition-colors",
                  isDone ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
              <h3 className={cn("font-semibold leading-tight", isDone && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                {task.description}
              </p>
            )}
          </div>

          {task.status === 'IN_PROGRESS' && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-1.5" />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 border-t bg-muted/5 mt-auto">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-3">
            <div className={cn(
              "flex items-center gap-1.5",
              isOverdue ? "text-red-500 font-medium" : ""
            )}>
              {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              <span>{task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
            </div>
            
            {task.userId && (
               <Avatar className="h-6 w-6 border">
                <AvatarFallback className="text-[9px]">ME</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardFooter>
      </Card>
    </CardWrapper>
  );
}
