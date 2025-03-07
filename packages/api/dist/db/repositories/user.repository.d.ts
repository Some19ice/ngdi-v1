import { Prisma, User } from "@prisma/client";
import { UserListQuery } from "../../types/user.types";
/**
 * User repository for database operations
 */
export declare const userRepository: {
    /**
     * Find a user by ID
     */
    findById: (id: string) => Promise<User | null>;
    /**
     * Find a user by email
     */
    findByEmail: (email: string) => Promise<User | null>;
    /**
     * Create a new user
     */
    create: (data: Prisma.UserCreateInput) => Promise<User>;
    /**
     * Update a user
     */
    update: (id: string, data: Prisma.UserUpdateInput) => Promise<User>;
    /**
     * Delete a user
     */
    delete: (id: string) => Promise<User>;
    /**
     * Find all users with pagination and filtering
     */
    findAll: (query: UserListQuery) => Promise<{
        users: {
            name: string | null;
            email: string;
            password: string;
            organization: string | null;
            department: string | null;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            emailVerified: Date | null;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Count total users
     */
    count: () => Promise<number>;
    /**
     * Count users created after a specific date
     */
    countCreatedAfter: (date: Date) => Promise<number>;
    /**
     * Count users by role
     */
    countByRole: () => Promise<Record<string, number>>;
};
