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
 * Get the cookie domain based on the environment
 */
function getCookieDomain(): string | undefined {
  // In production, use the domain from environment variable
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined
  }
  return undefined
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined

  const cookies = document.cookie.split("; ")
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=")
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }
  return undefined
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
  const sameSite = options.sameSite ?? "strict"

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
      `[Cookie] Set ${name} cookie with domain=${domain || "none"}, secure=${secure}, path=${path}, sameSite=${sameSite}`
    )
  }
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== undefined
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
  const sameSite = "strict"

  // Set expiration to the past
  let cookieValue = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=${sameSite}`

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
      `[Cookie] Deleted ${name} cookie with domain=${domain || "none"}, secure=${secure}, sameSite=${sameSite}`
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
