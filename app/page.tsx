'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarLayout } from '@/components/sidebar';
import { TaskManagement } from '@/components/task-management';
import { Scheduler } from '@/components/scheduler';
import { ChatSystem } from '@/components/chat-system';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('tasks');
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize or get user ID - for demo purposes, we'll use a fixed ID
    const demoUserId = 'user_demo_' + Math.random().toString(36).substr(2, 9);
    setUserId(demoUserId);
    setIsLoading(false);
  }, []);

  const views: Record<string, React.ReactNode> = {
    tasks: userId && <TaskManagement userId={userId} />,
    scheduler: userId && <Scheduler userId={userId} />,
    chat: userId && <ChatSystem userId={userId} />,
    settings: <SettingsView />
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading MahaTask...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout activeView={activeView} onViewChange={setActiveView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {views[activeView]}
        </motion.div>
      </AnimatePresence>
    </SidebarLayout>
  );
}

function SettingsView() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Configure your MahaTask experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">User ID: <code className="bg-background px-2 py-1 rounded text-xs">user_demo</code></p>
            <p className="text-muted-foreground">Theme: Dark Mode</p>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Preferences</h3>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Enable notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span>Show deadlines in calendar</span>
            </label>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold">About MahaTask</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>MahaTask is a modern academic task management dashboard designed for students and educators.</p>
            <p>Features include task management with categories, a powerful scheduler with multiple views, and real-time collaboration through study groups.</p>
            <p className="text-xs pt-2">Built with Next.js, shadcn/ui, and Framer Motion • Version 1.0</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
