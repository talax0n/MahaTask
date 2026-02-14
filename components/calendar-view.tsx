'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
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

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = Array.from({ length: startDay }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const getTasksForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => format(new Date(t.due_date), 'yyyy-MM-dd') === dateStr);
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
            className="h-8 px-2 text-xs"
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.01 }}
            onClick={() => {
              if (day) onDateSelect(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
            }}
            disabled={!day}
            className={cn(
              'relative aspect-square rounded-lg text-xs font-medium transition-all',
              !day && 'invisible',
              day && 'hover:bg-accent/50 cursor-pointer',
              isToday(day) && 'ring-2 ring-accent bg-accent/20',
              isSelected(day) && 'bg-primary text-primary-foreground',
              day && !isToday(day) && !isSelected(day) && 'bg-background border border-border'
            )}
          >
            <div className="flex flex-col items-center justify-center h-full gap-1 p-1">
              <span>{day}</span>
              {day && getTasksForDay(day).length > 0 && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {getTasksForDay(day).slice(0, 2).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        i === 0 ? 'bg-green-400' : 'bg-yellow-400'
                      )}
                    />
                  ))}
                  {getTasksForDay(day).length > 2 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{getTasksForDay(day).length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
