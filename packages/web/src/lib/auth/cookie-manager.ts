/**
 * Cookie management utilities for authentication
 * This file provides optimized cookie handling for auth tokens
 */

import { supabaseAuthConfig } from "./supabase-auth.config"
import { AuthSession } from "./auth-types"

/**
 * Cookie options interface
 */
interface CookieOptions {
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
  secure?: boolean
  httpOnly?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Default cookie options based on auth configuration
 */
const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: supabaseAuthConfig.cookies.path,
  domain: supabaseAuthConfig.cookies.domain,
  maxAge: supabaseAuthConfig.cookies.maxAge,
  secure: supabaseAuthConfig.cookies.secure,
  sameSite: supabaseAuthConfig.cookies.sameSite,
  httpOnly: false, // Client-side cookies can't be httpOnly
}

/**
 * Get a cookie by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  
  const cookies = document.cookie.split(";")
  
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    
    // Check if this cookie starts with the name we're looking for
    if (cookie.startsWith(name + "=")) {
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  
  return null
}

/**
 * Set a cookie
 * @param name Cookie name
 * @param value Cookie value
 * @param options Cookie options
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === "undefined") return
  
  const mergedOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options }
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
  
  if (mergedOptions.path) {
    cookieString += `; path=${mergedOptions.path}`
  }
  
  if (mergedOptions.domain) {
    cookieString += `; domain=${mergedOptions.domain}`
  }
  
  if (mergedOptions.maxAge) {
    cookieString += `; max-age=${mergedOptions.maxAge}`
  }
  
  if (mergedOptions.expires) {
    cookieString += `; expires=${mergedOptions.expires.toUTCString()}`
  }
  
  if (mergedOptions.secure) {
    cookieString += "; secure"
  }
  
  if (mergedOptions.httpOnly) {
    cookieString += "; httpOnly"
  }
  
  if (mergedOptions.sameSite) {
    cookieString += `; samesite=${mergedOptions.sameSite}`
  }
  
  document.cookie = cookieString
}

/**
 * Remove a cookie
 * @param name Cookie name
 * @param options Cookie options
 */
export function removeCookie(name: string, options: CookieOptions = {}): void {
  // Set expiration to a past date to remove the cookie
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
    maxAge: 0,
  })
}

/**
 * Cookie names for auth
 */
export const AUTH_COOKIES = {
  /**
   * Session cookie name
   */
  session: `${supabaseAuthConfig.cookies.prefix}_session`,
  
  /**
   * Access token cookie name
   */
  accessToken: `${supabaseAuthConfig.cookies.prefix}_access_token`,
  
  /**
   * Refresh token cookie name
   */
  refreshToken: `${supabaseAuthConfig.cookies.prefix}_refresh_token`,
  
  /**
   * User cookie name
   */
  user: `${supabaseAuthConfig.cookies.prefix}_user`,
}

/**
 * Store auth session in cookies
 * @param session Auth session
 * @param rememberMe Whether to remember the session
 */
export function storeSessionInCookies(
  session: AuthSession,
  rememberMe: boolean = false
): void {
  const maxAge = rememberMe
    ? supabaseAuthConfig.session.rememberMeAge
    : supabaseAuthConfig.session.maxAge
  
  // Store user data
  setCookie(
    AUTH_COOKIES.user,
    JSON.stringify(session.user),
    { maxAge }
  )
  
  // Store access token
  setCookie(
    AUTH_COOKIES.accessToken,
    session.accessToken,
    { maxAge }
  )
  
  // Store refresh token with longer expiry
  setCookie(
    AUTH_COOKIES.refreshToken,
    session.refreshToken,
    { maxAge: supabaseAuthConfig.security.refreshTokenMaxAge }
  )
  
  // Store session data
  setCookie(
    AUTH_COOKIES.session,
    JSON.stringify({
      expiresAt: session.expiresAt,
      rememberMe,
    }),
    { maxAge }
  )
}

/**
 * Get auth session from cookies
 * @returns Auth session or null if not found
 */
export function getSessionFromCookies(): Partial<AuthSession> | null {
  try {
    const userJson = getCookie(AUTH_COOKIES.user)
    const accessToken = getCookie(AUTH_COOKIES.accessToken)
    const refreshToken = getCookie(AUTH_COOKIES.refreshToken)
    const sessionJson = getCookie(AUTH_COOKIES.session)
    
    if (!userJson || !accessToken) return null
    
    const user = JSON.parse(userJson)
    const session = sessionJson ? JSON.parse(sessionJson) : {}
    
    return {
      user,
      accessToken,
      refreshToken: refreshToken || undefined,
      expiresAt: session.expiresAt,
    }
  } catch (error) {
    console.error("Failed to get session from cookies:", error)
    return null
  }
}

/**
 * Clear auth session cookies
 */
export function clearSessionCookies(): void {
  removeCookie(AUTH_COOKIES.user)
  removeCookie(AUTH_COOKIES.accessToken)
  removeCookie(AUTH_COOKIES.refreshToken)
  removeCookie(AUTH_COOKIES.session)
}

/**
 * Check if session cookies exist
 * @returns True if session cookies exist
 */
export function hasSessionCookies(): boolean {
  return !!(
    getCookie(AUTH_COOKIES.user) &&
    getCookie(AUTH_COOKIES.accessToken)
  )
}

/**
 * Check if session cookies are expired
 * @returns True if session cookies are expired
 */
export function isSessionExpired(): boolean {
  try {
    const sessionJson = getCookie(AUTH_COOKIES.session)
    
    if (!sessionJson) return true
    
    const session = JSON.parse(sessionJson)
    
    if (!session.expiresAt) return true
    
    return new Date(session.expiresAt).getTime() < Date.now()
  } catch (error) {
    console.error("Failed to check if session is expired:", error)
    return true
  }
}
