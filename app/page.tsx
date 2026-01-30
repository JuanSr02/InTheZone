'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Header } from '@/components/navigation/header';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { LiquidTimer } from '@/components/pomodoro/liquid-timer';
import { HabitList } from '@/components/habits/habit-list';
import { AnalyticsView } from '@/components/analytics/analytics-view';
import { PomodoroNotification } from '@/components/pomodoro/pomodoro-notification';
import { PomodoroTitle } from '@/components/pomodoro/pomodoro-title';
import { PomodoroSounds } from '@/components/pomodoro/pomodoro-sounds';

export default function Home() {
  const { activeTab, isDarkMode } = useAppStore();

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="bg-background min-h-screen">
      <PomodoroNotification />
      <PomodoroTitle />
      <PomodoroSounds />
      <Header />

      <main className="mx-auto max-w-lg px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <LiquidTimer />
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="py-6"
            >
              <HabitList />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
