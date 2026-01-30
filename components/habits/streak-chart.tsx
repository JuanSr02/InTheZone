'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

export function StreakChart() {
  const { habits, getHabitStreak, getHabitCompletionRate } = useAppStore();

  const habitStats = useMemo(() => {
    return habits
      .filter((h) => !h.archived)
      .map((habit) => {
        const streak = getHabitStreak(habit.id);
        const rate = getHabitCompletionRate(habit.id, 30);
        return {
          habit,
          ...streak,
          completionRate: rate,
        };
      })
      .sort((a, b) => b.current - a.current);
  }, [habits, getHabitStreak, getHabitCompletionRate]);

  const totalCurrentStreak = habitStats.reduce((acc, h) => acc + h.current, 0);
  const bestStreak = Math.max(...habitStats.map((h) => h.longest), 0);
  const avgCompletionRate =
    habitStats.length > 0
      ? habitStats.reduce((acc, h) => acc + h.completionRate, 0) /
        habitStats.length
      : 0;

  if (habits.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No habits yet</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Add habits to see your streaks here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="bg-warning/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Flame className="text-warning h-6 w-6" />
          </div>
          <p className="text-foreground text-2xl font-light">
            {totalCurrentStreak}
          </p>
          <p className="text-muted-foreground text-xs">Active Streaks</p>
        </div>
        <div className="text-center">
          <div className="bg-accent/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <Trophy className="text-accent h-6 w-6" />
          </div>
          <p className="text-foreground text-2xl font-light">{bestStreak}</p>
          <p className="text-muted-foreground text-xs">Best Streak</p>
        </div>
        <div className="text-center">
          <div className="bg-success/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <TrendingUp className="text-success h-6 w-6" />
          </div>
          <p className="text-foreground text-2xl font-light">
            {Math.round(avgCompletionRate)}%
          </p>
          <p className="text-muted-foreground text-xs">Avg Rate</p>
        </div>
      </div>

      {/* Individual Habit Streaks */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">
          Habit Streaks
        </h3>

        {habitStats.map(
          ({ habit, current, longest, completionRate }, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className="text-foreground text-sm font-medium">
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {current > 0 && (
                    <div
                      className={cn(
                        'flex items-center gap-1 text-sm',
                        current >= 7 ? 'text-warning' : 'text-muted-foreground'
                      )}
                    >
                      <Flame
                        className={cn(
                          'h-4 w-4',
                          current >= 7 && 'animate-pulse'
                        )}
                      />
                      <span className="font-medium">{current}</span>
                    </div>
                  )}
                  <span className="text-muted-foreground text-sm">
                    {Math.round(completionRate)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar with Glow */}
              <div className="bg-muted relative h-2 overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: habit.color }}
                />
                {completionRate >= 80 && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: habit.color,
                      filter: 'blur(4px)',
                      opacity: 0.5,
                    }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </div>

              {/* Streak Dots */}
              <div className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => {
                  const isFilled = i < current;
                  const isLongest = i < longest;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + i * 0.02 }}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        isFilled
                          ? 'bg-current'
                          : isLongest
                            ? 'bg-current opacity-20'
                            : 'bg-muted'
                      )}
                      style={{ color: habit.color }}
                    />
                  );
                })}
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
