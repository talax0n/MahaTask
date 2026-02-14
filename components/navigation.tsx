'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckSquare, 
  Calendar, 
  MessageSquare, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar },
  { id: 'chat', label: 'Study Groups', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex flex-col gap-2 p-4 border-r border-border bg-background/50"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MahaTask
          </h1>
        </div>

        <div className="flex flex-col gap-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-background'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center py-2">
            Academic Dashboard
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/50">
        <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MahaTask
        </h1>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground hover:text-primary transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-b border-border bg-background/50 p-4 flex flex-col gap-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-background'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </motion.nav>
      )}
    </>
  );
}
