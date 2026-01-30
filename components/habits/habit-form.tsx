'use client';

import React from 'react';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import type { Habit, CreateHabitInput, HabitFrequency } from '@/lib/types';
import { CreateHabitSchema } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const COLORS = [
  '#3B82F6', // blue
  '#22C55E', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingHabit?: Habit | null;
}

export function HabitForm({
  open,
  onOpenChange,
  editingHabit,
}: HabitFormProps) {
  const { addHabit, updateHabit } = useAppStore();

  const [name, setName] = useState(editingHabit?.name ?? '');
  const [description, setDescription] = useState(
    editingHabit?.description ?? ''
  );
  const [frequency, setFrequency] = useState<HabitFrequency>(
    editingHabit?.frequency ?? 'daily'
  );
  const [targetDays, setTargetDays] = useState<number[]>(
    editingHabit?.targetDays ?? [1, 2, 3, 4, 5]
  );
  const [color, setColor] = useState(editingHabit?.color ?? COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: CreateHabitInput = {
      name,
      description: description || undefined,
      frequency,
      targetDays: frequency === 'custom' ? targetDays : undefined,
      color,
    };

    const result = CreateHabitSchema.safeParse(input);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingHabit) {
      updateHabit(editingHabit.id, result.data);
    } else {
      addHabit(result.data);
    }

    // Reset form
    setName('');
    setDescription('');
    setFrequency('daily');
    setTargetDays([1, 2, 3, 4, 5]);
    setColor(COLORS[0]);
    setErrors({});
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingHabit ? 'Edit Habit' : 'New Habit'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
              className={cn(errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-destructive text-sm">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a note..."
            />
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>Frequency</Label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'custom'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    frequency === freq
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                  )}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Target Days (for custom frequency) */}
          {frequency === 'custom' && (
            <div className="space-y-3">
              <Label>Target Days</Label>
              <div className="flex gap-1">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                      targetDays.includes(index)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          <div className="space-y-3">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    color === c && 'ring-offset-background ring-2 ring-offset-2'
                  )}
                  style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingHabit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
