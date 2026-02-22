import { useState, useCallback, useEffect } from 'react';
import { apiClient, getToken } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import type { Task, CreateTaskRequest, UpdateTaskStatusRequest, UpdateTaskProgressRequest } from '@/lib/types';

// Re-export Task type for components that need it
export type { Task };

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (taskData: CreateTaskRequest) => Promise<Task | null>;
  updateStatus: (id: string, status: 'IN_PROGRESS' | 'DONE') => Promise<Task | null>;
  updateProgress: (id: string, progress: number) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<Task[]>(API_CONFIG.ENDPOINTS.TASKS.GET_ALL);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const createTask = useCallback(async (taskData: CreateTaskRequest) => {
    try {
      const endpoint = taskData.groupId
        ? API_CONFIG.ENDPOINTS.TASKS.CREATE_GROUP(taskData.groupId)
        : API_CONFIG.ENDPOINTS.TASKS.CREATE;
      const payload = { ...taskData };
      const newTask = await apiClient.post<Task>(endpoint, payload);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: 'IN_PROGRESS' | 'DONE') => {
    try {
      const updated = await apiClient.patch<Task>(
        API_CONFIG.ENDPOINTS.TASKS.UPDATE_STATUS(id),
        { status }
      );
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const updateProgress = useCallback(async (id: string, progress: number) => {
    try {
      const updated = await apiClient.patch<Task>(
        API_CONFIG.ENDPOINTS.TASKS.UPDATE_PROGRESS(id),
        { progress }
      );
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await apiClient.delete<{ message: string }>(API_CONFIG.ENDPOINTS.TASKS.DELETE(id));
      setTasks(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  return { tasks, loading, error, createTask, updateStatus, updateProgress, deleteTask, refreshTasks };
}
