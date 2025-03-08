"use client"

import { UserRole } from "@/lib/auth/types"
import { ProtectedRoute } from "@/components/auth-components/protected-route"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  Building2,
  FileText,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Mock data - replace with actual API calls
const data = [
  { name: "Jan", value: 45 },
  { name: "Feb", value: 52 },
  { name: "Mar", value: 61 },
  { name: "Apr", value: 58 },
  { name: "May", value: 75 },
  { name: "Jun", value: 85 },
]

const stats = [
  {
    title: "Total Users",
    value: "2,543",
    description: "+12.5% from last month",
    icon: Users,
  },
  {
    title: "Organizations",
    value: "124",
    description: "+4.3% from last month",
    icon: Building2,
  },
  {
    title: "Metadata Entries",
    value: "8,765",
    description: "+23.1% from last month",
    icon: FileText,
  },
  {
    title: "Active Users",
    value: "1,876",
    description: "Last 30 days",
    icon: Activity,
  },
]

const recentActivity = [
  {
    user: "John Doe",
    action: "Created new metadata",
    time: "2 hours ago",
    metadata: "Lagos Transportation Network",
  },
  {
    user: "Jane Smith",
    action: "Updated organization details",
    time: "4 hours ago",
    metadata: "Ministry of Environment",
  },
  {
    user: "Mike Johnson",
    action: "Validated metadata",
    time: "6 hours ago",
    metadata: "National Water Resources",
  },
]

export default function AdminPage() {
  const { userRole, session } = useAuth()

  return (
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Admin content here */}
          <div className="rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Welcome, {session?.user?.email?.split("@")[0] || "Admin"}
            </h2>
            <p className="text-muted-foreground">Role: {userRole}</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
