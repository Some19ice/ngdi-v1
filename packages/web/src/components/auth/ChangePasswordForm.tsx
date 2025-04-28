'use client'

import React, { useState } from 'react'
import { useForm, zodResolver } from '@mantine/form'
import { z } from 'zod'
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Box, 
  Title, 
  Text, 
  Alert, 
  Paper,
  Stack
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { api } from '@/lib/api'
import { PasswordStrengthMeter } from '@/components/ui/password-strength-meter'
import { notifications } from '@mantine/notifications'

// Password validation schema
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

// Form validation schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/**
 * Form for changing user password with strength meter and validation
 */
export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<ChangePasswordFormValues>({
    validate: zodResolver(changePasswordSchema),
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      const response = await api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      if (response.data.success) {
        setSuccess(true)
        form.reset()
        
        notifications.show({
          title: 'Password Changed',
          message: 'Your password has been successfully changed',
          color: 'green',
          icon: <IconCheck size={16} />,
        })
      } else {
        setError(response.data.message || 'Failed to change password')
      }
    } catch (err: any) {
      console.error('Error changing password:', err)
      
      // Extract error message
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'An error occurred while changing your password'
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper p="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Title order={3}>Change Password</Title>
          
          <Text size="sm" color="dimmed">
            Your password must be at least 12 characters long and include uppercase letters,
            lowercase letters, numbers, and special characters.
          </Text>
          
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Error" 
              color="red"
              variant="filled"
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              icon={<IconCheck size={16} />} 
              title="Success" 
              color="green"
              variant="filled"
            >
              Your password has been successfully changed.
            </Alert>
          )}
          
          <PasswordInput
            label="Current Password"
            placeholder="Enter your current password"
            required
            {...form.getInputProps('currentPassword')}
          />
          
          <PasswordInput
            label="New Password"
            placeholder="Enter your new password"
            required
            {...form.getInputProps('newPassword')}
          />
          
          {form.values.newPassword && (
            <PasswordStrengthMeter password={form.values.newPassword} />
          )}
          
          <PasswordInput
            label="Confirm New Password"
            placeholder="Confirm your new password"
            required
            {...form.getInputProps('confirmPassword')}
          />
          
          <Button 
            type="submit" 
            loading={loading}
            fullWidth
          >
            Change Password
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
