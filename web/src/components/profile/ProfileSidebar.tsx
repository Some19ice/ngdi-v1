import React from "react"
import { NavLink, Stack, Text } from "@mantine/core"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  IconUser,
  IconLock,
  IconHistory,
  IconSettings,
  IconBell,
  IconKey,
  IconDevices,
} from "@tabler/icons-react"

/**
 * Sidebar navigation for the profile section
 */
export function ProfileSidebar() {
  const pathname = usePathname()

  const links = [
    {
      label: "Personal Information",
      href: "/profile",
      icon: <IconUser size={16} />,
      exact: true,
    },
    {
      label: "Security",
      href: "/profile/security",
      icon: <IconLock size={16} />,
    },
    {
      label: "Change Password",
      href: "/profile/security/change-password",
      icon: <IconKey size={16} />,
    },
    {
      label: "Activity Log",
      href: "/profile/security/activity",
      icon: <IconHistory size={16} />,
    },
    {
      label: "Device Management",
      href: "/profile/security/devices",
      icon: <IconDevices size={16} />,
    },
    {
      label: "Notifications",
      href: "/profile/notifications",
      icon: <IconBell size={16} />,
    },
    {
      label: "Preferences",
      href: "/profile/preferences",
      icon: <IconSettings size={16} />,
    },
  ]

  return (
    <Stack p="md" spacing="xs">
      <Text fw={700} size="sm" mb="md">
        Profile Settings
      </Text>

      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href)

        return (
          <NavLink
            key={link.href}
            component={Link}
            href={link.href}
            label={link.label}
            leftSection={link.icon}
            active={isActive}
            variant="light"
          />
        )
      })}
    </Stack>
  )
}
