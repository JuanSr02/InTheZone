'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeeklyComparisonChart() {
  const { sessions } = useAppStore();

  const data = useMemo(() => {
    const now = new Date();
    const weeks: Array<{
      label: string;
      days: Array<{ day: string; minutes: number }>;
      total: number;
    }> = [];

    // Get last 4 weeks
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (weekOffset * 7));
      
      const weekDays = [];
      let weekTotal = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + dayOffset);
        const dateStr = date.toISOString().split('T')[0];
        
        const daySessions = sessions.filter(
          (s) => s.type === 'focus' && s.completed && s.startedAt.split('T')[0] === dateStr
        );
        
        const minutes = Math.round(
          daySessions.reduce((sum, s) => sum + s.duration, 0) / 60
        );
        
        weekTotal += minutes;
        weekDays.push({
          day: DAYS[dayOffset],
          minutes,
        });
      }

      const weekLabel = weekOffset === 0 
        ? 'This Week' 
        : weekOffset === 1 
          ? 'Last Week' 
          : `${weekOffset + 1} Weeks Ago`;

      weeks.unshift({
        label: weekLabel,
        days: weekDays,
        total: weekTotal,
      });
    }

    const maxMinutes = Math.max(
      ...weeks.flatMap(w => w.days.map(d => d.minutes)),
      60
    );

    return { weeks, maxMinutes };
  }, [sessions]);

  const colors = [
    'bg-chart-1',
    'bg-chart-2', 
    'bg-chart-3',
    'bg-accent',
  ];

  return (
    <div className="space-y-4">
      {data.weeks.every(w => w.total === 0) ? (
        <div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
          No weekly data available
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="h-[200px] w-full overflow-x-auto">
            <div className="min-w-[600px] h-full flex items-end gap-6 pb-6">
              {data.weeks.map((week, weekIndex) => (
                <div key={week.label} className="flex-1 flex flex-col gap-2 h-full">
                  {/* Week Label */}
                  <div className="text-xs font-medium text-muted-foreground text-center">
                    {week.label}
                  </div>
                  
                  {/* Days */}
                  <div className="flex-1 flex items-end justify-between gap-1">
                    {week.days.map((day, dayIndex) => {
                      const heightPercentage = Math.max((day.minutes / data.maxMinutes) * 100, 2);
                      
                      return (
                        <div key={day.day} className="flex flex-1 flex-col items-center gap-1 h-full justify-end group">
                          <div className="relative w-full flex-1 flex items-end justify-center">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercentage}%` }}
                              transition={{ 
                                delay: (weekIndex * 7 + dayIndex) * 0.02,
                                type: 'spring',
                                stiffness: 300,
                                damping: 30 
                              }}
                              className={cn(
                                "w-full rounded-t-sm opacity-70 transition-opacity hover:opacity-100",
                                day.minutes > 0 ? colors[weekIndex] : "bg-muted/30"
                              )}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-[100%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
                              {day.minutes}m
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {day.day[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Week Total */}
                  <div className="text-xs text-center font-medium text-foreground">
                    {Math.round(week.total / 60)}h {week.total % 60}m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {data.weeks.map((week, i) => (
              <div key={week.label} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-sm", colors[i])} />
                <span className="text-xs text-muted-foreground">{week.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
