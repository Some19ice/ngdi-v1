"use client"

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

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Metadata Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#008751"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <Clock className="mt-1 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.metadata} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Federal Ministry of Environment", count: 245 },
                {
                  name: "National Space Research and Development Agency",
                  count: 189,
                },
                { name: "Federal Ministry of Agriculture", count: 156 },
                { name: "Nigeria Hydrological Services Agency", count: 134 },
              ].map((org, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-4"
                >
                  <div className="flex items-center space-x-4">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {org.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {org.count} metadata entries
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="h-4 w-4 text-ngdi-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "API Health", status: "Operational", uptime: "99.9%" },
                { name: "Database", status: "Operational", uptime: "99.99%" },
                { name: "Storage", status: "Operational", uptime: "99.95%" },
                {
                  name: "Search Index",
                  status: "Operational",
                  uptime: "99.9%",
                },
              ].map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between space-x-4"
                >
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {service.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {service.status}
                    </p>
                  </div>
                  <p className="text-sm text-ngdi-green-500">
                    {service.uptime}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
