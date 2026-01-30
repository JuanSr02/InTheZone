'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { AppState } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Timer, ListTodo, BarChart3 } from 'lucide-react';

const NAV_ITEMS: Array<{
  id: AppState['activeTab'];
  label: string;
  icon: typeof Timer;
}> = [
  { id: 'timer', label: 'InTheZone', icon: Timer },
  { id: 'habits', label: 'Habits', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="border-border bg-background/80 fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-lg">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-6 py-2 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="bg-accent/10 absolute inset-0 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className="relative h-5 w-5" />
                <span className="relative text-xs font-medium">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
