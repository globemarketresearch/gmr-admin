'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface QuickActionButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

export function QuickActionButton({
  title,
  description,
  icon: Icon,
  href,
}: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="block w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}
