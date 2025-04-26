import fs from "fs"
import path from "path"
import { format } from "date-fns"

interface TestResult {
  title: string
  status: "passed" | "failed" | "timedOut" | "skipped"
  duration: number
  error?: {
    message: string
    stack?: string
  }
  retry: number
  projectName?: string
  metrics?: Record<
    string,
    {
      min: number
      max: number
      avg: number
      p95: number
    }
  >
}

interface TestReport {
  stats: {
    total: number
    passed: number
    failed: number
    skipped: number
    duration: number
    retries: number
  }
  failedTests: TestResult[]
  performanceMetrics: {
    signIn: {
      avg: number
      p95: number
      max: number
    }
    api: {
      avg: number
      p95: number
      max: number
    }
    concurrent: {
      avg: number
      p95: number
      max: number
    }
  }
  browserResults: Record<
    string,
    {
      passed: number
      failed: number
      total: number
    }
  >
}

async function analyzeTestResults(): Promise<void> {
  const resultsPath = path.join(process.cwd(), "test-results/test-results.json")

  if (!fs.existsSync(resultsPath)) {
    console.error("No test results found")
    process.exit(1)
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"))
  const report: TestReport = {
    stats: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      retries: 0,
    },
    failedTests: [],
    performanceMetrics: {
      signIn: { avg: 0, p95: 0, max: 0 },
      api: { avg: 0, p95: 0, max: 0 },
      concurrent: { avg: 0, p95: 0, max: 0 },
    },
    browserResults: {},
  }

  // Process test results
  for (const suite of results.suites) {
    processTestSuite(suite, report)
  }

  // Calculate averages
  if (report.stats.total > 0) {
    report.performanceMetrics.signIn.avg /= report.stats.total
    report.performanceMetrics.api.avg /= report.stats.total
    report.performanceMetrics.concurrent.avg /= report.stats.total
  }

  // Generate report
  const reportDate = format(new Date(), "yyyy-MM-dd_HH-mm-ss")
  const reportPath = path.join(
    process.cwd(),
    `test-results/report_${reportDate}.md`
  )

  const reportContent = generateMarkdownReport(report)
  fs.writeFileSync(reportPath, reportContent)

  // Output summary to console
  console.log("\nTest Results Summary:")
  console.log("--------------------")
  console.log(`Total Tests: ${report.stats.total}`)
  console.log(`Passed: ${report.stats.passed}`)
  console.log(`Failed: ${report.stats.failed}`)
  console.log(`Skipped: ${report.stats.skipped}`)
  console.log(`Total Duration: ${(report.stats.duration / 1000).toFixed(2)}s`)
  console.log(`Report generated at: ${reportPath}`)
}

function processTestSuite(suite: any, report: TestReport): void {
  if (suite.specs) {
    for (const spec of suite.specs) {
      const result = spec.tests[0] // Get the last test attempt
      report.stats.total++

      switch (result.status) {
        case "passed":
          report.stats.passed++
          break
        case "failed":
          report.stats.failed++
          report.failedTests.push({
            title: spec.title,
            status: result.status,
            duration: result.duration,
            error: result.error,
            retry: spec.tests.length - 1,
            projectName: result.projectName,
            metrics: result.metrics,
          })
          break
        case "skipped":
          report.stats.skipped++
          break
      }

      report.stats.duration += result.duration
      report.stats.retries += spec.tests.length - 1

      // Process browser results
      if (result.projectName) {
        if (!report.browserResults[result.projectName]) {
          report.browserResults[result.projectName] = {
            passed: 0,
            failed: 0,
            total: 0,
          }
        }
        report.browserResults[result.projectName].total++
        if (result.status === "passed") {
          report.browserResults[result.projectName].passed++
        } else if (result.status === "failed") {
          report.browserResults[result.projectName].failed++
        }
      }

      // Process performance metrics
      if (result.metrics) {
        processPerformanceMetrics(result.metrics, report.performanceMetrics)
      }
    }
  }

  if (suite.suites) {
    for (const childSuite of suite.suites) {
      processTestSuite(childSuite, report)
    }
  }
}

function processPerformanceMetrics(
  metrics: Record<
    string,
    { min: number; max: number; avg: number; p95: number }
  >,
  performanceMetrics: TestReport["performanceMetrics"]
): void {
  // Process sign-in metrics
  if (metrics.signIn) {
    performanceMetrics.signIn.avg += metrics.signIn.avg
    performanceMetrics.signIn.max = Math.max(
      performanceMetrics.signIn.max,
      metrics.signIn.max
    )
    performanceMetrics.signIn.p95 = Math.max(
      performanceMetrics.signIn.p95,
      metrics.signIn.p95
    )
  }

  // Process API metrics
  if (metrics.api_session || metrics.api_providers || metrics.api_csrf) {
    const apiMetrics = [
      metrics.api_session,
      metrics.api_providers,
      metrics.api_csrf,
    ].filter(Boolean)

    if (apiMetrics.length > 0) {
      const avgApiTime =
        apiMetrics.reduce((sum, m) => sum + m.avg, 0) / apiMetrics.length
      const maxApiTime = Math.max(...apiMetrics.map((m) => m.max))
      const p95ApiTime = Math.max(...apiMetrics.map((m) => m.p95))

      performanceMetrics.api.avg += avgApiTime
      performanceMetrics.api.max = Math.max(
        performanceMetrics.api.max,
        maxApiTime
      )
      performanceMetrics.api.p95 = Math.max(
        performanceMetrics.api.p95,
        p95ApiTime
      )
    }
  }

  // Process concurrent metrics
  if (metrics.concurrentSignIn) {
    performanceMetrics.concurrent.avg += metrics.concurrentSignIn.avg
    performanceMetrics.concurrent.max = Math.max(
      performanceMetrics.concurrent.max,
      metrics.concurrentSignIn.max
    )
    performanceMetrics.concurrent.p95 = Math.max(
      performanceMetrics.concurrent.p95,
      metrics.concurrentSignIn.p95
    )
  }
}

function generateMarkdownReport(report: TestReport): string {
  return `# Test Execution Report
Generated on: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}

## Summary
- Total Tests: ${report.stats.total}
- Passed: ${report.stats.passed}
- Failed: ${report.stats.failed}
- Skipped: ${report.stats.skipped}
- Total Duration: ${(report.stats.duration / 1000).toFixed(2)}s
- Total Retries: ${report.stats.retries}

## Browser Results
${Object.entries(report.browserResults)
  .map(
    ([browser, stats]) => `
### ${browser}
- Total: ${stats.total}
- Passed: ${stats.passed}
- Failed: ${stats.failed}
- Success Rate: ${((stats.passed / stats.total) * 100).toFixed(1)}%`
  )
  .join("\n")}

## Performance Metrics
### Sign In
- Average: ${report.performanceMetrics.signIn.avg.toFixed(2)}ms
- 95th Percentile: ${report.performanceMetrics.signIn.p95.toFixed(2)}ms
- Max: ${report.performanceMetrics.signIn.max.toFixed(2)}ms

### API Response Times
- Average: ${report.performanceMetrics.api.avg.toFixed(2)}ms
- 95th Percentile: ${report.performanceMetrics.api.p95.toFixed(2)}ms
- Max: ${report.performanceMetrics.api.max.toFixed(2)}ms

### Concurrent Operations
- Average: ${report.performanceMetrics.concurrent.avg.toFixed(2)}ms
- 95th Percentile: ${report.performanceMetrics.concurrent.p95.toFixed(2)}ms
- Max: ${report.performanceMetrics.concurrent.max.toFixed(2)}ms

## Failed Tests
${
  report.failedTests.length === 0
    ? "No failed tests!"
    : report.failedTests
        .map(
          (test) => `
### ${test.title}
- Status: ${test.status}
- Duration: ${(test.duration / 1000).toFixed(2)}s
- Browser: ${test.projectName}
- Retries: ${test.retry}
${
  test.error
    ? `
Error:
\`\`\`
${test.error.message}
${test.error.stack || ""}
\`\`\`
`
    : ""
}
${
  test.metrics
    ? `
Metrics:
\`\`\`json
${JSON.stringify(test.metrics, null, 2)}
\`\`\`
`
    : ""
}`
        )
        .join("\n")
}
`
}

// Run the analysis
analyzeTestResults().catch(console.error)
