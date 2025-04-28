"use client"

import { useState, useEffect } from "react"
import { performanceMonitor } from "@/lib/optimization/performance-monitor"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

/**
 * Performance monitoring debug component
 * This component displays performance metrics for components
 */
export function PerformanceMonitor() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [threshold, setThreshold] = useState(16)
  const [activeTab, setActiveTab] = useState("table")
  const [refreshKey, setRefreshKey] = useState(0)

  // Toggle performance monitoring
  const toggleMonitoring = () => {
    if (isEnabled) {
      performanceMonitor.disable()
    } else {
      performanceMonitor.enable()
    }
    setIsEnabled(!isEnabled)
  }

  // Reset metrics
  const resetMetrics = () => {
    performanceMonitor.resetMetrics()
    setRefreshKey((prev) => prev + 1)
  }

  // Update metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const metricsObj = performanceMonitor.getMetrics()
      const metricsArray = Object.values(metricsObj).map((metric) => ({
        name: metric.componentName,
        renderCount: metric.renderCount,
        averageTime: parseFloat(metric.averageRenderTime.toFixed(2)),
        worstTime: parseFloat(metric.worstRenderTime.toFixed(2)),
        lastTime: parseFloat(metric.lastRenderTime.toFixed(2)),
      }))
      
      // Sort by worst render time
      metricsArray.sort((a, b) => b.worstTime - a.worstTime)
      
      setMetrics(metricsArray)
    }, 1000)

    return () => clearInterval(interval)
  }, [refreshKey])

  // Update threshold
  useEffect(() => {
    performanceMonitor.setLogThreshold(threshold)
  }, [threshold])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Monitor</CardTitle>
        <CardDescription>
          Monitor component render performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="monitoring-toggle"
              checked={isEnabled}
              onCheckedChange={toggleMonitoring}
            />
            <Label htmlFor="monitoring-toggle">
              {isEnabled ? "Monitoring Enabled" : "Monitoring Disabled"}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="threshold">Log Threshold (ms):</Label>
            <Input
              id="threshold"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead>Renders</TableHead>
                    <TableHead>Avg Time (ms)</TableHead>
                    <TableHead>Worst Time (ms)</TableHead>
                    <TableHead>Last Time (ms)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No metrics available
                      </TableCell>
                    </TableRow>
                  ) : (
                    metrics.map((metric) => (
                      <TableRow key={metric.name}>
                        <TableCell className="font-medium">{metric.name}</TableCell>
                        <TableCell>{metric.renderCount}</TableCell>
                        <TableCell>{metric.averageTime}</TableCell>
                        <TableCell
                          className={
                            metric.worstTime > threshold
                              ? "text-red-500 font-semibold"
                              : ""
                          }
                        >
                          {metric.worstTime}
                        </TableCell>
                        <TableCell
                          className={
                            metric.lastTime > threshold
                              ? "text-red-500 font-semibold"
                              : ""
                          }
                        >
                          {metric.lastTime}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="chart">
            <div className="h-80">
              {metrics.length === 0 ? (
                <div className="flex h-full items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">No metrics available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.slice(0, 10)} // Show top 10 components
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="averageTime"
                      fill="#8884d8"
                      name="Avg Time (ms)"
                    />
                    <Bar
                      dataKey="worstTime"
                      fill="#ff5722"
                      name="Worst Time (ms)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetMetrics}>
          Reset Metrics
        </Button>
        <Button
          variant="outline"
          onClick={() => performanceMonitor.logMetrics()}
        >
          Log to Console
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PerformanceMonitor
