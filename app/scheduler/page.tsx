'use client';

import { useState, useEffect } from 'react';
import { Scheduler } from '@/components/scheduler';
import { Loader2 } from 'lucide-react';

export default function SchedulerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize or get user ID - for demo purposes, we'll use a fixed ID
    const demoUserId = 'user_demo_' + Math.random().toString(36).substr(2, 9);
    setUserId(demoUserId);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scheduler...</p>
        </div>
      </div>
    );
  }

  return userId && <Scheduler userId={userId} />;
}
