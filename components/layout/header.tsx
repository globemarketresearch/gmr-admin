'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from './user-nav';
import { NotificationPanel } from './notification-panel';

export function Header() {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="w-full bg-background pl-8" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <NotificationPanel />
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}
