/**
 * Utility for monitoring component performance
 * This helps identify components that are causing performance issues
 */

// Store performance metrics
interface PerformanceMetric {
  componentName: string
  renderCount: number
  totalRenderTime: number
  averageRenderTime: number
  lastRenderTime: number
  worstRenderTime: number
}

class PerformanceMonitor {
  private metrics: Record<string, PerformanceMetric> = {}
  private enabled: boolean = false
  private logThreshold: number = 16 // Log renders that take longer than 16ms (60fps)

  /**
   * Enable performance monitoring
   */
  enable() {
    this.enabled = true
    console.log("[Performance] Monitoring enabled")
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.enabled = false
    console.log("[Performance] Monitoring disabled")
  }

  /**
   * Set the threshold for logging slow renders
   * @param threshold Threshold in milliseconds
   */
  setLogThreshold(threshold: number) {
    this.logThreshold = threshold
  }

  /**
   * Start measuring a render
   * @param componentName Name of the component
   * @returns Function to call when render is complete
   */
  startMeasure(componentName: string) {
    if (!this.enabled) return () => {}

    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Initialize metrics if this is the first render
      if (!this.metrics[componentName]) {
        this.metrics[componentName] = {
          componentName,
          renderCount: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          lastRenderTime: 0,
          worstRenderTime: 0,
        }
      }

      // Update metrics
      const metric = this.metrics[componentName]
      metric.renderCount++
      metric.totalRenderTime += renderTime
      metric.averageRenderTime = metric.totalRenderTime / metric.renderCount
      metric.lastRenderTime = renderTime
      metric.worstRenderTime = Math.max(metric.worstRenderTime, renderTime)

      // Log slow renders
      if (renderTime > this.logThreshold) {
        console.warn(
          `[Performance] Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
        )
      }
    }
  }

  /**
   * Get performance metrics for all components
   * @returns Performance metrics
   */
  getMetrics() {
    return this.metrics
  }

  /**
   * Get performance metrics for a specific component
   * @param componentName Name of the component
   * @returns Performance metrics for the component
   */
  getComponentMetrics(componentName: string) {
    return this.metrics[componentName]
  }

  /**
   * Log performance metrics to the console
   */
  logMetrics() {
    if (!this.enabled) return

    console.group("[Performance] Metrics")
    
    // Sort components by worst render time
    const sortedMetrics = Object.values(this.metrics).sort(
      (a, b) => b.worstRenderTime - a.worstRenderTime
    )

    // Log table of metrics
    console.table(
      sortedMetrics.map((metric) => ({
        Component: metric.componentName,
        "Render Count": metric.renderCount,
        "Average Time (ms)": metric.averageRenderTime.toFixed(2),
        "Worst Time (ms)": metric.worstRenderTime.toFixed(2),
        "Last Time (ms)": metric.lastRenderTime.toFixed(2),
      }))
    )

    console.groupEnd()
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics = {}
    console.log("[Performance] Metrics reset")
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Hook for measuring component performance
 * @param componentName Name of the component
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === "undefined") return

  // Only enable in development mode
  if (process.env.NODE_ENV === "development") {
    const endMeasure = performanceMonitor.startMeasure(componentName)
    
    // End measurement after render
    setTimeout(endMeasure, 0)
  }
}

// Add global access for debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__performanceMonitor = performanceMonitor
}

export default performanceMonitor
