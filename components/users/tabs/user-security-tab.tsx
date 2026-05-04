'use client';

import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { UserFormData } from '../user-form-tabs';

interface UserSecurityTabProps {
  form: UseFormReturn<UserFormData>;
  onSubmit: () => Promise<void>;
  isSaving: boolean;
  isEditMode: boolean;
}

export function UserSecurityTab({ form, onSubmit, isSaving, isEditMode }: UserSecurityTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Leave blank to keep the current password. Enter a new password to change it.'
              : 'Set a secure password for the user account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEditMode ? 'New Password (Optional)' : 'Password'}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={isEditMode ? 'Leave blank to keep current' : 'Enter password'}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Password must be at least 8 characters long.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Control whether this user account is active.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Account</FormLabel>
                  <FormDescription>
                    {field.value
                      ? 'User can log in and access the system.'
                      : 'User account is disabled and cannot log in.'}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} onClick={onSubmit}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditMode ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </div>
  );
}
