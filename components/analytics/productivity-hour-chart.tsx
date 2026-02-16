'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type TimePeriod = 'week' | 'month' | 'year';

export function ProductivityHourChart() {
  const { sessions } = useAppStore();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');

  const data = useMemo(() => {
    const now = new Date();
    const thisWeek = new Date(now.getTime() - 7 * 86400000);
    const thisMonth = new Date(now.getTime() - 30 * 86400000);
    const thisYear = new Date(now.getTime() - 365 * 86400000);

    // Filter sessions based on time period
    const filteredSessions = sessions.filter((session) => {
      if (session.type !== 'focus' || !session.completed) return false;
      const sessionDate = new Date(session.startedAt);
      
      switch (timePeriod) {
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

    // Group by hour (0-23)
    const hourData: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourData[i] = 0;
    }

    filteredSessions.forEach((session) => {
      const hour = new Date(session.startedAt).getHours();
      hourData[hour] += Math.round(session.duration / 60);
    });

    const maxMinutes = Math.max(...Object.values(hourData), 60);
    const peakHour = Object.entries(hourData).reduce((max, [hour, minutes]) => 
      minutes > hourData[max] ? parseInt(hour) : max, 0
    );

    return {
      hourData,
      maxMinutes,
      peakHour,
      totalMinutes: Object.values(hourData).reduce((sum, m) => sum + m, 0),
    };
  }, [sessions, timePeriod]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}${ampm}`;
  };

  return (
    <div className="space-y-4">
      {/* Time Period Filter */}
      <div className="flex justify-center">
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {data.totalMinutes === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
          No productivity data available for this period
        </div>
      ) : (
        <div className="h-[200px] w-full">
          <div className="flex h-full items-end gap-[2px] overflow-x-auto pb-6">
            {Array.from({ length: 24 }, (_, i) => {
              const minutes = data.hourData[i];
              const heightPercentage = Math.max((minutes / data.maxMinutes) * 100, 2);
              const isPeak = i === data.peakHour && minutes > 0;
              
              return (
                <div key={i} className="flex flex-1 min-w-[20px] flex-col items-center gap-2 h-full justify-end group">
                  <div className="relative w-full flex-1 flex items-end justify-center">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercentage}%` }}
                      transition={{ delay: i * 0.02, type: 'spring', stiffness: 300, damping: 30 }}
                      className={cn(
                        "w-full rounded-t-sm opacity-80 transition-all hover:opacity-100",
                        minutes > 0 ? (isPeak ? "bg-warning" : "bg-accent") : "bg-muted/30"
                      )}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-[100%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
                      {formatHour(i)}: {minutes}m
                    </div>
                  </div>
                  {/* Show label every 3 hours */}
                  {i % 3 === 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {i}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Peak Hour Info */}
      {data.totalMinutes > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Peak hour:</span>
          <span className="font-medium text-warning">
            {formatHour(data.peakHour)} ({data.hourData[data.peakHour]}m)
          </span>
        </div>
      )}
    </div>
  );
}
