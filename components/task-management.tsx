'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/hooks/use-tasks';
import { useSocial } from '@/hooks/use-social';
import { useAuth } from '@/hooks/use-auth';
import { Task, TaskStatus } from '@/lib/types';
import { TaskList } from '@/components/task-list';
import { TaskBoard } from '@/components/task-board';
import { TaskForm } from '@/components/task-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Plus, LayoutList, LayoutGrid, Loader2, CheckCircle2, Circle, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function TaskManagement() {
  const { tasks, loading, error, createTask, updateStatus, deleteTask } = useTasks();
  const { groups } = useSocial();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>('all');

  const handleSubmit = async (taskData: any) => {
    const result = await createTask(taskData);
    if (result) {
      toast.success(taskData.groupId ? 'Group task created successfully' : 'Task created successfully');
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
      await updateStatus(id, updates.status as any);
    }
  };

  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'DONE').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  };

  const groupTaskOptions = groups
    .filter((group) => {
      const membership = group.members?.find((member) => member.id === user?.id);
      return membership?.role === 'ADMIN' || membership?.role === 'MODERATOR';
    })
    .map((group) => ({ id: group.id, name: group.name }));

  if (loading && tasks.length === 0) {
     return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black liquid-text tracking-tighter">Tasks</h2>
          <p className="text-white/60 text-lg">Manage your academic workload.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black/20 backdrop-blur-md p-1.5 rounded-xl border border-white/10 flex items-center shadow-inner">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('list')}
              className={`h-9 w-9 p-0 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutList className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('board')}
              className={`h-9 w-9 p-0 rounded-lg transition-all ${viewMode === 'board' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
          </div>
          <Button onClick={() => setShowForm(true)} className="glass-button h-12 px-6 gap-2 rounded-xl text-md font-medium shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] border-white/20 bg-white/10">
            <Plus className="w-5 h-5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards - Liquid Glass Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks", value: stats.total, icon: Activity, color: "text-indigo-400", sub: "All time" },
          { label: "To Do", value: stats.todo, icon: Circle, color: "text-amber-400", sub: "Pending" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-blue-400", sub: "Active" },
          { label: "Completed", value: stats.done, icon: CheckCircle2, color: "text-emerald-400", sub: "Finished" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5 border border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon className="w-16 h-16 -mr-4 -mt-4 transform rotate-12" />
            </div>
            <p className="text-sm font-medium text-white/50">{stat.label}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${stat.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>{stat.value}</span>
              <span className="text-xs text-white/30 font-medium tracking-wide uppercase">{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
             <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as any)} className="w-full">
              <TabsList className="bg-black/20 backdrop-blur-xl border border-white/10 p-1 h-12 rounded-xl w-full sm:w-auto">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6">All</TabsTrigger>
                <TabsTrigger value="TODO" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6">To Do</TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6">In Progress</TabsTrigger>
                <TabsTrigger value="DONE" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 h-10 px-6">Done</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="glass-panel rounded-2xl p-6 min-h-[400px]">
              <TaskList
                tasks={tasks}
                filter={activeFilter}
                onUpdateTask={handleStatusChange}
                onDeleteTask={handleDelete}
                onEditTask={() => toast.info('Editing tasks is not supported yet')}
              />
            </div>
            </motion.div>
          ) : (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TaskBoard
                tasks={tasks}
                onUpdateTask={handleStatusChange}
                onDeleteTask={handleDelete}
                onEditTask={() => toast.info('Editing tasks is not supported yet')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Sheet */}
      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent className="sm:max-w-md w-full glass-panel border-l border-white/10 bg-black/40 backdrop-blur-2xl text-white">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-white">Create New Task</SheetTitle>
            <SheetDescription className="text-white/60">
              Add a new task to your list. Click create when you're done.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8">
            <TaskForm
              onSubmit={handleSubmit}
              onClose={() => setShowForm(false)}
              groupOptions={groupTaskOptions}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
