'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  PomodoroState,
  PomodoroSession,
  PomodoroSettings,
  Habit,
  HabitCompletion,
  CreateHabitInput,
  Category,
} from './types';

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
};

interface AppActions {
  // Pomodoro Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  skipToNext: () => void;

  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  setSelectedCategory: (category: Category) => void;

  // Habit Actions
  addHabit: (input: CreateHabitInput) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  archiveHabit: (id: string) => void;

  // UI Actions
  setActiveTab: (tab: AppState['activeTab']) => void;
  toggleDarkMode: () => void;

  // Data
  getHabitStreak: (habitId: string) => { current: number; longest: number };
  getHabitCompletionRate: (habitId: string, days: number) => number;
  getFocusDataForDate: (date: string) => { minutes: number; sessions: number };
  getFocusStreak: () => { current: number; longest: number };
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial State
      pomodoroState: 'idle',
      timeRemaining: DEFAULT_SETTINGS.focusDuration * 60,
      currentSessionType: 'focus',
      completedSessions: 0,
      sessions: [],
      settings: DEFAULT_SETTINGS,
      habits: [],
      completions: [],
      activeTab: 'timer',

      isDarkMode: true,
      selectedCategory: 'work',

      // Pomodoro Actions
      startTimer: () => {
        const state = get();
        set({
          pomodoroState: state.currentSessionType as PomodoroState,
        });
      },

      pauseTimer: () => set({ pomodoroState: 'paused' }),

      resumeTimer: () => {
        const state = get();
        set({ pomodoroState: state.currentSessionType as PomodoroState });
      },

      resetTimer: () => {
        const state = get();
        const duration =
          state.currentSessionType === 'focus'
            ? state.settings.focusDuration
            : state.currentSessionType === 'shortBreak'
              ? state.settings.shortBreakDuration
              : state.settings.longBreakDuration;
        set({
          pomodoroState: 'idle',
          timeRemaining: duration * 60,
        });
      },

      tick: () => {
        const state = get();
        if (state.pomodoroState === 'idle' || state.pomodoroState === 'paused')
          return;

        if (state.timeRemaining <= 1) {
          get().completeSession();
        } else {
          set({ timeRemaining: state.timeRemaining - 1 });
        }
      },

      completeSession: () => {
        const state = get();
        const now = new Date().toISOString();

        const session: PomodoroSession = {
          id: crypto.randomUUID(),
          startedAt: new Date(
            Date.now() -
              (state.currentSessionType === 'focus'
                ? state.settings.focusDuration
                : state.currentSessionType === 'shortBreak'
                  ? state.settings.shortBreakDuration
                  : state.settings.longBreakDuration) *
                60 *
                1000
          ).toISOString(),
          endedAt: now,
          duration:
            (state.currentSessionType === 'focus'
              ? state.settings.focusDuration
              : state.currentSessionType === 'shortBreak'
                ? state.settings.shortBreakDuration
                : state.settings.longBreakDuration) * 60,
          type: state.currentSessionType,
          category: state.selectedCategory,
          completed: true,
        };

        const newCompletedSessions =
          state.currentSessionType === 'focus'
            ? state.completedSessions + 1
            : state.completedSessions;

        // Determine next session type
        let nextType: 'focus' | 'shortBreak' | 'longBreak';
        if (state.currentSessionType === 'focus') {
          nextType =
            newCompletedSessions % state.settings.sessionsUntilLongBreak === 0
              ? 'longBreak'
              : 'shortBreak';
        } else {
          nextType = 'focus';
        }

        const nextDuration =
          nextType === 'focus'
            ? state.settings.focusDuration
            : nextType === 'shortBreak'
              ? state.settings.shortBreakDuration
              : state.settings.longBreakDuration;

        set({
          sessions: [...state.sessions, session],
          completedSessions: newCompletedSessions,
          currentSessionType: nextType,
          timeRemaining: nextDuration * 60,
          pomodoroState: 'idle',
        });
      },

      skipToNext: () => {
        const state = get();
        let nextType: 'focus' | 'shortBreak' | 'longBreak';

        if (state.currentSessionType === 'focus') {
          nextType =
            (state.completedSessions + 1) %
              state.settings.sessionsUntilLongBreak ===
            0
              ? 'longBreak'
              : 'shortBreak';
        } else {
          nextType = 'focus';
        }

        const nextDuration =
          nextType === 'focus'
            ? state.settings.focusDuration
            : nextType === 'shortBreak'
              ? state.settings.shortBreakDuration
              : state.settings.longBreakDuration;

        set({
          currentSessionType: nextType,
          timeRemaining: nextDuration * 60,
          pomodoroState: 'idle',
        });
      },

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      updateSettings: (newSettings) => {
        const state = get();
        const settings = { ...state.settings, ...newSettings };
        set({ settings });

        // Update time remaining if idle
        if (state.pomodoroState === 'idle') {
          const duration =
            state.currentSessionType === 'focus'
              ? settings.focusDuration
              : state.currentSessionType === 'shortBreak'
                ? settings.shortBreakDuration
                : settings.longBreakDuration;
          set({ timeRemaining: duration * 60 });
        }
      },

      // Habit Actions
      addHabit: (input) => {
        const habit: Habit = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          archived: false,
        };
        set((state) => ({ habits: [...state.habits, habit] }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          completions: state.completions.filter((c) => c.habitId !== id),
        }));
      },

      toggleHabitCompletion: (habitId, date) => {
        const state = get();
        const existing = state.completions.find(
          (c) => c.habitId === habitId && c.date === date
        );

        if (existing) {
          set({
            completions: state.completions.filter((c) => c.id !== existing.id),
          });
        } else {
          const completion: HabitCompletion = {
            id: crypto.randomUUID(),
            habitId,
            completedAt: new Date().toISOString(),
            date,
          };
          set({ completions: [...state.completions, completion] });
        }
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archived: !h.archived } : h
          ),
        }));
      },

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Data Helpers
      getHabitStreak: (habitId) => {
        const state = get();
        const completions = state.completions
          .filter((c) => c.habitId === habitId)
          .map((c) => c.date)
          .sort()
          .reverse();

        if (completions.length === 0) return { current: 0, longest: 0 };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split('T')[0];

        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;

        // Calculate current streak
        if (completions[0] === today || completions[0] === yesterday) {
          let checkDate =
            completions[0] === today
              ? new Date()
              : new Date(Date.now() - 86400000);
          for (const dateStr of completions) {
            const expectedDate = checkDate.toISOString().split('T')[0];
            if (dateStr === expectedDate) {
              current++;
              checkDate = new Date(checkDate.getTime() - 86400000);
            } else {
              break;
            }
          }
        }

        // Calculate longest streak
        const sortedAsc = [...completions].sort();
        for (const dateStr of sortedAsc) {
          const date = new Date(dateStr);
          if (prevDate === null) {
            tempStreak = 1;
          } else {
            const diff = (date.getTime() - prevDate.getTime()) / 86400000;
            if (diff === 1) {
              tempStreak++;
            } else {
              longest = Math.max(longest, tempStreak);
              tempStreak = 1;
            }
          }
          prevDate = date;
        }
        longest = Math.max(longest, tempStreak);

        return { current, longest };
      },

      getHabitCompletionRate: (habitId, days) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return 0;

        const now = new Date();
        let completedDays = 0;
        let applicableDays = 0;

        for (let i = 0; i < days; i++) {
          const date = new Date(now.getTime() - i * 86400000);
          const dateStr = date.toISOString().split('T')[0];
          const dayOfWeek = date.getDay();

          // Check if this day applies based on frequency
          let applies = true;
          if (habit.frequency === 'custom' && habit.targetDays) {
            applies = habit.targetDays.includes(dayOfWeek);
          }

          if (applies) {
            applicableDays++;
            const completed = state.completions.some(
              (c) => c.habitId === habitId && c.date === dateStr
            );
            if (completed) completedDays++;
          }
        }

        return applicableDays > 0 ? (completedDays / applicableDays) * 100 : 0;
      },

      getFocusDataForDate: (date) => {
        const state = get();
        const daySessions = state.sessions.filter(
          (s) =>
            s.type === 'focus' &&
            s.completed &&
            s.startedAt.split('T')[0] === date
        );

        return {
          minutes: Math.round(
            daySessions.reduce((acc, s) => acc + s.duration, 0) / 60
          ),
          sessions: daySessions.length,
        };
      },

      getFocusStreak: () => {
        const state = get();
        // Get unique dates with completed focus sessions
        const sessionDates = [
          ...new Set(
            state.sessions
              .filter((s) => s.type === 'focus' && s.completed)
              .map((s) => s.startedAt.split('T')[0])
          ),
        ]
          .sort()
          .reverse();

        if (sessionDates.length === 0) return { current: 0, longest: 0 };

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split('T')[0];

        let current = 0;
        let longest = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;

        // Calculate current streak
        // Check if the most recent session was today or yesterday to keep streak alive
        if (sessionDates[0] === today || sessionDates[0] === yesterday) {
          let checkDate =
            sessionDates[0] === today
              ? new Date()
              : new Date(Date.now() - 86400000);
          
          for (const dateStr of sessionDates) {
            const expectedDate = checkDate.toISOString().split('T')[0];
            if (dateStr === expectedDate) {
              current++;
              checkDate = new Date(checkDate.getTime() - 86400000);
            } else {
              break;
            }
          }
        }

        // Calculate longest streak
        const sortedAsc = [...sessionDates].sort();
        for (const dateStr of sortedAsc) {
          const date = new Date(dateStr);
          if (prevDate === null) {
            tempStreak = 1;
          } else {
            const diff = (date.getTime() - prevDate.getTime()) / 86400000;
            // Allow for exactly 1 day difference (consecutive days)
            // Using Math.round to handle potential DST oddities if any, 
            // though 86400000 is usually safe for UTC-ish logic on whole dates
            if (Math.round(diff) === 1) {
              tempStreak++;
            } else {
              longest = Math.max(longest, tempStreak);
              tempStreak = 1;
            }
          }
          prevDate = date;
        }
        longest = Math.max(longest, tempStreak);

        return { current, longest };
      },
    }),
    {
      name: 'flow-state-storage',
    }
  )
);
