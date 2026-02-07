'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { FocusChart } from '@/components/pomodoro/focus-chart';
import { StreakChart } from '@/components/habits/streak-chart';
import { CategoryChart } from '@/components/analytics/category-chart';
import { Clock, Target, TrendingUp, Calendar, Zap, BarChart, Sun } from 'lucide-react';

export function AnalyticsView() {
  const { sessions, habits, completions, getFocusStreak } = useAppStore();

  const stats = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 86400000);
    const thisMonth = new Date(now.getTime() - 30 * 86400000);

    // Focus stats
    const focusSessions = sessions.filter(
      (s) => s.type === 'focus' && s.completed
    );
    const weekFocusSessions = focusSessions.filter(
      (s) => new Date(s.startedAt) >= thisWeek
    );
    const monthFocusSessions = focusSessions.filter(
      (s) => new Date(s.startedAt) >= thisMonth
    );

    const totalFocusHours = Math.round(
      focusSessions.reduce((acc, s) => acc + s.duration, 0) / 3600
    );
    const weekFocusHours = Math.round(
      weekFocusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    
    // Daily Average (Last 30 days)
    const monthFocusMinutes = Math.round(
      monthFocusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
    );
    const dailyAverage = Math.round(monthFocusMinutes / 30);

    // Streaks
    const streak = getFocusStreak();

    // Most Productive Hour
    const hourCounts: Record<number, number> = {};
    focusSessions.forEach(s => {
      const hour = new Date(s.startedAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    let bestHour = -1;
    let maxCount = 0;
    
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        bestHour = parseInt(hour);
      }
    });

    const formatHour = (h: number) => {
      if (h === -1) return "N/A";
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12} ${ampm}`;
    };

    // Habit stats
    const activeHabits = habits.filter((h) => !h.archived);
    const weekCompletions = completions.filter(
      (c) => new Date(c.completedAt) >= thisWeek
    );
    const monthCompletions = completions.filter(
      (c) => new Date(c.completedAt) >= thisMonth
    );

    // Calculate expected completions for the week
    let expectedWeekCompletions = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 86400000);
      const dayOfWeek = date.getDay();
      for (const habit of activeHabits) {
        if (habit.frequency === 'daily') {
          expectedWeekCompletions++;
        } else if (
          habit.frequency === 'custom' &&
          habit.targetDays?.includes(dayOfWeek)
        ) {
          expectedWeekCompletions++;
        } else if (habit.frequency === 'weekly') {
          expectedWeekCompletions += 1 / 7;
        }
      }
    }

    const weekHabitRate =
      expectedWeekCompletions > 0
        ? Math.round((weekCompletions.length / expectedWeekCompletions) * 100)
        : 0;

    return {
      totalFocusHours,
      weekFocusMinutes: weekFocusHours,
      totalSessions: focusSessions.length,
      weekSessions: weekFocusSessions.length,
      activeHabits: activeHabits.length,
      weekCompletions: weekCompletions.length,
      weekHabitRate,
      monthCompletions: monthCompletions.length,
      currStreak: streak.current,
      bestHour: formatHour(bestHour),
      dailyAverage
    };
  }, [sessions, habits, completions, getFocusStreak]);

  const mainStats = [
    {
      label: 'Focus This Week',
      value: `${stats.weekFocusMinutes}m`,
      sublabel: `${stats.weekSessions} sessions`,
      icon: Clock,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Total Focus',
      value: `${stats.totalFocusHours}h`,
      sublabel: `${stats.totalSessions} sessions`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Week Completion',
      value: `${stats.weekHabitRate}%`,
      sublabel: `${stats.weekCompletions} habits done`,
      icon: Target,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Active Habits',
      value: stats.activeHabits,
      sublabel: `${stats.monthCompletions} this month`,
      icon: Calendar,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10',
    },
  ];

  const secondaryStats = [
    {
      label: 'Current Streak',
      value: `${stats.currStreak} days`,
      sublabel: 'Consistent focus',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Daily Average',
      value: `${stats.dailyAverage}m`,
      sublabel: 'Last 30 days',
      icon: BarChart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Peak Hour',
      value: stats.bestHour,
      sublabel: 'Most productive',
      icon: Sun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-8 py-4">
      <div className="grid grid-cols-2 gap-4">
        {mainStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl border p-4"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-foreground text-2xl font-light">{stat.value}</p>
            <p className="text-muted-foreground text-xs">{stat.label}</p>
            <p className="text-muted-foreground/60 mt-1 text-xs">
              {stat.sublabel}
            </p>
          </motion.div>
        ))}
      </div>

     <div className="grid grid-cols-3 gap-4">
        {secondaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (index * 0.1) }}
            className="bg-card rounded-xl border p-4"
          >
            <div className={`mb-3 inline-flex rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-foreground text-lg font-light">{stat.value}</p>
            <p className="text-muted-foreground text-xs">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-muted-foreground text-sm font-medium">
          Focus Activity
        </h2>
        <div className="bg-card rounded-xl border p-4">
          <FocusChart />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-muted-foreground text-sm font-medium">
            Focus by Category
          </h2>
          <div className="bg-card rounded-xl border p-4">
            <CategoryChart />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h2 className="text-muted-foreground text-sm font-medium">
            Habit Streaks
          </h2>
          <div className="bg-card rounded-xl border p-4">
            <StreakChart />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
