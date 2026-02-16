'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Play, Pause, RotateCcw, SkipForward, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/lib/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/constants';

export function LiquidTimer() {
  const {
    pomodoroState,
    timeRemaining,
    currentSessionType,
    completedSessions,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipToNext,
    tick,
    selectedCategory,
    setSelectedCategory,
    resetSessions,
    updateSettings,
  } = useAppStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Timer tick effect
  useEffect(() => {
    if (pomodoroState !== 'idle' && pomodoroState !== 'paused') {
      intervalRef.current = setInterval(tick, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoroState, tick]);

  // Interactive time adjustment handlers
  const handleTimeAdjustment = (clientX: number, clientY: number) => {
    if (!timerRef.current || pomodoroState !== 'idle') return;

    const rect = timerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle from center
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Normalize angle to 0-360, starting from top (270 degrees)
    angle = (angle + 90 + 360) % 360;
    
    // Convert angle to time (0-360 degrees = 0-max duration)
    const maxDuration = currentSessionType === 'focus' 
      ? settings.focusDuration 
      : currentSessionType === 'shortBreak'
        ? settings.shortBreakDuration
        : settings.longBreakDuration;
    
    const newMinutes = Math.round((angle / 360) * maxDuration);
    const clampedMinutes = Math.max(1, Math.min(maxDuration, newMinutes));
    
    // Update settings based on session type
    if (currentSessionType === 'focus') {
      updateSettings({ focusDuration: clampedMinutes });
    } else if (currentSessionType === 'shortBreak') {
      updateSettings({ shortBreakDuration: clampedMinutes });
    } else {
      updateSettings({ longBreakDuration: clampedMinutes });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pomodoroState === 'idle') {
      setIsDragging(true);
      handleTimeAdjustment(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleTimeAdjustment(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (pomodoroState === 'idle' && e.touches.length > 0) {
      setIsDragging(true);
      handleTimeAdjustment(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleTimeAdjustment(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Calculate progress
  const totalSeconds =
    currentSessionType === 'focus'
      ? settings.focusDuration * 60
      : currentSessionType === 'shortBreak'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;

  const progress = 1 - timeRemaining / totalSeconds;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isActive = pomodoroState !== 'idle' && pomodoroState !== 'paused';
  const isPaused = pomodoroState === 'paused';

  const sessionLabel =
    currentSessionType === 'focus'
      ? 'Focus'
      : currentSessionType === 'shortBreak'
        ? 'Short Break'
        : 'Long Break';

  const sessionColor =
    currentSessionType === 'focus'
      ? 'from-accent/30 to-accent/10'
      : currentSessionType === 'shortBreak'
        ? 'from-success/30 to-success/10'
        : 'from-warning/30 to-warning/10';

  const accentColor =
    currentSessionType === 'focus'
      ? 'text-accent'
      : currentSessionType === 'shortBreak'
        ? 'text-success'
        : 'text-warning';


  return (
    <div className="flex flex-col items-center justify-center gap-12 py-8">
      {/* Session Type Label */}
      <motion.div
        key={currentSessionType}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span
          className={cn(
            'text-sm font-medium tracking-widest uppercase',
            accentColor
          )}
        >
          {sessionLabel}
        </span>
        {currentSessionType === 'focus' ? (
          <>
            <p className="text-muted-foreground mt-1 text-xs">
              Session {(completedSessions % settings.sessionsUntilLongBreak) + 1} of {settings.sessionsUntilLongBreak}
            </p>
            {(completedSessions % settings.sessionsUntilLongBreak) > 0 && (
              <button
                onClick={() => {
                  if (confirm('Reset to session 1?')) {
                    resetSessions();
                  }
                }}
                className="text-muted-foreground hover:text-warning mt-2 flex items-center gap-1 text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Sessions</span>
              </button>
            )}
          </>
        ) : (
          <p className="text-muted-foreground mt-1 text-xs">
            {currentSessionType === 'longBreak' ? 'Long Break Time' : 'Rest Time'}
          </p>
        )}
      </motion.div>

      {/* Category Selector */}


      {/* Liquid Timer Visual */}
      <div className="relative">
        {/* Outer Ring */}
        <div 
          ref={timerRef}
          className={cn(
            "border-border/50 relative h-64 w-64 rounded-full border transition-all",
            pomodoroState === 'idle' && "cursor-pointer hover:border-accent/50"
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          title={pomodoroState === 'idle' ? 'Click and drag to adjust time' : undefined}
        >
          {/* Liquid Fill */}
          <div className="bg-card absolute inset-2 overflow-hidden rounded-full">
            <motion.div
              className={cn('absolute inset-0 bg-gradient-to-t', sessionColor)}
              initial={false}
              animate={{
                clipPath: `inset(${(1 - progress) * 100}% 0 0 0)`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />

            {/* Wave Animation */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                  style={{
                    clipPath: `inset(${(1 - progress) * 100}% 0 0 0)`,
                  }}
                >
                  <svg
                    className="absolute w-full"
                    style={{
                      top: `${(1 - progress) * 100}%`,
                      transform: 'translateY(-50%)',
                    }}
                    viewBox="0 0 200 20"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M0,10 C40,0 60,20 100,10 C140,0 160,20 200,10 L200,20 L0,20 Z"
                      fill="currentColor"
                      className={cn(
                        currentSessionType === 'focus'
                          ? 'text-accent/20'
                          : currentSessionType === 'shortBreak'
                            ? 'text-success/20'
                            : 'text-warning/20'
                      )}
                      animate={{
                        d: [
                          'M0,10 C40,0 60,20 100,10 C140,0 160,20 200,10 L200,20 L0,20 Z',
                          'M0,10 C40,20 60,0 100,10 C140,20 160,0 200,10 L200,20 L0,20 Z',
                          'M0,10 C40,0 60,20 100,10 C140,0 160,20 200,10 L200,20 L0,20 Z',
                        ],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: 'easeInOut',
                      }}
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={timeRemaining}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                className="text-foreground font-mono text-5xl font-light tracking-tight"
              >
                {String(minutes).padStart(2, '0')}:
                {String(seconds).padStart(2, '0')}
              </motion.span>
            </div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 256 256">
            <circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/30"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="124"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={cn(
                currentSessionType === 'focus'
                  ? 'text-accent'
                  : currentSessionType === 'shortBreak'
                    ? 'text-success'
                    : 'text-warning'
              )}
              initial={false}
              animate={{
                strokeDasharray: `${progress * 779} 779`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
        </div>

        {/* Breathing Glow Effect */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'absolute inset-0 -z-10 rounded-full blur-3xl',
                currentSessionType === 'focus'
                  ? 'bg-accent/10'
                  : currentSessionType === 'shortBreak'
                    ? 'bg-success/10'
                    : 'bg-warning/10'
              )}
            >
              <motion.div
                className="h-full w-full rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={resetTimer}
          className="text-muted-foreground hover:text-foreground h-12 w-12 rounded-full"
          aria-label="Reset timer"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          onClick={
            pomodoroState === 'idle'
              ? startTimer
              : isPaused
                ? resumeTimer
                : pauseTimer
          }
          className={cn(
            'h-16 w-16 rounded-full transition-colors',
            currentSessionType === 'focus'
              ? 'bg-accent hover:bg-accent/90'
              : currentSessionType === 'shortBreak'
                ? 'bg-success hover:bg-success/90'
                : 'bg-warning hover:bg-warning/90',
            'text-primary-foreground'
          )}
          aria-label={isActive ? 'Pause timer' : 'Start timer'}
        >
          {isActive ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="ml-1 h-6 w-6" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skipToNext}
          className="text-muted-foreground hover:text-foreground h-12 w-12 rounded-full"
          aria-label="Skip to next session"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Category Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 justify-center max-w-md"
      >
        {(Object.keys(CATEGORY_COLORS) as Category[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const isSelected = selectedCategory === category;

          return (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              disabled={isActive}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                'border backdrop-blur-sm',
                isSelected ? 'bg-background/80' : 'bg-background/30',
                isActive && 'cursor-not-allowed opacity-50'
              )}
              style={{
                color: isSelected ? CATEGORY_COLORS[category] : '#6B7280',
                borderColor: isSelected ? CATEGORY_COLORS[category] : 'transparent',
              }}
              animate={{
                scale: isSelected ? 1 : 0.85,
                opacity: isSelected ? 1 : 0.6,
              }}
              whileHover={!isActive ? {
                scale: isSelected ? 1.05 : 0.9,
                opacity: 1,
              } : {}}
              whileTap={!isActive ? { scale: 0.95 } : {}}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
              }}
            >
              <Icon className="h-3 w-3" />
              {isSelected && <span>{CATEGORY_LABELS[category]}</span>}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
