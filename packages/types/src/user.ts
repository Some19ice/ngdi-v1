export enum UserRole {
  USER = "USER",
  NODE_OFFICER = "NODE_OFFICER",
  ADMIN = "ADMIN",
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  organization?: string | null;
  image?: string | null;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  organization?: string;
  department?: string;
  phone?: string;
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

/**
 * Role display names for UI presentation
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.USER]: "User",
  [UserRole.NODE_OFFICER]: "Node Officer",
  [UserRole.ADMIN]: "Administrator",
};
