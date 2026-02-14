'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks, Task } from '@/hooks/use-tasks';
import { TaskList } from '@/components/task-list';
import { TaskForm } from '@/components/task-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface TaskManagementProps {
  userId: string;
}

export function TaskManagement({ userId }: TaskManagementProps) {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(userId);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const handleSubmit = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingTask) {
      await updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
    } else {
      await createTask(taskData);
    }
    setShowForm(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Task Management</h2>
          <p className="text-sm text-muted-foreground">Organize and track your academic tasks</p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-border rounded-lg p-3"
        >
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-blue-400">{stats.pending}</p>
        </motion.div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400"
        >
          {error}
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
        <TabsList className="bg-background border border-border">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFilter} className="space-y-4 mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              filter={activeFilter}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              onEditTask={handleEdit}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
          userId={userId}
        />
      )}
    </div>
  );
}
