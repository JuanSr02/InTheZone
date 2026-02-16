'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

function YAxis({ maxMinutes, timeUnit }: { maxMinutes: number; timeUnit: 'minutes' | 'hours' }) {
  // Always show at least some range
  const max = Math.max(maxMinutes, 60);

  return (
    <div className="flex h-full flex-col justify-between pb-6 pt-4 text-[10px] text-muted-foreground w-8 text-right pr-1">
      <div className="leading-none">{formatTime(max, timeUnit)}</div>
      <div className="leading-none">{formatTime(Math.round(max / 2), timeUnit)}</div>
      <div className="leading-none">{timeUnit === 'hours' ? '0h' : '0m'}</div>
    </div>
  );
}

function formatTime(minutes: number, timeUnit: 'minutes' | 'hours' = 'minutes'): string {
  if (timeUnit === 'hours') {
    const hours = (minutes / 60).toFixed(1);
    return `${hours.endsWith('.0') ? parseInt(hours) : hours}h`;
  }
  return `${minutes}m`;
}

export function FocusChart() {
  const { getFocusDataForDate, sessions } = useAppStore();
  const [view, setView] = useState<'week' | 'month' | 'year'>('week');
  const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours'>('minutes');

  // Year View (Heatmap) Data
  const yearData = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Start from the beginning of the week
    const startDate = new Date(oneYearAgo);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: Array<Array<{ date: string; minutes: number; intensity: number }>> = [];
    const monthLabels: Array<{ month: string; weekIndex: number }> = [];
    let currentWeek: Array<{ date: string; minutes: number; intensity: number }> = [];
    let lastMonth = -1;
    let totalMinutes = 0;
    let activeDays = 0;
    
    // For average calculation
    const current = new Date(startDate);
    let weekIndex = 0;

    // Use a loop that is safe
    const maxIterations = 400; // > 365 days
    let iterations = 0;

    while (current <= today && iterations < maxIterations) {
      iterations++;
      const dateStr = current.toISOString().split('T')[0];
      const data = getFocusDataForDate(dateStr);
      const intensity = getIntensity(data.minutes);

      if (data.minutes > 0) {
        totalMinutes += data.minutes;
        activeDays++;
      }

      currentWeek.push({
        date: dateStr,
        minutes: data.minutes,
        intensity,
      });

      // Track month changes
      const month = current.getMonth();
      if (month !== lastMonth && currentWeek.length === 1) {
        monthLabels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
      }

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      current.setDate(current.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return {
      weeks,
      monthLabels,
      stats: {
        totalHours: Math.round(totalMinutes / 60),
        activeDays,
        avgPerDay: activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0,
      },
    };
  }, [getFocusDataForDate, sessions]);

  // Week View Data (Bar Chart)
  const weekData = useMemo(() => {
    const today = new Date();
    const days = [];
    let maxMinutes = 0;
    let totalMinutes = 0;

    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = DAYS[date.getDay()];
      const { minutes } = getFocusDataForDate(dateStr);
      
      maxMinutes = Math.max(maxMinutes, minutes);
      totalMinutes += minutes;
      
      days.push({
        date: dateStr,
        label: i === 0 ? 'Today' : dayName,
        minutes,
      });
    }

    // Ensure chart has some height even if empty
    if (maxMinutes === 0) maxMinutes = 60;

    return { days, maxMinutes, totalHours: Math.round(totalMinutes / 60) };
  }, [getFocusDataForDate, sessions]);

  // Month View Data (Bar Chart)
  const monthData = useMemo(() => {
    const today = new Date();
    const days = [];
    let maxMinutes = 0;
    let totalMinutes = 0;

    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const { minutes } = getFocusDataForDate(dateStr);
      
      maxMinutes = Math.max(maxMinutes, minutes);
      totalMinutes += minutes;
      
      days.push({
        date: dateStr,
        label: date.getDate().toString(),
        minutes,
      });
    }
    
    // Ensure chart has some height even if empty
    if (maxMinutes === 0) maxMinutes = 60;

    return { days, maxMinutes, totalHours: Math.round(totalMinutes / 60) };
  }, [getFocusDataForDate, sessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Tabs value={view} onValueChange={(v) => setView(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Time Unit Toggle */}
        <Tabs value={timeUnit} onValueChange={(v) => setTimeUnit(v as any)} className="w-auto">
          <TabsList className="h-9">
            <TabsTrigger value="minutes" className="text-xs px-3">Min</TabsTrigger>
            <TabsTrigger value="hours" className="text-xs px-3">Hrs</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="h-[200px] w-full">
         {/* Year View (Heatmap) */}
         {view === 'year' && (
           <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto pb-2 h-full flex flex-col justify-center"
           >
              <div className="min-w-max">
                {/* Month Labels */}
                <div className="mb-2 ml-8 flex">
                  {yearData.monthLabels.map((label, i) => (
                    <div
                      key={`${label.month}-${i}`}
                      className="text-muted-foreground text-xs"
                      style={{
                        marginLeft: i === 0 ? `${label.weekIndex * 14}px` : undefined,
                        width:
                          i < yearData.monthLabels.length - 1
                            ? `${(yearData.monthLabels[i + 1].weekIndex - label.weekIndex) * 14}px`
                            : 'auto',
                      }}
                    >
                      {label.month}
                    </div>
                  ))}
                </div>

                <div className="flex gap-1">
                  {/* Day Labels */}
                  <div className="flex flex-col gap-1 pr-2">
                    {DAYS.map((day, i) => (
                      <div
                        key={day}
                        className={cn(
                          'text-muted-foreground flex h-3 items-center text-xs',
                          i % 2 === 1 ? 'opacity-0' : ''
                        )}
                      >
                        {day.slice(0, 1)}
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="flex gap-1">
                    {yearData.weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-1">
                        {week.map((day, dayIndex) => (
                          <motion.div
                            key={day.date}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: (weekIndex * 7 + dayIndex) * 0.001,
                              duration: 0.2,
                            }}
                            className={cn(
                              'h-3 w-3 rounded-sm transition-colors',
                              day.intensity === 0 && 'bg-muted/50',
                              day.intensity === 1 && 'bg-accent/20',
                              day.intensity === 2 && 'bg-accent/40',
                              day.intensity === 3 && 'bg-accent/60',
                              day.intensity === 4 && 'bg-accent'
                            )}
                            title={`${day.date}: ${day.minutes} minutes`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
           </motion.div>
         )}
         
         {/* Week View (Bar Chart) */}
         {view === 'week' && (
            <div className="flex h-full items-end gap-2">
              <YAxis maxMinutes={weekData.maxMinutes} timeUnit={timeUnit} />
              <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="flex h-full flex-1 items-end justify-between gap-2 pt-4"
              >
                {weekData.days.map((day) => {
                   const heightPercentage = Math.max((day.minutes / weekData.maxMinutes) * 100, 4); // Min 4% height
                   return (
                     <div key={day.date} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                        <div className="relative w-full flex-1 flex items-end justify-center">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercentage}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className={cn(
                              "w-full max-w-[40px] rounded-t-md opacity-80 transition-opacity hover:opacity-100",
                              day.minutes > 0 ? "bg-accent" : "bg-muted/30"
                            )}
                          />
                          {/* Tooltip */}
                          <div className="absolute bottom-[100%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
                            {formatTime(day.minutes, timeUnit)}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{day.label}</span>
                     </div>
                   );
                })}
              </motion.div>
            </div>
         )}

         {/* Month View (Bar Chart) */}
         {view === 'month' && (
            <div className="flex h-full items-end gap-2">
              <YAxis maxMinutes={monthData.maxMinutes} timeUnit={timeUnit} />
              <motion.div 
               initial={{ opacity: 0, y: 10 }} 
               animate={{ opacity: 1, y: 0 }}
               className="flex h-full flex-1 items-end justify-between gap-[2px] pt-4"
              >
                {monthData.days.map((day, i) => {
                   const heightPercentage = Math.max((day.minutes / monthData.maxMinutes) * 100, 4);
                   // Only show some labels to avoid clutter
                   const showLabel = i % 5 === 0 || i === monthData.days.length - 1;
                   
                   return (
                     <div key={day.date} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group">
                        <div className="relative w-full flex-1 flex items-end justify-center">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercentage}%` }}
                            transition={{ delay: i * 0.01 }}
                            className={cn(
                              "w-full rounded-t-sm opacity-80 transition-opacity hover:opacity-100",
                              day.minutes > 0 ? "bg-accent" : "bg-muted/30"
                            )}
                          />
                           {/* Tooltip */}
                          <div className="absolute bottom-[100%] mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow-sm border">
                            {day.date}: {formatTime(day.minutes, timeUnit)}
                          </div>
                        </div>
                        <div className="h-4 relative w-full flex justify-center">
                          {showLabel && (
                            <span className="absolute text-[10px] text-muted-foreground">{day.label}</span>
                          )}
                        </div>
                     </div>
                   );
                })}
              </motion.div>
            </div>
         )}
      </div>
      
      {/* Legend for Heatmap */}
      {view === 'year' && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-muted-foreground text-xs">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-3 w-3 rounded-sm',
                  level === 0 && 'bg-muted/50',
                  level === 1 && 'bg-accent/20',
                  level === 2 && 'bg-accent/40',
                  level === 3 && 'bg-accent/60',
                  level === 4 && 'bg-accent'
                )}
              />
            ))}
            <span className="text-muted-foreground text-xs">More</span>
          </div>
      )}
    </div>
  );
}
