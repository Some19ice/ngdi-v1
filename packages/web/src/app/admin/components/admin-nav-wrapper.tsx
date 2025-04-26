"use client"

import { AdminNav } from "./admin-nav"

interface AdminNavWrapperProps {
  user: {
    id: string | null
    email: string | null
    role: string | null
  }
}

export function AdminNavWrapper({ user }: AdminNavWrapperProps) {
  return <AdminNav user={user} />
}
