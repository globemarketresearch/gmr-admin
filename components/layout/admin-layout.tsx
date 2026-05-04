'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
import { type UserRole } from '@/lib/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
}

export function AdminLayout({ children, userRole = 'admin' }: AdminLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/10">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
