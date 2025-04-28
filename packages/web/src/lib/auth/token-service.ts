"use client"

import AUTH_CONFIG from "./auth-config"
import { jwtDecode } from "jwt-decode"

// Destructure for easier access
const {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  AUTHENTICATED_COOKIE,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTHENTICATED_KEY,
  USER_INFO_KEY,
  REMEMBER_ME_KEY,
} = AUTH_CONFIG.TOKEN

/**
 * JWT token payload interface
 */
export interface JwtPayload {
  sub: string
  email: string
  role: string
  iat: number
  exp: number
  jti: string
  [key: string]: any
}

/**
 * Token service for managing authentication tokens
 */
export const tokenService = {
  /**
   * Sets the access token in localStorage and/or cookies
   * @param token The access token to set
   * @param rememberMe Whether to remember the user
   */
  setAccessToken(token: string, rememberMe: boolean = false): void {
    if (typeof window === "undefined") return

    // Always store in localStorage for the current session
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    
    // Set the remember me flag if needed
    if (rememberMe) {
      localStorage.setItem(REMEMBER_ME_KEY, "true")
    }

    // Set the authenticated flag
    localStorage.setItem(AUTHENTICATED_KEY, "true")

    // Set the token in a cookie for server-side access
    this.setCookie(ACCESS_TOKEN_COOKIE, token, rememberMe ? 7 : 1)
    this.setCookie(AUTHENTICATED_COOKIE, "true", rememberMe ? 7 : 1)
  },

  /**
   * Sets the refresh token in localStorage and/or cookies
   * @param token The refresh token to set
   * @param rememberMe Whether to remember the user
   */
  setRefreshToken(token: string, rememberMe: boolean = false): void {
    if (typeof window === "undefined") return

    // Always store in localStorage for the current session
    localStorage.setItem(REFRESH_TOKEN_KEY, token)

    // Set the token in a cookie for server-side access if remember me is enabled
    if (rememberMe) {
      this.setCookie(REFRESH_TOKEN_COOKIE, token, 30) // 30 days
    }
  },

  /**
   * Gets the access token from localStorage or cookies
   * @returns The access token or null if not found
   */
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null

    // First try localStorage
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token) return token

    // Then try cookies
    return this.getCookie(ACCESS_TOKEN_COOKIE)
  },

  /**
   * Gets the refresh token from localStorage or cookies
   * @returns The refresh token or null if not found
   */
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null

    // First try localStorage
    const token = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (token) return token

    // Then try cookies
    return this.getCookie(REFRESH_TOKEN_COOKIE)
  },

  /**
   * Clears all authentication tokens and data
   */
  clearTokens(): void {
    if (typeof window === "undefined") return

    // Clear localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(AUTHENTICATED_KEY)
    localStorage.removeItem(USER_INFO_KEY)

    // Don't clear remember me flag to maintain user preference

    // Clear cookies
    this.deleteCookie(ACCESS_TOKEN_COOKIE)
    this.deleteCookie(REFRESH_TOKEN_COOKIE)
    this.deleteCookie(AUTHENTICATED_COOKIE)
  },

  /**
   * Checks if the user is authenticated based on the presence of a valid token
   * @returns True if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    if (!token) return false

    try {
      const decoded = this.decodeToken(token)
      const currentTime = Math.floor(Date.now() / 1000)
      
      // Check if token is expired
      if (decoded.exp && decoded.exp < currentTime) {
        return false
      }
      
      return true
    } catch (error) {
      console.error("Error decoding token:", error)
      return false
    }
  },

  /**
   * Decodes a JWT token
   * @param token The JWT token to decode
   * @returns The decoded token payload
   */
  decodeToken(token: string): JwtPayload {
    try {
      return jwtDecode<JwtPayload>(token)
    } catch (error) {
      console.error("Error decoding token:", error)
      throw new Error("Invalid token")
    }
  },

  /**
   * Gets the user info from the token
   * @returns The user info or null if not authenticated
   */
  getUserInfo(): any {
    const token = this.getAccessToken()
    if (!token) return null

    try {
      const decoded = this.decodeToken(token)
      return {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      }
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  },

  /**
   * Sets a cookie
   * @param name The cookie name
   * @param value The cookie value
   * @param days The number of days until the cookie expires
   */
  setCookie(name: string, value: string, days: number): void {
    if (typeof window === "undefined") return

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  },

  /**
   * Gets a cookie value
   * @param name The cookie name
   * @returns The cookie value or null if not found
   */
  getCookie(name: string): string | null {
    if (typeof window === "undefined") return null

    const nameEQ = `${name}=`
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  },

  /**
   * Deletes a cookie
   * @param name The cookie name
   */
  deleteCookie(name: string): void {
    if (typeof window === "undefined") return

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`
  },

  /**
   * Checks if the remember me flag is set
   * @returns True if remember me is enabled, false otherwise
   */
  hasRememberMe(): boolean {
    if (typeof window === "undefined") return false

    return localStorage.getItem(REMEMBER_ME_KEY) === "true"
  },

  /**
   * Sets the remember me flag
   * @param value Whether to remember the user
   */
  setRememberMe(value: boolean): void {
    if (typeof window === "undefined") return

    if (value) {
      localStorage.setItem(REMEMBER_ME_KEY, "true")
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY)
    }
  },
}

export default tokenService
