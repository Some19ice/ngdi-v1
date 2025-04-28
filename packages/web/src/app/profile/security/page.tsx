'use client'

import React from 'react'
import { Container, Title, Text, Box, Card, Group, Button, Stack, Divider } from '@mantine/core'
import { IconKey, IconHistory, IconDevices } from '@tabler/icons-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

/**
 * Security settings page
 */
export default function SecurityPage() {
  const { user } = useAuth()
  
  return (
    <Container size="md">
      <Box mb="lg">
        <Title order={2}>Security Settings</Title>
        <Text color="dimmed" mt="xs">
          Manage your account security settings
        </Text>
      </Box>
      
      <Stack spacing="lg">
        <Card withBorder p="md">
          <Group position="apart" mb="md">
            <Box>
              <Group spacing="xs">
                <IconKey size={20} />
                <Title order={4}>Password</Title>
              </Group>
              <Text size="sm" color="dimmed" mt="xs">
                Change your password regularly to keep your account secure
              </Text>
            </Box>
            <Button component={Link} href="/profile/security/change-password" variant="light">
              Change Password
            </Button>
          </Group>
          
          <Divider my="sm" />
          
          <Text size="sm">
            Last changed: {user?.passwordLastChanged 
              ? new Date(user.passwordLastChanged).toLocaleDateString() 
              : 'Unknown'}
          </Text>
        </Card>
        
        <Card withBorder p="md">
          <Group position="apart" mb="md">
            <Box>
              <Group spacing="xs">
                <IconHistory size={20} />
                <Title order={4}>Activity Log</Title>
              </Group>
              <Text size="sm" color="dimmed" mt="xs">
                Review your recent account activity
              </Text>
            </Box>
            <Button component={Link} href="/profile/security/activity" variant="light">
              View Activity
            </Button>
          </Group>
        </Card>
        
        <Card withBorder p="md">
          <Group position="apart" mb="md">
            <Box>
              <Group spacing="xs">
                <IconDevices size={20} />
                <Title order={4}>Device Management</Title>
              </Group>
              <Text size="sm" color="dimmed" mt="xs">
                Manage devices that are logged into your account
              </Text>
            </Box>
            <Button component={Link} href="/profile/security/devices" variant="light">
              Manage Devices
            </Button>
          </Group>
        </Card>
      </Stack>
    </Container>
  )
}
