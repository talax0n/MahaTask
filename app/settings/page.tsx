'use client';

import { motion } from 'framer-motion';

export default function SettingsPage() {
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
