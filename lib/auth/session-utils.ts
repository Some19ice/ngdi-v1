"use client"

// Constants for local storage keys
const MANUAL_SIGNOUT_KEY = 'auth_manual_signout'
const REMEMBER_ME_KEY = 'auth_remember_me'

/**
 * Sets a flag indicating the user manually signed out
 */
export function setManualSignOutFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MANUAL_SIGNOUT_KEY, 'true')
  }
}

/**
 * Checks if the user manually signed out previously
 */
export function hasManualSignOutFlag(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MANUAL_SIGNOUT_KEY) === 'true'
}

/**
 * Clears the manual sign out flag
 */
export function clearManualSignOutFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(MANUAL_SIGNOUT_KEY)
  }
}

/**
 * Sets the remember me flag for persistent sessions
 */
export function setRememberMeFlag(value: boolean): void {
  if (typeof window === 'undefined') return
  
  if (value) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true')
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY)
  }
}

/**
 * Checks if the remember me flag is set
 */
export function hasRememberMeFlag(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true'
}

/**
 * Clears the remember me flag
 */
export function clearRememberMeFlag(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(REMEMBER_ME_KEY)
  }
}

/**
 * Enforces session persistence by setting the appropriate session parameters
 * This is a placeholder - implement based on your auth system
 */
export async function enforceSessionPersistence(): Promise<void> {
  // Implement based on your auth system
  console.log('Session persistence enforced')
} 