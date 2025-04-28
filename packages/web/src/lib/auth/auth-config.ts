/**
 * Centralized authentication configuration
 * This file contains all the configuration for the authentication system
 */

import { UserRole } from "./constants"

/**
 * Authentication paths
 */
export const AUTH_PATHS = {
  /**
   * The sign-in page path
   */
  SIGNIN: "/auth/signin",

  /**
   * The sign-up page path
   */
  SIGNUP: "/auth/signup",

  /**
   * The callback page path for OAuth providers
   */
  CALLBACK: "/auth/callback",

  /**
   * The reset password page path
   */
  RESET_PASSWORD: "/auth/reset-password",

  /**
   * The new user profile setup page path
   */
  NEW_USER: "/auth/new-user",

  /**
   * The unauthorized access page path
   */
  UNAUTHORIZED: "/unauthorized",

  /**
   * The verification page path
   */
  VERIFY: "/auth/verify",

  /**
   * The default redirect path after successful authentication
   */
  DEFAULT_REDIRECT: "/dashboard",
}

/**
 * Authentication token configuration
 */
export const AUTH_TOKEN_CONFIG = {
  /**
   * The name of the access token cookie
   */
  ACCESS_TOKEN_COOKIE: "access_token",

  /**
   * The name of the refresh token cookie
   */
  REFRESH_TOKEN_COOKIE: "refresh_token",

  /**
   * The name of the CSRF token cookie
   */
  CSRF_TOKEN_COOKIE: "csrf_token",

  /**
   * The name of the authenticated flag cookie
   */
  AUTHENTICATED_COOKIE: "authenticated",

  /**
   * The name of the remember me flag in localStorage
   */
  REMEMBER_ME_KEY: "remember_me",

  /**
   * The name of the access token in localStorage
   */
  ACCESS_TOKEN_KEY: "accessToken",

  /**
   * The name of the refresh token in localStorage
   */
  REFRESH_TOKEN_KEY: "refreshToken",

  /**
   * The name of the authenticated flag in localStorage
   */
  AUTHENTICATED_KEY: "authenticated",

  /**
   * The name of the user info in localStorage
   */
  USER_INFO_KEY: "user_info",

  /**
   * The expiration time for the access token in seconds
   */
  ACCESS_TOKEN_EXPIRATION: 60 * 60, // 1 hour

  /**
   * The expiration time for the refresh token in seconds
   */
  REFRESH_TOKEN_EXPIRATION: 60 * 60 * 24 * 7, // 7 days
}

/**
 * Route protection configuration
 */
export const ROUTE_PROTECTION = {
  /**
   * Routes that require authentication
   * These routes will redirect to the sign-in page if the user is not authenticated
   */
  PROTECTED_ROUTES: [
    "/dashboard",
    "/profile",
    "/metadata",
    "/settings",
    "/metadata/add",
    "/search/advanced",
    "/admin",
  ],

  /**
   * Routes that require admin role
   * These routes will redirect to the unauthorized page if the user is not an admin
   */
  ADMIN_ROUTES: [
    "/admin",
    "/admin/users",
    "/admin/settings",
    "/admin/metadata",
  ],

  /**
   * Routes that require node officer role
   * These routes will redirect to the unauthorized page if the user is not a node officer
   */
  NODE_OFFICER_ROUTES: [
    "/metadata/approve",
    "/metadata/review",
  ],

  /**
   * Routes that should bypass middleware protection in development
   */
  DEBUG_ROUTES: [
    "/auth/debug",
    "/auth/diagnostic",
    "/test-middleware",
    "/api/auth-debug",
  ],

  /**
   * Public routes that don't require authentication
   */
  PUBLIC_ROUTES: [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/auth/reset-password",
    "/auth/callback",
    "/auth/verify",
    "/unauthorized",
    "/about",
    "/contact",
    "/search",
    "/documentation",
    "/gallery",
    "/news",
  ],
}

/**
 * Role-based access control configuration
 */
export const RBAC_CONFIG = {
  /**
   * Role hierarchy
   * Higher roles inherit permissions from lower roles
   */
  ROLE_HIERARCHY: {
    [UserRole.ADMIN]: [UserRole.NODE_OFFICER, UserRole.USER],
    [UserRole.NODE_OFFICER]: [UserRole.USER],
    [UserRole.USER]: [],
  },

  /**
   * Role permissions
   * Each role has a set of permissions
   */
  ROLE_PERMISSIONS: {
    [UserRole.ADMIN]: [
      "user:read",
      "user:write",
      "user:delete",
      "metadata:read",
      "metadata:write",
      "metadata:delete",
      "metadata:approve",
      "settings:read",
      "settings:write",
    ],
    [UserRole.NODE_OFFICER]: [
      "metadata:read",
      "metadata:write",
      "metadata:approve",
    ],
    [UserRole.USER]: [
      "metadata:read",
      "metadata:write",
    ],
  },
}

/**
 * Authentication error messages
 */
export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_LOCKED: "Your account has been locked due to too many failed login attempts",
  EMAIL_NOT_VERIFIED: "Please verify your email address before signing in",
  SESSION_EXPIRED: "Your session has expired, please sign in again",
  UNAUTHORIZED: "You are not authorized to access this resource",
  SERVER_ERROR: "An error occurred while processing your request",
  NETWORK_ERROR: "Unable to connect to the server",
  INVALID_TOKEN: "Invalid authentication token",
  PASSWORD_RESET_REQUIRED: "You need to reset your password",
  PASSWORD_EXPIRED: "Your password has expired, please change it",
}

/**
 * Authentication configuration
 */
export const AUTH_CONFIG = {
  PATHS: AUTH_PATHS,
  TOKEN: AUTH_TOKEN_CONFIG,
  ROUTES: ROUTE_PROTECTION,
  RBAC: RBAC_CONFIG,
  ERROR_MESSAGES: AUTH_ERROR_MESSAGES,
}

export default AUTH_CONFIG
