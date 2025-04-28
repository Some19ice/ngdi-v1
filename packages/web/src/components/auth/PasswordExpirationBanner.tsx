'use client'

import React, { useState, useEffect } from 'react'
import { Alert, Button, Text, Group } from '@mantine/core'
import { IconAlertCircle, IconClock } from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface PasswordStatus {
  isExpired: boolean
  daysUntilExpiration?: number
  requiresChange: boolean
  graceLoginsRemaining?: number
  email: string
}

/**
 * Banner component that shows when a user's password is about to expire
 * or has expired but still has grace logins remaining
 */
export function PasswordExpirationBanner() {
  const router = useRouter()
  const [status, setStatus] = useState<PasswordStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        setLoading(true)
        const response = await api.get('/auth/password-status')
        
        if (response.data.success) {
          setStatus(response.data.status)
        }
      } catch (err) {
        console.error('Failed to check password status:', err)
        setError('Failed to check password status')
      } finally {
        setLoading(false)
      }
    }

    checkPasswordStatus()
  }, [])

  const handleChangePassword = () => {
    router.push('/profile/security/change-password')
  }

  if (loading || !status) {
    return null
  }

  if (error) {
    return null // Don't show errors to users
  }

  // If password change is required, show a warning
  if (status.requiresChange) {
    return (
      <Alert 
        icon={<IconAlertCircle size={16} />}
        title="Password Change Required"
        color="red"
        mb="md"
      >
        <Text size="sm" mb="xs">
          Your password has expired and needs to be changed immediately.
          {status.graceLoginsRemaining !== undefined && status.graceLoginsRemaining > 0 && (
            ` You have ${status.graceLoginsRemaining} grace login(s) remaining.`
          )}
        </Text>
        <Group justify="flex-end">
          <Button 
            color="red" 
            size="xs" 
            onClick={handleChangePassword}
          >
            Change Password Now
          </Button>
        </Group>
      </Alert>
    )
  }

  // If password is about to expire, show a warning
  if (status.daysUntilExpiration !== undefined && status.daysUntilExpiration <= 14) {
    return (
      <Alert 
        icon={<IconClock size={16} />}
        title="Password Expiration Warning"
        color="yellow"
        mb="md"
      >
        <Text size="sm" mb="xs">
          Your password will expire in {status.daysUntilExpiration} day(s). 
          Please change your password to avoid any interruption.
        </Text>
        <Group justify="flex-end">
          <Button 
            color="yellow" 
            variant="light"
            size="xs" 
            onClick={handleChangePassword}
          >
            Change Password
          </Button>
        </Group>
      </Alert>
    )
  }

  return null
}
