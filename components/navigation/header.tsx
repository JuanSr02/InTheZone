'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SettingsView } from '@/components/settings/settings-view';

export function Header() {
  const { activeTab } = useAppStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const title =
    activeTab === 'timer'
      ? 'InTheZone'
      : activeTab === 'habits'
        ? 'Habits'
        : 'Analytics';

  return (
    <header className="border-border/50 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <h1 className="text-foreground text-lg font-medium">{title}</h1>

        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-9 w-9"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto sm:max-w-md"
          >
            <SheetTitle className="sr-only">Settings</SheetTitle>
            <SettingsView />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
