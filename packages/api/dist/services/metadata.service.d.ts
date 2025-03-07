import { MetadataRequest, MetadataResponse, MetadataSearchQuery, MetadataSearchResponse } from "../types/metadata.types";
import { UserRole } from "../types/auth.types";
/**
 * Metadata service
 */
export declare const metadataService: {
    /**
     * Create new metadata
     */
    createMetadata: (userId: string, data: MetadataRequest) => Promise<MetadataResponse>;
    /**
     * Get metadata by ID
     */
    getMetadataById: (id: string) => Promise<MetadataResponse>;
    /**
     * Update metadata
     */
    updateMetadata: (id: string, userId: string, userRole: UserRole, data: MetadataRequest) => Promise<MetadataResponse>;
    /**
     * Delete metadata
     */
    deleteMetadata: (id: string, userId: string, userRole: UserRole) => Promise<void>;
    /**
     * Search metadata
     */
    searchMetadata: (query: MetadataSearchQuery) => Promise<MetadataSearchResponse>;
    /**
     * Get user's metadata
     */
    getUserMetadata: (userId: string, query: MetadataSearchQuery) => Promise<MetadataSearchResponse>;
};
