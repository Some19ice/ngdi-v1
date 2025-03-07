import { Hono } from "hono";
import { UserRole } from "./auth.types";
export interface TestUser {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    name?: string;
    emailVerified?: Date | null;
    image?: string | null;
    organization?: string | null;
    department?: string | null;
    phone?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TestMetadata {
    id: string;
    title: string;
    author: string;
    organization: string;
    dateFrom: string;
    dateTo: string;
    abstract: string;
    purpose: string;
    thumbnailUrl: string;
    imageName: string;
    frameworkType: string;
    categories: string[];
    coordinateSystem: string;
    projection: string;
    scale: number;
    resolution?: string;
    accuracyLevel: string;
    completeness?: number;
    consistencyCheck?: boolean;
    validationStatus?: string;
    fileFormat: string;
    fileSize?: number;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface TestEnvironment {
    user: TestUser;
    admin: TestUser;
    userToken: string;
    adminToken: string;
}
export type TestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
export interface TestRequestOptions {
    method: string;
    path: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
}
export type TestApp = Hono;
export interface TestResponse {
    status: number;
    headers: Headers;
    body: unknown;
}
