"use client"

import { useState, useEffect } from "react"
import { UserRole } from "@/lib/auth/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
import { Loader2 } from "lucide-react"
import { adminGet } from "@/lib/api/admin-fetcher"
import { mockAnalyticsData } from "@/lib/mock/admin-data"
import { MOCK_ADMIN_USER } from "@/lib/auth/mock"

// Define interfaces for the analytics data
interface AnalyticsData {
  metadataByCategory: Array<{
    name: string
    value: number
    color: string
  }>
  userActivity: Array<{
    date: string
    uploads: number
    downloads: number
    views: number
  }>
  organizationActivity: Array<{
    name: string
    uploads: number
    downloads: number
    engagement: number
  }>
  geographicDistribution: Array<{
    name: string
    value: number
  }>
  dataQualityMetrics: Array<{
    label: string
    value: number
    color: string
  }>
}

export default function AnalyticsPage() {
  const user = MOCK_ADMIN_USER
  const [timePeriod, setTimePeriod] = useState("30")
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Fetch analytics data from the API
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        setError(null)

        // Call the API server using our admin fetcher utility
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
        const url = `${apiUrl}/api/admin/analytics?period=${timePeriod}`

        const response = await adminGet(url).catch(() => {
          console.log("Using mock analytics data instead")
          setUseMockData(true)
          // Return mock data in the expected format
          return { success: true, data: mockAnalyticsData }
        })

        // Type-safe handling of the returned data
        if (response?.success && response.data) {
          setAnalytics(response.data)
        } else if (useMockData) {
          // Direct use of mock data if we're in mock mode
          setAnalytics(mockAnalyticsData)
        } else {
          console.error("Invalid data format returned:", response)
          setError("Invalid response format. Using mock data instead.")
          setAnalytics(mockAnalyticsData)
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
        setError("Failed to load analytics. Using mock data instead.")
        // Use mock data as fallback
        setAnalytics(mockAnalyticsData)
      } finally {
        setLoading(false)
      }
    }

    // Remove authentication and authorization checks
    fetchAnalytics()
  }, [timePeriod, useMockData])

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-ngdi-green-500" />
          <p className="mt-2 text-sm text-gray-500">
            Loading analytics data...
          </p>
        </div>
      </div>
    )
  }

  // If error but we have mock data, show the UI with a notification
  const errorBanner = error ? (
    <div className="bg-amber-50 p-4 rounded-md text-amber-800 mb-6">
      <h3 className="text-lg font-semibold mb-2">Notice</h3>
      <p>{error}</p>
      <p className="text-sm mt-2">
        Showing mock data for demonstration purposes.
      </p>
    </div>
  ) : null

  // If no data even after trying mock data, show an error
  if (!analytics) {
    return (
      <div className="bg-red-50 p-6 rounded-md text-red-800 mt-4">
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p>Failed to load analytics. Please try again later.</p>
        <Button
          className="mt-4 px-4 py-2 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  // Use the analytics data
  const {
    metadataByCategory = [],
    userActivity = [],
    organizationActivity = [],
    geographicDistribution = [],
    dataQualityMetrics = [],
  } = analytics

  return (
    <div className="space-y-6">
      {errorBanner}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <div className="flex items-center space-x-2">
          {useMockData && (
            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Using Mock Data
            </div>
          )}
          <Select
            value={timePeriod}
            onValueChange={(value) => setTimePeriod(value)}
          >
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

function getHealthColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 70) return "text-amber-600"
  return "text-red-600"
}
