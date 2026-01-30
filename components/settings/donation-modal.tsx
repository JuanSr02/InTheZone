'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Copy, Check } from 'lucide-react';

export function DonationModal() {
  const [copied, setCopied] = useState(false);
  const alias = 'lautaro1910.dev';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(alias);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full gap-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          <Heart className="h-4 w-4 fill-current" />
          <span>Donate to support</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            Support InTheZone
          </DialogTitle>
          <DialogDescription className="pt-2">
            InTheZone is an open-source project built for the community. Your
            support is crucial to:
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Keep the servers running & domain active</li>
              <li>Develop new features for you</li>
              <li>Keep the app ad-free and free to use</li>
            </ul>
            <p className="mt-2 text-justify">
              Every contribution, no matter how small, makes a difference and
              allows us to continue providing this tool for free.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="alias" className="sr-only">
              Alias
            </Label>
            <Input
              id="alias"
              defaultValue={alias}
              readOnly
              className="h-9"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        
        <div className="text-muted-foreground text-xs text-center">
          Thank you for helping us stay In The Zone! 🚀
        </div>
      </DialogContent>
    </Dialog>
  );
}
