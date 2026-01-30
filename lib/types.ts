import { z } from 'zod';

// Pomodoro Types
export const PomodoroStateSchema = z.enum([
  'idle',
  'focus',
  'shortBreak',
  'longBreak',
  'paused',
]);

export type PomodoroState = z.infer<typeof PomodoroStateSchema>;

export const PomodoroSessionSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  duration: z.number().int().positive(), // in seconds
  type: z.enum(['focus', 'shortBreak', 'longBreak']),
  completed: z.boolean(),
});

export type PomodoroSession = z.infer<typeof PomodoroSessionSchema>;

export const PomodoroSettingsSchema = z.object({
  focusDuration: z.number().int().min(1).max(120).default(25), // minutes
  shortBreakDuration: z.number().int().min(1).max(30).default(5),
  longBreakDuration: z.number().int().min(1).max(60).default(15),
  sessionsUntilLongBreak: z.number().int().min(1).max(10).default(4),
  soundEnabled: z.boolean().default(true),
});

export type PomodoroSettings = z.infer<typeof PomodoroSettingsSchema>;

// Habit Types
export const HabitFrequencySchema = z.enum(['daily', 'weekly', 'custom']);

export type HabitFrequency = z.infer<typeof HabitFrequencySchema>;

export const HabitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  frequency: HabitFrequencySchema,
  targetDays: z.array(z.number().int().min(0).max(6)).optional(), // 0 = Sunday
  createdAt: z.string().datetime(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#3B82F6'),
  archived: z.boolean().default(false),
});

export type Habit = z.infer<typeof HabitSchema>;

export const HabitCompletionSchema = z.object({
  id: z.string().uuid(),
  habitId: z.string().uuid(),
  completedAt: z.string().datetime(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export type HabitCompletion = z.infer<typeof HabitCompletionSchema>;

// Form Schemas
export const CreateHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  frequency: HabitFrequencySchema,
  targetDays: z.array(z.number().int().min(0).max(6)).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color')
    .default('#3B82F6'),
});

export type CreateHabitInput = z.infer<typeof CreateHabitSchema>;

// Analytics Types
export interface DayData {
  date: string;
  focusMinutes: number;
  sessionsCompleted: number;
  habitsCompleted: number;
  totalHabits: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

// App State
export interface AppState {
  // Pomodoro
  pomodoroState: PomodoroState;
  timeRemaining: number; // in seconds
  currentSessionType: 'focus' | 'shortBreak' | 'longBreak';
  completedSessions: number;
  sessions: PomodoroSession[];
  settings: PomodoroSettings;

  // Habits
  habits: Habit[];
  completions: HabitCompletion[];

  // UI
  activeTab: 'timer' | 'habits' | 'analytics';
  isDarkMode: boolean;
}
