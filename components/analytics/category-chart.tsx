'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Category } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';
import { Clock, Hash, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TimePeriod = 'today' | 'week' | 'month' | 'year';

export function CategoryChart() {
  const { sessions } = useAppStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const { data, stats } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 86400000);
    const thisMonth = new Date(now.getTime() - 30 * 86400000);
    const thisYear = new Date(now.getTime() - 365 * 86400000);

    // Filter sessions based on selected time period
    const filteredSessions = sessions.filter((session) => {
      if (session.type !== 'focus' || !session.completed || !session.category) {
        return false;
      }
      
      const sessionDate = new Date(session.startedAt);
      
      switch (timePeriod) {
        case 'today':
          return sessionDate >= today;
        case 'week':
          return sessionDate >= thisWeek;
        case 'month':
          return sessionDate >= thisMonth;
        case 'year':
          return sessionDate >= thisYear;
        default:
          return true;
      }
    });

    const categoryData: Record<string, { minutes: number; sessions: number }> = {};

    filteredSessions.forEach((session) => {
      const minutes = Math.round(session.duration / 60);
      const category = session.category!;
      if (!categoryData[category]) {
        categoryData[category] = { minutes: 0, sessions: 0 };
      }
      categoryData[category].minutes += minutes;
      categoryData[category].sessions += 1;
    });

    const totalMinutes = Object.values(categoryData).reduce((sum, cat) => sum + cat.minutes, 0);

    const chartData = Object.entries(categoryData)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: value.minutes,
        sessions: value.sessions,
        percentage: totalMinutes > 0 ? Math.round((value.minutes / totalMinutes) * 100) : 0,
        color: CATEGORY_COLORS[name as Category] || CATEGORY_COLORS.other,
        category: name as Category,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    const statsData = chartData.map((item) => ({
      category: item.category,
      minutes: item.value,
      sessions: item.sessions,
      percentage: item.percentage,
      avgSessionLength: Math.round(item.value / item.sessions),
    }));

    return { data: chartData, stats: statsData };
  }, [sessions, timePeriod]);

  return (
    <div className="space-y-6">
      {/* Time Period Filter */}
      <div className="flex justify-center">
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {data.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
          No category data available for this period
        </div>
      ) : (
        <>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="font-medium text-foreground">
                              {data.name}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <div>{data.value} minutes ({data.percentage}%)</div>
                            <div>{data.sessions} sessions</div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-3">
            {stats.map((stat, index) => {
              const Icon = CATEGORY_ICONS[stat.category];
              return (
                <motion.div
                  key={stat.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card/50 backdrop-blur-sm"
                  style={{
                    borderColor: `${CATEGORY_COLORS[stat.category]}30`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: `${CATEGORY_COLORS[stat.category]}20`,
                        color: CATEGORY_COLORS[stat.category],
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: CATEGORY_COLORS[stat.category] }}>
                        {CATEGORY_LABELS[stat.category]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.percentage}% of total time
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{stat.minutes}m</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Hash className="h-3.5 w-3.5" />
                      <span className="font-medium">{stat.sessions}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="font-medium">{stat.avgSessionLength}m avg</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
