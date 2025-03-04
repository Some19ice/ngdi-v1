import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/auth.types';

// Create a test Prisma client
export const prisma = new PrismaClient();

// Clean up database before tests
export async function clearDatabase() {
  // Delete all records in reverse order of dependencies
  await prisma.metadata.deleteMany({});
  await prisma.user.deleteMany({});
}

// Create a test user
export async function createTestUser(role: UserRole = UserRole.USER) {
  return prisma.user.create({
    data: {
      email: 'test@example.com',
      password: '$2b$10$dGOOJw4CYC/nJD9QzpXr0eM7xY1ERhimqRy4t.wTmYF3iHbJbkKYK', // hashed 'password123'
      firstName: 'Test',
      lastName: 'User',
      role,
      isEmailVerified: true,
    },
  });
}

// Create a test admin user
export async function createTestAdmin() {
  return createTestUser(UserRole.ADMIN);
}

// Generate a test JWT token
export function generateTestToken(userId: string, role: UserRole = UserRole.USER) {
  return jwt.sign(
    {
      userId,
      role,
    },
    config.jwtSecret,
    {
      expiresIn: '1h',
    }
  );
}

// Create test metadata
export async function createTestMetadata(userId: string) {
  return prisma.metadata.create({
    data: {
      title: 'Test Metadata',
      author: 'Test Author',
      organization: 'Test Organization',
      dateFrom: '2023-01-01',
      dateTo: '2023-12-31',
      abstract: 'Test abstract',
      purpose: 'Test purpose',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      imageName: 'thumbnail.jpg',
      frameworkType: 'Test Framework',
      categories: ['Test Category'],
      coordinateSystem: 'WGS84',
      projection: 'UTM',
      scale: '1:1000',
      accuracyLevel: 'High',
      fileFormat: 'GeoJSON',
      distributionFormat: 'Digital',
      accessMethod: 'Download',
      licenseType: 'CC BY 4.0',
      usageTerms: 'Attribution required',
      attributionRequirements: 'Cite source',
      accessRestrictions: 'None',
      contactPerson: 'Test Contact',
      email: 'contact@example.com',
      userId,
    },
  });
}

// Global setup
export async function setupTestEnvironment() {
  // Clear database
  await clearDatabase();
  
  // Create test users
  const user = await createTestUser();
  const admin = await createTestAdmin();
  
  // Create test metadata
  await createTestMetadata(user.id);
  
  return {
    user,
    admin,
    userToken: generateTestToken(user.id, UserRole.USER),
    adminToken: generateTestToken(admin.id, UserRole.ADMIN),
  };
}

// Global teardown
export async function teardownTestEnvironment() {
  await clearDatabase();
  await prisma.$disconnect();
}

// Helper to create a test request
export function createTestRequest(app: any, method: string, path: string, token?: string, body?: any) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  
  return app.fetch(req);
} 