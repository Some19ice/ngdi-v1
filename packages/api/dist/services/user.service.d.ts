import { UserProfileRequest, UserResponse, UserListResponse, UserSearchQuery } from "../types/user.types";
import { UserRole } from "../types/auth.types";
/**
 * User service
 */
export declare const userService: {
    /**
     * Get user profile
     */
    getProfile: (userId: string) => Promise<UserResponse>;
    /**
     * Update user profile
     */
    updateProfile: (userId: string, data: UserProfileRequest) => Promise<UserResponse>;
    /**
     * Change user password
     */
    changePassword: (userId: string, currentPassword: string, newPassword?: string) => Promise<void>;
    /**
     * Get all users
     */
    getAllUsers: (query: UserSearchQuery) => Promise<UserListResponse>;
    /**
     * Get user by ID
     */
    getUserById: (userId: string) => Promise<UserResponse>;
    /**
     * Update user role
     */
    updateUserRole: (userId: string, role: UserRole) => Promise<UserResponse>;
    /**
     * Delete user (admin only)
     */
    deleteUser: (userId: string) => Promise<void>;
};
