'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function UpdatesModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
        >
          <Sparkles className="h-4 w-4 fill-current" />
          <span>See Updates (v1.0.2)</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 fill-blue-500" />
            What's New in v1.0.2
          </DialogTitle>
          <DialogDescription className="pt-2">
            We've been working hard to improve your experience! Here are the latest changes:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Progressive Web App (PWA)
            </h4>
            <p className="text-xs text-muted-foreground ml-6">
              You can now install InTheZone as an app on your device! It works 100% offline, so you can stay in the zone anywhere.
            </p>
          </div>
          
          <div className="space-y-2">
             <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Focus Chart Improvements
            </h4>
             <p className="text-xs text-muted-foreground ml-6">
              Added a Y-axis to the Focus Activity chart in Analytics to clearer visualize your concentration time.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Session Categories
            </h4>
            <p className="text-xs text-muted-foreground ml-6">
              Label your focus sessions by category (Work, Study, Code, etc.) and track your time distribution with beautiful analytics and detailed statistics.
            </p>
          </div>
        </div>
        
        <div className="text-muted-foreground text-xs text-center border-t pt-4">
           InTheZone v1.0.2
        </div>
      </DialogContent>
    </Dialog>
  );
}
