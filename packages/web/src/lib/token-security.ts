/**
 * Token Security Utilities
 * 
 * This module provides utilities for secure token handling.
 */

// Token storage key
const TOKEN_STORAGE_KEY = 'auth_token';

// Store token with expiration
export function storeToken(token: string, expiresInSeconds: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  
  try {
    // Store token with expiration time
    const tokenData = {
      value: token,
      expiresAt,
    };
    
    // Use secure storage
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
  } catch (error) {
    console.error('Failed to store token:', error);
  }
}

// Get token if valid
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const tokenDataStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (!tokenDataStr) {
      return null;
    }
    
    const tokenData = JSON.parse(tokenDataStr);
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      // Remove expired token
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    
    return tokenData.value;
  } catch (error) {
    console.error('Failed to get token:', error);
    return null;
  }
}

// Remove token
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
}

// Check if token is about to expire (within 5 minutes)
export function isTokenExpiringSoon(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const tokenDataStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (!tokenDataStr) {
      return false;
    }
    
    const tokenData = JSON.parse(tokenDataStr);
    const fiveMinutesInMs = 5 * 60 * 1000;
    
    // Check if token expires within 5 minutes
    return Date.now() + fiveMinutesInMs > tokenData.expiresAt;
  } catch (error) {
    console.error('Failed to check token expiration:', error);
    return false;
  }
}
