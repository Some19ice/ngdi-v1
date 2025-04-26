/**
 * Account Lockout Utilities
 * 
 * This module provides utilities for account lockout protection.
 */

interface LockoutState {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

// Store lockout state for different accounts
const lockoutStore = new Map<string, LockoutState>();

// Lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_RESET_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Record a failed login attempt
 * @param email The email address that failed to login
 * @returns Information about the lockout status
 */
export function recordFailedLoginAttempt(email: string): { 
  locked: boolean; 
  attemptsRemaining: number;
  lockedUntil: number | null;
} {
  const now = Date.now();
  const state = lockoutStore.get(email) || { 
    failedAttempts: 0, 
    lockedUntil: null,
    lastAttempt: now
  };
  
  // Check if previous attempts should be reset due to time elapsed
  if (state.lastAttempt && (now - state.lastAttempt > ATTEMPT_RESET_MS)) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
  }
  
  // Check if account is locked
  if (state.lockedUntil && now < state.lockedUntil) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: state.lockedUntil
    };
  }
  
  // If previously locked but now expired, reset counter
  if (state.lockedUntil && now >= state.lockedUntil) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
  }
  
  // Increment failed attempts
  state.failedAttempts += 1;
  state.lastAttempt = now;
  
  // Check if account should be locked
  if (state.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  
  // Update store
  lockoutStore.set(email, state);
  
  return {
    locked: !!state.lockedUntil,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - state.failedAttempts),
    lockedUntil: state.lockedUntil
  };
}

/**
 * Check if an account is locked
 * @param email The email address to check
 * @returns Information about the lockout status
 */
export function checkAccountLockout(email: string): { 
  locked: boolean; 
  attemptsRemaining: number;
  lockedUntil: number | null;
} {
  const now = Date.now();
  const state = lockoutStore.get(email);
  
  if (!state) {
    return {
      locked: false,
      attemptsRemaining: MAX_FAILED_ATTEMPTS,
      lockedUntil: null
    };
  }
  
  // Check if previous attempts should be reset due to time elapsed
  if (state.lastAttempt && (now - state.lastAttempt > ATTEMPT_RESET_MS)) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
    lockoutStore.set(email, state);
  }
  
  // Check if account is locked
  if (state.lockedUntil && now < state.lockedUntil) {
    return {
      locked: true,
      attemptsRemaining: 0,
      lockedUntil: state.lockedUntil
    };
  }
  
  // If previously locked but now expired, reset counter
  if (state.lockedUntil && now >= state.lockedUntil) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
    lockoutStore.set(email, state);
  }
  
  return {
    locked: false,
    attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - state.failedAttempts),
    lockedUntil: state.lockedUntil
  };
}

/**
 * Reset failed login attempts for an account
 * @param email The email address to reset
 */
export function resetFailedLoginAttempts(email: string): void {
  const state = lockoutStore.get(email);
  
  if (state) {
    state.failedAttempts = 0;
    state.lockedUntil = null;
    state.lastAttempt = Date.now();
    lockoutStore.set(email, state);
  }
}
