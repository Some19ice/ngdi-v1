'use client'

import React, { useMemo } from 'react'
import { Progress, Text, Box, Flex } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'

interface PasswordRequirement {
  label: string
  meets: boolean
}

interface PasswordStrengthMeterProps {
  password: string
  minLength?: number
}

/**
 * Password strength meter component
 * Shows password requirements and strength
 */
export function PasswordStrengthMeter({
  password,
  minLength = 12,
}: PasswordStrengthMeterProps) {
  // Calculate password requirements
  const requirements = useMemo(() => {
    return [
      {
        label: `At least ${minLength} characters`,
        meets: password.length >= minLength,
      },
      {
        label: 'Includes uppercase letter',
        meets: /[A-Z]/.test(password),
      },
      {
        label: 'Includes lowercase letter',
        meets: /[a-z]/.test(password),
      },
      {
        label: 'Includes number',
        meets: /[0-9]/.test(password),
      },
      {
        label: 'Includes special character',
        meets: /[^A-Za-z0-9]/.test(password),
      },
    ]
  }, [password, minLength])

  // Calculate strength score (0-100)
  const strength = useMemo(() => {
    if (!password) return 0
    
    const metRequirements = requirements.filter(req => req.meets).length
    return (metRequirements / requirements.length) * 100
  }, [password, requirements])

  // Determine color based on strength
  const color = useMemo(() => {
    if (strength === 0) return 'gray'
    if (strength < 40) return 'red'
    if (strength < 60) return 'orange'
    if (strength < 80) return 'yellow'
    return 'green'
  }, [strength])

  // Get strength label
  const strengthLabel = useMemo(() => {
    if (strength === 0) return 'No password'
    if (strength < 40) return 'Very weak'
    if (strength < 60) return 'Weak'
    if (strength < 80) return 'Moderate'
    if (strength < 100) return 'Strong'
    return 'Very strong'
  }, [strength])

  // Render requirement item
  function Requirement({ label, meets }: PasswordRequirement) {
    return (
      <Flex align="center" gap="xs">
        {meets ? (
          <IconCheck size={14} color="var(--mantine-color-green-filled)" />
        ) : (
          <IconX size={14} color="var(--mantine-color-red-filled)" />
        )}
        <Text size="xs" color={meets ? 'dimmed' : 'red'}>
          {label}
        </Text>
      </Flex>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={5}>
        <Text size="xs" color="dimmed">
          Password strength
        </Text>
        <Text size="xs" color={color} fw={500}>
          {strengthLabel}
        </Text>
      </Flex>
      
      <Progress value={strength} color={color} size="xs" mb="md" />
      
      <Flex direction="column" gap={5}>
        {requirements.map((requirement) => (
          <Requirement key={requirement.label} {...requirement} />
        ))}
      </Flex>
    </Box>
  )
}
