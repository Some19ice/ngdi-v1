import { test, expect } from "@playwright/test"
import { testDataFactory } from "../helpers/test-data-factory"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

interface LCPEntry extends PerformanceEntry {
  startTime: number
}

interface FIDEntry extends PerformanceEntry {
  duration: number
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}

interface NavigationEntry extends PerformanceEntry {
  transferSize: number
  decodedBodySize: number
}

interface TimingMetrics {
  transferSize: number
  decodedBodySize: number
}

test.describe("Performance Metrics", () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance metrics
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test.afterEach(async () => {
    await testDataFactory.cleanupTestData()
  })

  test("should meet LCP threshold", async ({ page }) => {
    const navigationPromise = page.goto(BASE_URL)

    // Start measuring
    const lcpPromise = page.evaluate(() => {
      return new Promise<LCPEntry>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          if (entries.length > 0) {
            resolve(entries[entries.length - 1] as LCPEntry)
          }
        }).observe({ entryTypes: ["largest-contentful-paint"] })
      })
    })

    await navigationPromise
    const lcp = await lcpPromise

    // LCP should be under 2.5s for good UX
    expect(lcp.startTime).toBeLessThan(2500)
  })

  test("should meet FID threshold", async ({ page }) => {
    await page.goto(BASE_URL)

    const fid = await page.evaluate(() => {
      return new Promise<FIDEntry>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          if (entries.length > 0) {
            resolve(entries[0] as FIDEntry)
          }
        }).observe({ entryTypes: ["first-input"] })

        // Simulate user interaction
        setTimeout(() => {
          document.body.click()
        }, 100)
      })
    })

    // FID should be under 100ms for good UX
    expect(fid.duration).toBeLessThan(100)
  })

  test("should meet CLS threshold", async ({ page }) => {
    await page.goto(BASE_URL)

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          for (const entry of entries) {
            const layoutShift = entry as LayoutShiftEntry
            if (!layoutShift.hadRecentInput) {
              clsValue += layoutShift.value
            }
          }
          resolve(clsValue)
        }).observe({ entryTypes: ["layout-shift"] })

        // Wait for page to stabilize
        setTimeout(() => resolve(clsValue), 3000)
      })
    })

    // CLS should be under 0.1 for good UX
    expect(cls).toBeLessThan(0.1)
  })

  test("should optimize image loading", async ({ page }) => {
    const user = await testDataFactory.createUser()
    await testDataFactory.createMetadata(user.id)

    const [response] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("thumb.jpg") && response.status() === 200
      ),
      page.goto(`${BASE_URL}/metadata`),
    ])

    // Check image optimization headers
    const headers = response.headers()
    expect(headers["content-type"]).toMatch(/^image\/(webp|avif)/)
    expect(headers["cache-control"]).toContain("public")

    // Check if images have width and height attributes
    const images = await page.locator("img").all()
    for (const image of images) {
      const width = await image.getAttribute("width")
      const height = await image.getAttribute("height")
      expect(width).toBeTruthy()
      expect(height).toBeTruthy()
    }
  })

  test("should implement proper code splitting", async ({ page }) => {
    const navigationPromise = page.goto(BASE_URL)

    // Capture network requests
    const requests: { url: () => string; resourceType: () => string }[] = []
    page.on("request", (request) => {
      if (request.resourceType() === "script") {
        requests.push(request)
      }
    })

    await navigationPromise

    // Check if main bundle is split
    const jsRequests = requests.filter((req) => req.url().endsWith(".js"))
    expect(jsRequests.length).toBeGreaterThan(1)

    // Check dynamic imports
    await page.click('a[href="/metadata"]')
    const dynamicRequests = requests.filter(
      (req) => req.url().includes("metadata") && req.url().endsWith(".js")
    )
    expect(dynamicRequests.length).toBeGreaterThan(0)
  })

  test("should implement proper caching", async ({ page, context }) => {
    // First visit
    await page.goto(BASE_URL)

    // Second visit (should use cache)
    const [timing] = await Promise.all([
      page.evaluate(() => {
        return new Promise<TimingMetrics>((resolve) => {
          window.performance.mark("navigationStart")
          window.addEventListener("load", () => {
            window.performance.mark("loadComplete")
            const navigationEntry = window.performance.getEntriesByType(
              "navigation"
            )[0] as NavigationEntry
            resolve({
              transferSize: navigationEntry.transferSize,
              decodedBodySize: navigationEntry.decodedBodySize,
            })
          })
        })
      }),
      page.reload(),
    ])

    // Check if resources were served from cache
    expect(timing.transferSize).toBeLessThan(timing.decodedBodySize)
  })
})
