'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { playZenSound } from '@/lib/sounds';

export function PomodoroSounds() {
  const { pomodoroState, sessions, settings } = useAppStore();
  const prevPomodoroState = useRef(pomodoroState);
  const prevSessionsLength = useRef(sessions.length);

  // Play sound on Start
  useEffect(() => {
    // If transitioning from idle/paused to running (focus/break)
    const wasIdleOrPaused =
      prevPomodoroState.current === 'idle' ||
      prevPomodoroState.current === 'paused';
    const isRunning =
      pomodoroState === 'focus' ||
      pomodoroState === 'shortBreak' ||
      pomodoroState === 'longBreak';

    if (wasIdleOrPaused && isRunning) {
      if (settings?.soundEnabled !== false) {
        playZenSound('start');
      }
    }

    prevPomodoroState.current = pomodoroState;
  }, [pomodoroState, settings]);

  // Play sound on Complete
  useEffect(() => {
    if (sessions.length > prevSessionsLength.current) {
        if (settings?.soundEnabled !== false) {
          playZenSound('complete');
        }
    }
    prevSessionsLength.current = sessions.length;
  }, [sessions, settings]);

  return null;
}
