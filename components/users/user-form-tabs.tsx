'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import type { ApiUserResponse, CreateUserRequest, UpdateUserRequest } from '@/lib/types/api-types';
import { UserInfoTab } from './tabs/user-info-tab';
import { UserSecurityTab } from './tabs/user-security-tab';

// Unified validation schema for user form
const userFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z.enum(['admin', 'editor', 'viewer'], {
    message: 'Please select a role',
  }),
  is_active: z.boolean(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormTabsProps {
  user?: ApiUserResponse;
  onSubmit: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function UserFormTabs({ user, onSubmit, isSaving }: UserFormTabsProps) {
  const [activeTab, setActiveTab] = useState('info');
  const isEditMode = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role as 'admin' | 'editor' | 'viewer',
          is_active: user.is_active,
          password: '', // Password is optional on update
        }
      : {
          name: '',
          email: '',
          password: '',
          role: 'viewer',
          is_active: true,
        },
  });

  const handleSubmit = async (data: UserFormData) => {
    if (isEditMode) {
      // For update, only send changed fields
      const updateData: UpdateUserRequest = {};
      if (data.name !== user.name) updateData.name = data.name;
      if (data.email !== user.email) updateData.email = data.email;
      if (data.password) updateData.password = data.password;
      if (data.role !== user.role) updateData.role = data.role;
      if (data.is_active !== user.is_active) updateData.is_active = data.is_active;

      await onSubmit(updateData);
    } else {
      // For create, password is required
      if (!data.password) {
        form.setError('password', { message: 'Password is required' });
        return;
      }
      // For create, send all required fields
      const createData: CreateUserRequest = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      await onSubmit(createData);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="info">User Information</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <UserInfoTab form={form} />
          </TabsContent>

          <TabsContent value="security">
            <UserSecurityTab
              form={form}
              onSubmit={form.handleSubmit(handleSubmit)}
              isSaving={isSaving}
              isEditMode={isEditMode}
            />
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
