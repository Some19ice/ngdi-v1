"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data - replace with actual API calls
const metadataByCategory = [
  { name: "Boundaries", value: 245, color: "#008751" },
  { name: "Water Bodies", value: 189, color: "#1E88E5" },
  { name: "Transportation", value: 156, color: "#FFC107" },
  { name: "Environment", value: 134, color: "#4CAF50" },
  { name: "Health", value: 98, color: "#E53935" },
]

const userActivity = [
  { date: "2024-01", uploads: 45, downloads: 120, views: 350 },
  { date: "2024-02", uploads: 52, downloads: 145, views: 420 },
  { date: "2024-03", uploads: 61, downloads: 165, views: 480 },
  { date: "2024-04", uploads: 58, downloads: 155, views: 440 },
  { date: "2024-05", uploads: 75, downloads: 190, views: 520 },
  { date: "2024-06", uploads: 85, downloads: 210, views: 580 },
]

const organizationActivity = [
  {
    name: "Federal Ministry of Environment",
    uploads: 85,
    downloads: 210,
    engagement: 75,
  },
  {
    name: "National Space Research Agency",
    uploads: 65,
    downloads: 180,
    engagement: 65,
  },
  {
    name: "Federal Ministry of Agriculture",
    uploads: 45,
    downloads: 150,
    engagement: 55,
  },
  {
    name: "Nigeria Hydrological Services",
    uploads: 35,
    downloads: 120,
    engagement: 45,
  },
]

const geographicDistribution = [
  { name: "North Central", value: 25 },
  { name: "North East", value: 15 },
  { name: "North West", value: 20 },
  { name: "South East", value: 18 },
  { name: "South South", value: 22 },
  { name: "South West", value: 30 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metadata by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metadataByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metadataByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uploads"
                    stroke="#008751"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="downloads"
                    stroke="#eab308"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#6b7280"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={organizationActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="uploads" fill="#008751" name="Uploads" />
                  <Bar dataKey="downloads" fill="#eab308" name="Downloads" />
                  <Bar
                    dataKey="engagement"
                    fill="#6b7280"
                    name="Engagement Score"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {geographicDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${
                          (index * 360) / geographicDistribution.length
                        }, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  label: "Completeness",
                  value: 85,
                  color: "bg-ngdi-green-500",
                },
                {
                  label: "Accuracy",
                  value: 92,
                  color: "bg-yellow-500",
                },
                {
                  label: "Timeliness",
                  value: 78,
                  color: "bg-blue-500",
                },
                {
                  label: "Consistency",
                  value: 88,
                  color: "bg-purple-500",
                },
              ].map((metric) => (
                <div key={metric.label} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div
                      className={`h-2 rounded-full ${metric.color}`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
