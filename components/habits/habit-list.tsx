'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { Habit } from '@/lib/types';
import { HabitCard } from './habit-card';
import { HabitForm } from './habit-form';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function HabitList() {
  const { habits, completions } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const dayOfWeek = selectedDate.getDay();

  const activeHabits = useMemo(() => {
    return habits.filter((habit) => {
      if (habit.archived) return false;
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'custom' && habit.targetDays) {
        return habit.targetDays.includes(dayOfWeek);
      }
      return true;
    });
  }, [habits, dayOfWeek]);

  const completedIds = useMemo(() => {
    return new Set(
      completions.filter((c) => c.date === dateStr).map((c) => c.habitId)
    );
  }, [completions, dateStr]);

  const handlePrevDay = () => {
    setSelectedDate((d) => new Date(d.getTime() - 86400000));
  };

  const handleNextDay = () => {
    const tomorrow = new Date(selectedDate.getTime() + 86400000);
    if (tomorrow <= new Date()) {
      setSelectedDate(tomorrow);
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingHabit(null);
  };

  const isToday = dateStr === new Date().toISOString().split('T')[0];
  const completedCount = activeHabits.filter((h) =>
    completedIds.has(h.id)
  ).length;
  const totalCount = activeHabits.length;

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevDay}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <p className="text-foreground text-lg font-medium">
            {isToday
              ? 'Today'
              : selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                })}
          </p>
          <p className="text-muted-foreground text-sm">
            {selectedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextDay}
          disabled={isToday}
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="flex items-center justify-center gap-4">
          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
            <motion.div
              className="bg-accent h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <span className="text-muted-foreground text-sm">
            {completedCount}/{totalCount}
          </span>
        </div>
      )}

      {/* Habit Cards */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {activeHabits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 text-center"
            >
              <p className="text-muted-foreground">No habits for today</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Create your first habit to get started
              </p>
            </motion.div>
          ) : (
            activeHabits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <HabitCard
                  habit={habit}
                  date={dateStr}
                  isCompleted={completedIds.has(habit.id)}
                  onEdit={handleEdit}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Habit Button */}
      <Button
        onClick={() => setFormOpen(true)}
        className="w-full gap-2"
        variant="outline"
      >
        <Plus className="h-4 w-4" />
        Add Habit
      </Button>

      {/* Habit Form Dialog */}
      <HabitForm
        open={formOpen}
        onOpenChange={handleFormClose}
        editingHabit={editingHabit}
      />
    </div>
  );
}
