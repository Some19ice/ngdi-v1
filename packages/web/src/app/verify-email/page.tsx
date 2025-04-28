'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Container, Paper, Title, Text, Button, Center, Loader, Stack } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import { api } from '@/lib/api'

/**
 * Email verification page that handles the verification token
 * from the verification email link
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (!token) {
      setStatus('error')
      setMessage('Verification token is missing. Please check your email link and try again.')
      return
    }
    
    const verifyEmail = async () => {
      try {
        const response = await api.post('/auth/verify-email', { token })
        
        if (response.data.success) {
          setStatus('success')
          setMessage('Your email has been successfully verified! You can now access all features.')
        } else {
          setStatus('error')
          setMessage(response.data.message || 'Failed to verify email. Please try again.')
        }
      } catch (error) {
        console.error('Error verifying email:', error)
        setStatus('error')
        setMessage(
          error instanceof Error && error.message
            ? error.message
            : 'An error occurred during verification. The token may be invalid or expired.'
        )
      }
    }
    
    verifyEmail()
  }, [searchParams])
  
  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }
  
  const handleGoToLogin = () => {
    router.push('/login')
  }
  
  return (
    <Container size="sm" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack align="center" spacing="md">
          {status === 'loading' && (
            <>
              <Loader size="lg" />
              <Title order={2}>Verifying your email...</Title>
              <Text color="dimmed" align="center">
                Please wait while we verify your email address.
              </Text>
            </>
          )}
          
          {status === 'success' && (
            <>
              <Center 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--mantine-color-green-light)' 
                }}
              >
                <IconCheck size={30} color="var(--mantine-color-green-filled)" />
              </Center>
              <Title order={2}>Email Verified!</Title>
              <Text color="dimmed" align="center">
                {message}
              </Text>
              <Button onClick={handleGoToDashboard} fullWidth mt="md">
                Go to Dashboard
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <Center 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--mantine-color-red-light)' 
                }}
              >
                <IconX size={30} color="var(--mantine-color-red-filled)" />
              </Center>
              <Title order={2}>Verification Failed</Title>
              <Text color="dimmed" align="center">
                {message}
              </Text>
              <Button onClick={handleGoToLogin} fullWidth mt="md">
                Go to Login
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  )
}
