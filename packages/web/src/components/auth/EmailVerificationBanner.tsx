import React, { useState } from 'react'
import { Alert, Button, Flex, Text } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useAuth } from '@/hooks/useAuth'
import { notifications } from '@mantine/notifications'
import { api } from '@/lib/api'

/**
 * Banner component that shows when a user's email is not verified
 * and provides a button to resend the verification email
 */
export function EmailVerificationBanner() {
  const { user, isLoading } = useAuth()
  const [isSending, setIsSending] = useState(false)
  
  // If loading or user is verified, don't show the banner
  if (isLoading || !user || user.emailVerified) {
    return null
  }
  
  const handleResendVerification = async () => {
    try {
      setIsSending(true)
      
      const response = await api.post('/auth/resend-verification', {
        email: user.email,
      })
      
      if (response.data.success) {
        notifications.show({
          title: 'Verification Email Sent',
          message: 'Please check your inbox for the verification link',
          color: 'green',
          icon: <IconCheck size={16} />,
        })
      } else {
        throw new Error(response.data.message || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      
      notifications.show({
        title: 'Error',
        message: error instanceof Error 
          ? error.message 
          : 'Failed to send verification email. Please try again later.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      })
    } finally {
      setIsSending(false)
    }
  }
  
  return (
    <Alert 
      icon={<IconAlertCircle size={16} />}
      title="Email Verification Required"
      color="yellow"
      mb="md"
    >
      <Flex direction="column" gap="sm">
        <Text size="sm">
          Your email address ({user.email}) has not been verified. 
          Some features may be limited until you verify your email.
        </Text>
        <Button 
          variant="light" 
          color="yellow" 
          onClick={handleResendVerification}
          loading={isSending}
          size="xs"
          style={{ alignSelf: 'flex-start' }}
        >
          Resend Verification Email
        </Button>
      </Flex>
    </Alert>
  )
}
