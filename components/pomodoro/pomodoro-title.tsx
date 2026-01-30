'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function PomodoroTitle() {
  const { timeRemaining, currentSessionType } = useAppStore();

  useEffect(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    let sessionLabel = 'Focus';
    if (currentSessionType === 'shortBreak') sessionLabel = 'Short Break';
    else if (currentSessionType === 'longBreak') sessionLabel = 'Long Break';

    document.title = `${formattedTime} - ${sessionLabel}`;
  }, [timeRemaining, currentSessionType]);

  // Restore title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Productivity App';
    };
  }, []);

  return null;
}
