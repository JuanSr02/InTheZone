'use client';

import { useMemo, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type TimePeriod = 'week' | 'month' | 'year';

const DURATION_RANGES = [
  { label: '0-15m', min: 0, max: 15 },
  { label: '15-30m', min: 15, max: 30 },
  { label: '30-45m', min: 30, max: 45 },
  { label: '45-60m', min: 45, max: 60 },
  { label: '60m+', min: 60, max: Infinity },
];

export function SessionDurationChart() {
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

    // Group by duration ranges
    const rangeCounts = DURATION_RANGES.map(range => {
      const count = filteredSessions.filter(session => {
        const minutes = Math.round(session.duration / 60);
        return minutes >= range.min && minutes < range.max;
      }).length;
      
      return {
        ...range,
        count,
      };
    });

    const maxCount = Math.max(...rangeCounts.map(r => r.count), 1);
    const totalSessions = filteredSessions.length;
    const avgDuration = totalSessions > 0
      ? Math.round(filteredSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions / 60)
      : 0;

    return {
      rangeCounts,
      maxCount,
      totalSessions,
      avgDuration,
    };
  }, [sessions, timePeriod]);

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

      {data.totalSessions === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
          No session data available for this period
        </div>
      ) : (
        <>
          <div className="h-[200px] w-full">
            <div className="flex h-full items-end justify-between gap-3 pb-6">
              {data.rangeCounts.map((range, i) => {
                const heightPercentage = Math.max((range.count / data.maxCount) * 100, 4);
                const percentage = data.totalSessions > 0 
                  ? Math.round((range.count / data.totalSessions) * 100) 
                  : 0;
                
                return (
                  <div key={range.label} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                    <div className="relative w-full flex-1 flex items-end justify-center">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercentage}%` }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
                        className={cn(
                          "w-full max-w-[80px] rounded-t-md opacity-80 transition-opacity hover:opacity-100",
                          range.count > 0 ? "bg-accent" : "bg-muted/30"
                        )}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-[100%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
                        {range.count} sessions ({percentage}%)
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {range.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Average Duration */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Average session:</span>
            <span className="font-medium text-accent">
              {data.avgDuration} minutes
            </span>
          </div>
        </>
      )}
    </div>
  );
}
