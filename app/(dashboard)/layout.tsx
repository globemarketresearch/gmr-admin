'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <AdminLayout userRole={user?.role}>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
