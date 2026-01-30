'use client';

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { Habit } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Check,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  habit: Habit;
  date: string;
  isCompleted: boolean;
  onEdit: (habit: Habit) => void;
}

export function HabitCard({
  habit,
  date,
  isCompleted,
  onEdit,
}: HabitCardProps) {
  const { toggleHabitCompletion, deleteHabit, archiveHabit, getHabitStreak } =
    useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const streak = getHabitStreak(habit.id);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.2)', 'rgba(0, 0, 0, 0)', 'rgba(34, 197, 94, 0.2)']
  );
  const checkScale = useTransform(x, [0, 100], [0, 1]);
  const deleteScale = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = () => {
    setIsDragging(false);
    const currentX = x.get();
    if (currentX > 80) {
      toggleHabitCompletion(habit.id, date);
    } else if (currentX < -80) {
      deleteHabit(habit.id);
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg"
      style={{ background }}
    >
      {/* Swipe Indicators */}
      <div className="absolute inset-y-0 left-4 flex items-center">
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 className="text-destructive h-5 w-5" />
        </motion.div>
      </div>
      <div className="absolute inset-y-0 right-4 flex items-center">
        <motion.div style={{ scale: checkScale }}>
          <Check className="text-success h-5 w-5" />
        </motion.div>
      </div>

      {/* Card Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          'bg-card relative flex items-center gap-4 rounded-lg border p-4 transition-colors',
          isCompleted && 'border-success/30 bg-success/5'
        )}
      >
        {/* Completion Toggle */}
        <button
          type="button"
          onClick={() => !isDragging && toggleHabitCompletion(habit.id, date)}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            isCompleted
              ? 'border-success bg-success text-success-foreground'
              : 'border-border hover:border-muted-foreground'
          )}
          style={{ borderColor: isCompleted ? undefined : habit.color }}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Habit Info */}
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'text-foreground font-medium transition-opacity',
              isCompleted && 'line-through opacity-60'
            )}
          >
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-muted-foreground mt-0.5 truncate text-sm">
              {habit.description}
            </p>
          )}
        </div>

        {/* Streak Badge */}
        {streak.current > 0 && (
          <div className="bg-warning/10 flex items-center gap-1.5 rounded-full px-2.5 py-1">
            <Flame
              className={cn(
                'h-4 w-4',
                streak.current >= 7 ? 'text-warning' : 'text-warning/70'
              )}
            />
            <span className="text-warning text-sm font-medium">
              {streak.current}
            </span>
          </div>
        )}

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-8 w-8 shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(habit)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => archiveHabit(habit.id)}>
              <Archive className="mr-2 h-4 w-4" />
              {habit.archived ? 'Unarchive' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteHabit(habit.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.div>
  );
}
