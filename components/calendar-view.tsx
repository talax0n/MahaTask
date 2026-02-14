'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarView({ tasks, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);
  const startDay = monthStart.getDay();

  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const days = Array.from({ length: startDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getTasksForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => format(new Date(t.due_date), 'yyyy-MM-dd') === dateStr);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isSameDay(date, selectedDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isSameDay(date, today);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-semibold text-foreground tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8 hover:bg-muted rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8 hover:bg-muted rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full">
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-4">
          {dayLabels.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-2">
          {days.map((day, idx) => {
            const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
            const dayTasks = day ? getTasksForDay(day) : [];
            const hasTasks = dayTasks.length > 0;
            
            return (
              <div key={idx} className="relative flex flex-col items-center">
                {day ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDateSelect(date!)}
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-full text-sm transition-colors',
                      isSelected(day) 
                        ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20' 
                        : isToday(day)
                          ? 'bg-muted text-foreground font-semibold'
                          : 'text-foreground hover:bg-muted/50'
                    )}
                  >
                    {day}
                    {hasTasks && !isSelected(day) && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        <div className={cn(
                          "w-1 h-1 rounded-full",
                          dayTasks.some(t => t.priority === 'high') ? "bg-red-400" : "bg-blue-400"
                        )} />
                      </div>
                    )}
                  </motion.button>
                ) : (
                  <div className="w-10 h-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
