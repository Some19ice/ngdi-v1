/**
 * User roles in the system
 */
export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  NODE_OFFICER = "NODE_OFFICER",
  GUEST = "GUEST",
}

/**
 * Permission levels for various actions
 */
export enum PermissionLevel {
  NONE = "NONE",
  READ = "READ",
  WRITE = "WRITE",
  ADMIN = "ADMIN",
}

/**
 * Authentication status
 */
export enum AuthStatus {
  LOADING = "LOADING",
  AUTHENTICATED = "AUTHENTICATED",
  UNAUTHENTICATED = "UNAUTHENTICATED",
}
