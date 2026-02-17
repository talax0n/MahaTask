'use client';

import { useState } from 'react';
import { CreateTaskRequest, TaskPriority, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskFormProps {
  onSubmit: (taskData: CreateTaskRequest) => void;
  onClose: () => void;
}

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

export function TaskForm({ onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('LOW');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    };

    onSubmit(taskData);
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('LOW');
    setDeadline('');
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/20 focus:ring-white/10 transition-all duration-300 hover:bg-white/10 rounded-xl";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white/70">Task Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Complete Math Assignment"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white/70">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about your task..."
          className={`${inputClass} resize-none min-h-[120px]`}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="priority" className="text-white/70">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-white/70">Due Date</Label>
          <Input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`${inputClass} block`}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white rounded-xl"
        >
          Cancel
        </Button>
        <Button type="submit" className="glass-button bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl px-8">
          Create Task
        </Button>
      </div>
    </form>
  );
}