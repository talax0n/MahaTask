import { useState, useCallback, useEffect } from 'react';

export interface ScheduleSlot {
  id: string;
  user_id: string;
  task_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  type: string;
  created_at: string;
}

interface UseScheduleReturn {
  slots: ScheduleSlot[];
  loading: boolean;
  error: string | null;
  createSlot: (slot: Omit<ScheduleSlot, 'id' | 'created_at'>) => Promise<ScheduleSlot | null>;
  deleteSlot: (id: string) => Promise<boolean>;
  getSlotsByDate: (date: string) => ScheduleSlot[];
  refreshSlots: () => Promise<void>;
}

export function useSchedule(userId: string | null, date: string): UseScheduleReturn {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSlots = useCallback(async () => {
    if (!userId || !date) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/schedule?userId=${userId}&date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data = await response.json();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId, date]);

  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  const createSlot = useCallback(async (slotData: Omit<ScheduleSlot, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData)
      });
      if (!response.ok) throw new Error('Failed to create slot');
      const newSlot = await response.json();
      setSlots(prev => [...prev, newSlot]);
      return newSlot;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const deleteSlot = useCallback(async (id: string) => {
    try {
      setSlots(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  const getSlotsByDate = useCallback((dateStr: string) => {
    return slots.filter(s => s.date === dateStr);
  }, [slots]);

  return { slots, loading, error, createSlot, deleteSlot, getSlotsByDate, refreshSlots };
}
