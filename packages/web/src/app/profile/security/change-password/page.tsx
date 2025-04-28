'use client'

import React from 'react'
import { Container, Title, Text, Box } from '@mantine/core'
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm'

/**
 * Page for changing user password
 */
export default function ChangePasswordPage() {
  return (
    <Container size="sm">
      <Box mb="lg">
        <Title order={2}>Change Password</Title>
        <Text color="dimmed" mt="xs">
          Update your password to keep your account secure
        </Text>
      </Box>
      
      <ChangePasswordForm />
    </Container>
  )
}
