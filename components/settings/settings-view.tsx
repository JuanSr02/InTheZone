'use client';

import { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Clock, Coffee, Battery, Download, Upload, Database, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsView() {
  const { settings, updateSettings, isDarkMode, toggleDarkMode } =
    useAppStore();

  return (
    <div className="space-y-8 py-4">
      <h2 className="text-foreground text-lg font-medium">Settings</h2>

      {/* Theme & Sound */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">
          Preferences
        </h3>
        <div className="bg-card space-y-4 rounded-xl border p-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="text-muted-foreground h-5 w-5" />
              ) : (
                <Sun className="text-warning h-5 w-5" />
              )}
              <div>
                <Label htmlFor="dark-mode" className="text-foreground">
                  Dark Mode
                </Label>
                <p className="text-muted-foreground text-xs">
                  Easier on the eyes
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 className="text-accent h-5 w-5" />
              ) : (
                <VolumeX className="text-muted-foreground h-5 w-5" />
              )}
              <div>
                <Label htmlFor="sound-toggle" className="text-foreground">
                  Zen Sounds
                </Label>
                <p className="text-muted-foreground text-xs">
                  Play sounds on start and finish
                </p>
              </div>
            </div>
            <Switch
              id="sound-toggle"
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
            />
          </div>
        </div>
      </div>

      {/* Pomodoro Settings */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">
          Pomodoro Timer
        </h3>

        <div className="bg-card space-y-6 rounded-xl border p-4">
          {/* Focus Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-accent h-4 w-4" />
                <Label className="text-foreground">Focus Duration</Label>
              </div>
              <span className="text-foreground text-sm font-medium">
                {settings.focusDuration} min
              </span>
            </div>
            <Slider
              value={[settings.focusDuration]}
              onValueChange={([value]) =>
                updateSettings({ focusDuration: value })
              }
              min={5}
              max={60}
              step={5}
              className="w-full"
            />
          </div>

          {/* Short Break */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee className="text-success h-4 w-4" />
                <Label className="text-foreground">Short Break</Label>
              </div>
              <span className="text-foreground text-sm font-medium">
                {settings.shortBreakDuration} min
              </span>
            </div>
            <Slider
              value={[settings.shortBreakDuration]}
              onValueChange={([value]) =>
                updateSettings({ shortBreakDuration: value })
              }
              min={1}
              max={15}
              step={1}
              className="w-full"
            />
          </div>

          {/* Long Break */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="text-warning h-4 w-4" />
                <Label className="text-foreground">Long Break</Label>
              </div>
              <span className="text-foreground text-sm font-medium">
                {settings.longBreakDuration} min
              </span>
            </div>
            <Slider
              value={[settings.longBreakDuration]}
              onValueChange={([value]) =>
                updateSettings({ longBreakDuration: value })
              }
              min={5}
              max={30}
              step={5}
              className="w-full"
            />
          </div>

          {/* Sessions Until Long Break */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-foreground">
                Sessions Until Long Break
              </Label>
              <span className="text-foreground text-sm font-medium">
                {settings.sessionsUntilLongBreak}
              </span>
            </div>
            <Slider
              value={[settings.sessionsUntilLongBreak]}
              onValueChange={([value]) =>
                updateSettings({ sessionsUntilLongBreak: value })
              }
              min={2}
              max={8}
              step={1}
              className="w-full"
            />
          </div>
        </div>

      {/* Data & Storage */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-sm font-medium">
          Data & Storage
        </h3>
        <div className="bg-card space-y-4 rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Database className="text-primary h-4 w-4" />
            <Label className="text-foreground">Backup & Restore</Label>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full justify-start overflow-hidden" 
              onClick={() => {
                try {
                  const storageData = localStorage.getItem('flow-state-storage');
                  if (!storageData) {
                    toast.error('No data found to export');
                    return;
                  }
                  
                  const blob = new Blob([storageData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `productivity-app-backup-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  
                  toast.success('Backup downloaded successfully');
                } catch (error) {
                  console.error('Export failed:', error);
                  toast.error('Failed to export data');
                }
              }}
            >
              <Download className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">Export Backup</span>
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const json = event.target?.result as string;
                      const parsed = JSON.parse(json);
                      
                      // Basic validation
                      if (!parsed || !parsed.state) {
                         throw new Error('Invalid backup file format');
                      }

                      localStorage.setItem('flow-state-storage', json);
                      toast.success('Data restored successfully! Reloading...');
                      
                      setTimeout(() => {
                        window.location.reload();
                      }, 1500);
                    } catch (error) {
                      console.error('Import failed:', error);
                      toast.error('Failed to restore data. Invalid file.');
                    }
                  };
                  reader.readAsText(file);
                  
                  // Reset input
                  e.target.value = '';
                }}
              />
              <Button variant="outline" className="w-full justify-start overflow-hidden pointer-events-none">
                <Upload className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Import Backup</span>
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground text-xs pt-2">
            Importing a backup will overwrite your current data. This action cannot be undone.
          </p>
        </div>
      </div>
      </div>

      {/* Data Note */}
      <div className="border-border/50 bg-muted/30 rounded-xl border p-4">
        <p className="text-muted-foreground text-xs">
          Your data is stored locally on this device. No account required.
        </p>
      </div>
    </div>
  );
}
