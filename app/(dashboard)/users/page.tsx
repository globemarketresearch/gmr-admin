'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Users } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { UserList } from '@/components/users/user-list';
import { TableSkeleton } from '@/components/ui/skeletons/table-skeleton';
import type { ApiUserResponse } from '@/lib/types/api-types';

export default function UsersPage() {
  const router = useRouter();
  const { users, total, isLoading, handleDelete } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<ApiUserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => router.push('/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {total} total user{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} columns={6} showHeader={true} showActions={true} />
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No users found matching your search' : 'No users yet'}
              </p>
            </div>
          ) : (
            <div className="fade-in">
              <UserList users={filteredUsers} onDelete={handleDelete} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
