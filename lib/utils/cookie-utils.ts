/**
 * Cookie utilities for cross-domain authentication
 */

interface CookieOptions {
  maxAge?: number
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Get cookie domain based on current hostname
 */
export function getCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined

  // Use environment variable if available
  if (process.env.NEXT_PUBLIC_COOKIE_DOMAIN) {
    return process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  }

  // Handle localhost
  const hostname = window.location.hostname
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return undefined
  }

  // For production domain, extract top-level domain
  // e.g., ngdi-v1.vercel.app -> .vercel.app
  const hostParts = hostname.split(".")
  if (hostParts.length >= 2) {
    return `.${hostParts.slice(-2).join(".")}`
  }

  return hostname
}

/**
 * Set a cookie with cross-domain support
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") return

  const secure =
    options.secure ??
    (process.env.NEXT_PUBLIC_SECURE_COOKIES === "true" ||
      window.location.protocol === "https:")
  const domain = options.domain ?? getCookieDomain()
  const maxAge = options.maxAge ?? 60 * 60 * 24 // 1 day default
  const path = options.path ?? "/"
  const sameSite = options.sameSite ?? "lax"

  let cookieValue = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; samesite=${sameSite}`

  if (secure) {
    cookieValue += "; secure"
  }

  if (domain) {
    cookieValue += `; domain=${domain}`
  }

  document.cookie = cookieValue

  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_AUTH === "true"
  ) {
    console.log(
      `[Cookie] Set ${name} cookie with domain=${domain || "none"}, secure=${secure}, path=${path}`
    )
  }
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  const value = match ? decodeURIComponent(match[2]) : null

  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_AUTH === "true"
  ) {
    console.log(`[Cookie] Getting ${name}: ${value ? "found" : "not found"}`)
  }

  return value
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return

  const domain = getCookieDomain()
  const secure =
    process.env.NEXT_PUBLIC_SECURE_COOKIES === "true" ||
    window.location.protocol === "https:"

  // Set expiration to the past
  let cookieValue = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`

  if (secure) {
    cookieValue += "; secure"
  }

  if (domain) {
    cookieValue += `; domain=${domain}`
  }

  document.cookie = cookieValue

  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_AUTH === "true"
  ) {
    console.log(
      `[Cookie] Deleted ${name} cookie with domain=${domain || "none"}`
    )
  }
}

/**
 * Check if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  if (typeof document === "undefined") return false

  // Try to set a test cookie
  const testKey = "__cookie_test__"
  const testValue = "test"

  try {
    document.cookie = `${testKey}=${testValue}; path=/; max-age=10`
    const cookieEnabled = document.cookie.indexOf(testKey) !== -1

    // Clean up
    deleteCookie(testKey)

    return cookieEnabled
  } catch (e) {
    return false
  }
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {}

  return document.cookie
    .split(";")
    .reduce((cookies: Record<string, string>, cookie) => {
      const [name, value] = cookie.trim().split("=")
      if (name && value) {
        cookies[name] = decodeURIComponent(value)
      }
      return cookies
    }, {})
}
