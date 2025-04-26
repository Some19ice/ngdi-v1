import { z } from "zod";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  image?: string;
  organization?: string;
  department?: string;
  phone?: string;
  permissions?: { action: string; subject: string }[];
  customRole?: string;
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}

export const userUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  currentPassword: z.string().optional(),
});

export type UserRole = "USER" | "ADMIN" | "NODE_OFFICER" | "EDITOR" | "REVIEWER";

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  organization?: string;
  department?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
