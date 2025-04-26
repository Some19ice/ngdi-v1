"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { api } from "@/lib/api"
import { hasPermission } from "@/lib/permissions"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Send, 
  Eye, 
  Edit, 
  Trash, 
  Upload, 
  Download, 
  RefreshCw 
} from "lucide-react"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function MetadataWorkflowDashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [userTasks, setUserTasks] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Check permissions
  const canReview = hasPermission(session, "approve", "metadata")
  const canPublish = hasPermission(session, "publish", "metadata")
  const canValidate = hasPermission(session, "validate", "metadata")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch workflow stats
        const statsResponse = await api.get("/api/metadata/workflow/stats")
        setStats(statsResponse.data)

        // Fetch user tasks
        const tasksResponse = await api.get("/api/metadata/workflow/tasks")
        setUserTasks(tasksResponse.data.tasks)

        // Fetch recent activity
        const activityResponse = await api.get("/api/activity-logs", {
          params: {
            subject: "metadata",
            limit: 10
          }
        })
        setRecentActivity(activityResponse.data.logs)
      } catch (error) {
        console.error("Error fetching workflow data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>
      case "PENDING_REVIEW":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>
      case "APPROVED":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>
      case "REJECTED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
      case "PUBLISHED":
        return <Badge variant="default"><Upload className="h-3 w-3 mr-1" /> Published</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Format action for display
  const formatAction = (action: string) => {
    switch (action) {
      case "create":
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> Created</Badge>
      case "update":
        return <Badge variant="outline"><Edit className="h-3 w-3 mr-1" /> Updated</Badge>
      case "delete":
        return <Badge variant="destructive"><Trash className="h-3 w-3 mr-1" /> Deleted</Badge>
      case "submit-for-review":
        return <Badge variant="secondary"><Send className="h-3 w-3 mr-1" /> Submitted for Review</Badge>
      case "approve":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>
      case "reject":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
      case "publish":
        return <Badge variant="default"><Upload className="h-3 w-3 mr-1" /> Published</Badge>
      case "unpublish":
        return <Badge variant="warning"><Download className="h-3 w-3 mr-1" /> Unpublished</Badge>
      case "validate":
        return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" /> Validated</Badge>
      case "view":
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" /> Viewed</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Metadata by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.statusCounts}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            fill="#8884d8"
                            label={({ status }) => status}
                          >
                            {stats.statusCounts.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Activity by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.activityCounts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="action" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Contributors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats.topContributors.slice(0, 5).map((contributor: any) => (
                        <div key={contributor.userId} className="flex justify-between items-center">
                          <span className="text-sm truncate max-w-[150px]">
                            {contributor.userName || contributor.userEmail}
                          </span>
                          <Badge variant="outline">{contributor.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Activity</CardTitle>
                  <CardDescription>Metadata activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
              <CardDescription>Metadata records requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {userTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No tasks requiring your attention
                </div>
              ) : (
                <div className="space-y-4">
                  {userTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {formatStatus(task.status)}
                          <span className="text-xs text-muted-foreground">
                            Updated {new Date(task.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/metadata/${task.id}`}>
                            <Eye className="h-4 w-4 mr-1" /> View
                          </a>
                        </Button>
                        
                        {task.status === "PENDING_REVIEW" && canReview && (
                          <>
                            <Button size="sm" variant="success" asChild>
                              <a href={`/metadata/${task.id}/review`}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Review
                              </a>
                            </Button>
                          </>
                        )}
                        
                        {task.status === "APPROVED" && canPublish && (
                          <Button size="sm" variant="default" asChild>
                            <a href={`/metadata/${task.id}/publish`}>
                              <Upload className="h-4 w-4 mr-1" /> Publish
                            </a>
                          </Button>
                        )}
                        
                        {task.status === "DRAFT" && (
                          <Button size="sm" variant="secondary" asChild>
                            <a href={`/metadata/${task.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Recent metadata workflow activity</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 border-b pb-4">
                      <div className="mt-0.5">
                        {formatAction(activity.action)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.user?.name || activity.user?.email || "Unknown user"}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.action} metadata {activity.subjectId && (
                            <a href={`/metadata/${activity.subjectId}`} className="underline">
                              record
                            </a>
                          )}
                        </p>
                      </div>
                      {activity.subjectId && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/metadata/${activity.subjectId}`}>
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
