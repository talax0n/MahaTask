'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScheduleSlot } from '@/hooks/use-schedule';
import { format } from 'date-fns';
import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyScheduleProps {
  slots: ScheduleSlot[];
  date: Date;
  onDeleteSlot?: (id: string) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM

export function DailySchedule({ slots, date, onDeleteSlot }: DailyScheduleProps) {
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const getSlotStyle = (startTime: string, endTime: string) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const top = ((start - 7 * 60) / 60) * 80; // 80px per hour
    const height = ((end - start) / 60) * 80;
    return { top: `${top}px`, height: `${height}px`, minHeight: '60px' };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-lg">
          {format(date, 'EEEE, MMMM d')}
        </h3>
        <span className="text-xs text-muted-foreground">{slots.length} events</span>
      </div>

      {/* Schedule grid */}
      <div className="relative flex-1 min-h-[800px]">
        {/* Hour lines */}
        {HOURS.map((hour) => (
          <div key={hour} className="border-t border-border/30 h-20 relative group">
            <span className="absolute -left-12 -top-2.5 text-xs text-muted-foreground font-medium w-8 text-right group-hover:text-foreground transition-colors">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* Time slots */}
        <div className="absolute inset-0 pl-4">
          <AnimatePresence>
            {slots.map((slot, idx) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                style={getSlotStyle(slot.start_time, slot.end_time)}
                className={cn(
                  'absolute left-2 right-2 rounded-lg p-3 text-xs shadow-sm border transition-all hover:shadow-md hover:scale-[1.01] z-10',
                  slot.type === 'task'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300'
                    : 'bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300'
                )}
              >
                <div className="flex items-start justify-between gap-2 h-full">
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                    <p className="font-semibold truncate text-sm">{slot.title}</p>
                    <p className="text-xs opacity-75 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {slot.start_time} - {slot.end_time}
                    </p>
                  </div>
                  {onDeleteSlot && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlot(slot.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
