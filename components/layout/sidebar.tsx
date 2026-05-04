'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationItems, type UserRole } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  userRole?: UserRole;
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const filteredNav = navigationItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Admin Panel</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.href}>
                {hasChildren ? (
                  <>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span className="flex-1 text-left">{item.title}</span>
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
                      />
                    </Button>
                    {isExpanded && item.children && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children
                          .filter(child => child.roles.includes(userRole))
                          .map(child => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;
                            return (
                              <Button
                                key={child.href}
                                variant="ghost"
                                className={cn(
                                  'w-full justify-start',
                                  isChildActive && 'bg-accent text-accent-foreground'
                                )}
                                asChild
                              >
                                <Link href={child.href}>
                                  <ChildIcon className="mr-2 h-4 w-4" />
                                  {child.title}
                                </Link>
                              </Button>
                            );
                          })}
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start',
                      isActive && 'bg-accent text-accent-foreground'
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
