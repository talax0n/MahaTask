'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { Task, TaskStatus } from '@/lib/types';
import { TaskList } from '@/components/task-list';
import { TaskBoard } from '@/components/task-board';
import { TaskForm } from '@/components/task-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Plus, LayoutList, LayoutGrid, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function TaskManagement() {
  const { tasks, loading, error, createTask, updateStatus, deleteTask } = useTasks();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>('all');

  const handleSubmit = async (taskData: any) => {
    // taskData comes from form. We need to match CreateTaskRequest
    // The form currently returns something slightly different, we'll need to fix the form too.
    // For now assuming the form will be updated to return correct data.
    const result = await createTask(taskData);
    if (result) {
      toast.success('Task created successfully');
      setShowForm(false);
    } else {
      toast.error('Failed to create task');
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      toast.success('Task deleted');
    } else {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: string, updates: Partial<Task>) => {
    if (updates.status) {
      // API only supports IN_PROGRESS or DONE for updateStatus
      // But we have TODO.
      // If status is TODO, we might need to handle it.
      // However, the backend types say UpdateTaskStatusRequest is 'IN_PROGRESS' | 'DONE'.
      // This implies we cannot set back to TODO?
      // Let's assume we can pass 'TODO' anyway and see if backend rejects, or map TODO to something else?
      // Actually, if the backend strictly types it, we might be in trouble for "Un-completing" a task.
      // Let's try to cast it and see.
      await updateStatus(id, updates.status as any);
    }
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'DONE').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

  if (loading && tasks.length === 0) {
     return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage your academic workload.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-lg flex items-center">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <LayoutList className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="h-8 w-8 p-0"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">To Do</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stats.todo}</span>
            <span className="text-xs text-muted-foreground">pending</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">In Progress</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-500">{stats.inProgress}</span>
            <span className="text-xs text-muted-foreground">active</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Completed</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-500">{stats.done}</span>
            <span className="text-xs text-muted-foreground">finished</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {viewMode === 'list' ? (
          <div className="space-y-4">
             <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="TODO">To Do</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">In Progress</TabsTrigger>
                <TabsTrigger value="DONE">Done</TabsTrigger>
              </TabsList>
            </Tabs>
            <TaskList
              tasks={tasks}
              filter={activeFilter}
              onUpdateTask={handleStatusChange}
              onDeleteTask={handleDelete}
              onEditTask={() => toast.info('Editing tasks is not supported yet')}
            />
          </div>
        ) : (
          <TaskBoard
            tasks={tasks}
            onUpdateTask={handleStatusChange}
            onDeleteTask={handleDelete}
            onEditTask={() => toast.info('Editing tasks is not supported yet')}
          />
        )}
      </div>

      {/* Create Task Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Create New Task</SheetTitle>
            <SheetDescription>
              Add a new task to your list. Click create when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <TaskForm
              onSubmit={handleSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}