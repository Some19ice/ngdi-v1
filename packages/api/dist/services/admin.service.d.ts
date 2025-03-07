import { UserRole } from "../types/auth.types";
import { UserResponse, UserSearchQuery, UserSearchResponse } from "../types/user.types";
import { MetadataSearchQuery, MetadataSearchResponse } from "../types/metadata.types";
/**
 * Admin service for administrative operations
 */
export declare const adminService: {
    /**
     * Get system statistics
     */
    getSystemStats: () => Promise<{
        totalUsers: number;
        totalMetadata: number;
        newUsersLast30Days: number;
        newMetadataLast30Days: number;
        usersByRole: Record<UserRole, number>;
    }>;
    /**
     * Get all users with pagination and filtering
     */
    getAllUsers: (query: UserSearchQuery) => Promise<UserSearchResponse>;
    /**
     * Update user role
     */
    updateUserRole: (userId: string, role: UserRole) => Promise<UserResponse>;
    /**
     * Delete user
     */
    deleteUser: (userId: string) => Promise<void>;
    /**
     * Get all metadata with pagination and filtering
     */
    getAllMetadata: (query: MetadataSearchQuery) => Promise<MetadataSearchResponse>;
    /**
     * Delete metadata
     */
    deleteMetadata: (id: string) => Promise<void>;
    /**
     * Verify user's email manually
     */
    verifyUserEmail: (userId: string) => Promise<UserResponse>;
};
