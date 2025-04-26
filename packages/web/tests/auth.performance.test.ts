import { test, expect, type Page } from "@playwright/test"
import {
  enhancedSignIn as signIn,
  enhancedClearSession as clearSession,
  getTestUser,
  enhancedSetupTestUser as setupTestUser,
} from "./helpers/auth"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

// Enhanced performance thresholds with more granular metrics
const PERF_THRESHOLDS = {
  signIn: {
    total: 2000, // 2 seconds total
    formLoad: 300, // 300ms for form load
    submission: 1000, // 1s for submission
    redirect: 700, // 700ms for redirect
  },
  sessionLoad: {
    cold: 300, // 300ms for cold start
    warm: 150, // 150ms for warm start
  },
  concurrent: {
    total: 5000, // 5s total
    perUser: 2000, // 2s per user
  },
  apiResponse: {
    p50: 200, // 50th percentile
    p95: 500, // 95th percentile
    p99: 1000, // 99th percentile
  },
}

test.describe("Authentication Performance", () => {
  let testStartTime: number
  const metrics: Record<string, number[]> = {}

  test.beforeEach(async ({ page }: { page: Page }) => {
    testStartTime = Date.now()
    await clearSession(page)
    await page.goto(BASE_URL)
  })

  test.afterEach(async ({}, testInfo) => {
    // Log test metrics
    const duration = Date.now() - testStartTime
    console.log(`Performance metrics - ${testInfo.title}:`, {
      duration,
      metrics: Object.fromEntries(
        Object.entries(metrics).map(([key, values]) => [
          key,
          {
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b) / values.length,
            p95: values.sort((a, b) => a - b)[Math.floor(values.length * 0.95)],
          },
        ])
      ),
    })

    // Clear metrics for next test
    Object.keys(metrics).forEach((key) => delete metrics[key])
  })

  test.describe("Sign In Performance", () => {
    test("should complete sign in within performance thresholds", async ({
      page,
    }) => {
      const user = getTestUser()

      // Measure form load time
      const formLoadStart = Date.now()
      await page.goto(`${BASE_URL}/auth/signin`)
      await page.waitForSelector("form", { state: "visible" })
      const formLoadTime = Date.now() - formLoadStart
      metrics.formLoad = metrics.formLoad || []
      metrics.formLoad.push(formLoadTime)
      expect(formLoadTime).toBeLessThan(PERF_THRESHOLDS.signIn.formLoad)

      // Measure sign in submission time
      const signInStart = Date.now()
      await signIn(page, user.email, user.password)
      const signInTime = Date.now() - signInStart
      metrics.signIn = metrics.signIn || []
      metrics.signIn.push(signInTime)
      expect(signInTime).toBeLessThan(PERF_THRESHOLDS.signIn.submission)

      // Verify total time
      const totalTime = Date.now() - formLoadStart
      expect(totalTime).toBeLessThan(PERF_THRESHOLDS.signIn.total)
    })

    test("should handle concurrent sign ins efficiently", async ({
      browser,
    }) => {
      const concurrentUsers = 5
      const pages: Page[] = []
      const signInTimes: number[] = []

      // Create multiple pages
      for (let i = 0; i < concurrentUsers; i++) {
        const page = await browser.newPage()
        pages.push(page)
      }

      // Perform concurrent sign ins
      const signInPromises = pages.map(async (page, index) => {
        const startTime = Date.now()
        const user = getTestUser()

        try {
          await signIn(page, `test${index}@example.com`, user.password)
          const duration = Date.now() - startTime
          signInTimes.push(duration)
          metrics.concurrentSignIn = metrics.concurrentSignIn || []
          metrics.concurrentSignIn.push(duration)
        } catch (error) {
          console.error(`Concurrent sign in failed for user ${index}:`, error)
          throw error
        }
      })

      await Promise.all(signInPromises)

      // Verify performance metrics
      const maxSignInTime = Math.max(...signInTimes)
      expect(maxSignInTime).toBeLessThan(PERF_THRESHOLDS.concurrent.total)

      signInTimes.forEach((time) => {
        expect(time).toBeLessThan(PERF_THRESHOLDS.concurrent.perUser)
      })

      // Clean up
      await Promise.all(pages.map((page) => page.close()))
    })
  })

  test.describe("API Response Times", () => {
    test("should have fast auth API response times", async ({ page }) => {
      const apiCalls = [
        {
          endpoint: "/api/auth/session",
          action: () => page.goto(`${BASE_URL}/api/auth/session`),
        },
        {
          endpoint: "/api/auth/providers",
          action: () => page.goto(`${BASE_URL}/api/auth/providers`),
        },
        {
          endpoint: "/api/auth/csrf",
          action: () => page.goto(`${BASE_URL}/api/auth/csrf`),
        },
      ]

      for (const call of apiCalls) {
        const times: number[] = []

        // Make multiple calls to get stable metrics
        for (let i = 0; i < 5; i++) {
          const startTime = Date.now()
          await call.action()
          const duration = Date.now() - startTime
          times.push(duration)

          metrics[`api_${call.endpoint}`] =
            metrics[`api_${call.endpoint}`] || []
          metrics[`api_${call.endpoint}`].push(duration)
        }

        // Sort times for percentile calculation
        times.sort((a, b) => a - b)

        // Verify against thresholds
        expect(
          times[Math.floor(times.length * 0.5)],
          `${call.endpoint} p50`
        ).toBeLessThan(PERF_THRESHOLDS.apiResponse.p50)
        expect(
          times[Math.floor(times.length * 0.95)],
          `${call.endpoint} p95`
        ).toBeLessThan(PERF_THRESHOLDS.apiResponse.p95)
      }
    })

    test("should efficiently handle token refresh", async ({ page }) => {
      const user = await setupTestUser(page)

      // Measure cold start token refresh
      await page.evaluate(() => {
        window.localStorage.setItem(
          "sessionExpiry",
          new Date(Date.now() + 1000).toISOString()
        )
      })

      const coldStartTime = Date.now()
      await page.goto(`${BASE_URL}/profile`)
      await page.waitForSelector('[data-testid="profile-content"]')
      const coldDuration = Date.now() - coldStartTime

      metrics.tokenRefreshCold = metrics.tokenRefreshCold || []
      metrics.tokenRefreshCold.push(coldDuration)
      expect(coldDuration).toBeLessThan(PERF_THRESHOLDS.sessionLoad.cold)

      // Measure warm start token refresh
      await page.evaluate(() => {
        window.localStorage.setItem(
          "sessionExpiry",
          new Date(Date.now() + 1000).toISOString()
        )
      })

      const warmStartTime = Date.now()
      await page.reload()
      await page.waitForSelector('[data-testid="profile-content"]')
      const warmDuration = Date.now() - warmStartTime

      metrics.tokenRefreshWarm = metrics.tokenRefreshWarm || []
      metrics.tokenRefreshWarm.push(warmDuration)
      expect(warmDuration).toBeLessThan(PERF_THRESHOLDS.sessionLoad.warm)
    })
  })
})
