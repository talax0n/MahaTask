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
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-background/50 border-b border-border p-3">
        <h3 className="font-semibold text-foreground">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>

      {/* Schedule grid */}
      <div className="relative">
        {/* Hour lines */}
        {HOURS.map((hour) => (
          <div key={hour} className="border-t border-border/30 h-20 relative">
            <span className="absolute -left-12 top-0 text-xs text-muted-foreground">
              {String(hour).padStart(2, '0')}:00
            </span>
          </div>
        ))}

        {/* Time slots */}
        <div className="absolute inset-0 pl-12">
          <AnimatePresence>
            {slots.map((slot, idx) => (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                style={getSlotStyle(slot.start_time, slot.end_time)}
                className={cn(
                  'absolute left-2 right-2 rounded-lg p-2 text-xs group',
                  slot.type === 'task'
                    ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300'
                    : 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{slot.title}</p>
                    <p className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {slot.start_time} - {slot.end_time}
                    </p>
                  </div>
                  {onDeleteSlot && (
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
