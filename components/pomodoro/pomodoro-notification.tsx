'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function PomodoroNotification() {
  const { sessions } = useAppStore();
  const prevSessionsLengthRef = useRef(sessions.length);

  // Request permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Monitor completed sessions to trigger notification
  useEffect(() => {
    // Only trigger if the number of sessions has increased
    if (sessions.length > prevSessionsLengthRef.current) {
      // Get the last completed session
      // Since sessions array is appended to, the last one should be the most recent
      const lastSession = sessions[sessions.length - 1];
      
      if (lastSession && 'Notification' in window && Notification.permission === 'granted') {
        let title = '';
        let body = '';
        const icon = '/icon.png'; // Assuming there is an icon, or fallback to default

        if (lastSession.type === 'focus') {
          title = 'Focus Session Complete!';
          body = 'Great work! Time for a break.';
        } else if (lastSession.type === 'shortBreak') {
          title = 'Break is Over!';
          body = 'Time to get back to focus.';
        } else if (lastSession.type === 'longBreak') {
          title = 'Long Break is Over!';
          body = 'Ready for another session?';
        }

        new Notification(title, {
          body,
          icon,
          silent: false,
        });
      }
    }
    
    prevSessionsLengthRef.current = sessions.length;
  }, [sessions]);

  return null;
}
