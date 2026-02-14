'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useSchedule } from '@/hooks/use-schedule';
import { CalendarView } from '@/components/calendar-view';
import { DailySchedule } from '@/components/daily-schedule';
import { TimelineView } from '@/components/timeline-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface SchedulerProps {
  userId: string;
}

export function Scheduler({ userId }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTasks(userId);
  const { slots } = useSchedule(userId, format(selectedDate, 'yyyy-MM-dd'));
  const [activeView, setActiveView] = useState<'calendar' | 'daily' | 'timeline'>('calendar');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Scheduler</h2>
        <p className="text-sm text-muted-foreground">Manage your study schedule and deadlines</p>
      </div>

      {/* View tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="daily">Daily View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="calendar" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CalendarView
                  tasks={tasks}
                  onDateSelect={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
              
              {/* Upcoming deadlines */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <h3 className="font-semibold text-foreground mb-3">Upcoming Deadlines</h3>
                <div className="space-y-2">
                  {tasks
                    .filter(t => new Date(t.due_date) >= new Date())
                    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                    .slice(0, 5)
                    .map(task => (
                      <div key={task.id} className="text-xs bg-background/50 rounded p-2 border border-border/50">
                        <p className="font-medium truncate text-foreground">{task.title}</p>
                        <p className="text-muted-foreground">
                          {format(new Date(task.due_date), 'MMM d')}
                        </p>
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="mt-4">
            <DailySchedule slots={slots} date={selectedDate} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <TimelineView tasks={tasks} />
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}
