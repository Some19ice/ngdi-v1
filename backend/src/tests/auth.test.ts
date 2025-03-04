import app from '../index';
import { 
  clearDatabase, 
  createTestUser, 
  prisma, 
  createTestRequest 
} from './setup';
import { UserRole } from '../types/auth.types';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await createTestRequest(app, 'POST', '/api/auth/register', undefined, {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      });

      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('email', 'newuser@example.com');
      expect(data.data).toHaveProperty('firstName', 'New');
      expect(data.data).toHaveProperty('lastName', 'User');
      expect(data.data).toHaveProperty('role', UserRole.USER);
      expect(data.data).not.toHaveProperty('password');
      
      // Verify user was created in the database
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });
      
      expect(user).not.toBeNull();
      expect(user?.email).toBe('newuser@example.com');
    });

    it('should return 400 if email already exists', async () => {
      // Create a user first
      await createTestUser();
      
      // Try to register with the same email
      const response = await createTestRequest(app, 'POST', '/api/auth/register', undefined, {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('already exists');
    });

    it('should return 400 if validation fails', async () => {
      const response = await createTestRequest(app, 'POST', '/api/auth/register', undefined, {
        email: 'invalid-email',
        password: '123', // Too short
        firstName: '',
        lastName: '',
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('errors');
      expect(Array.isArray(data.errors)).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await clearDatabase();
      await createTestUser();
    });

    it('should login a user with valid credentials', async () => {
      const response = await createTestRequest(app, 'POST', '/api/auth/login', undefined, {
        email: 'test@example.com',
        password: 'password123',
      });

      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('accessToken');
      expect(data.data).toHaveProperty('refreshToken');
      expect(data.data).toHaveProperty('user');
      expect(data.data.user).toHaveProperty('email', 'test@example.com');
      expect(data.data.user).not.toHaveProperty('password');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await createTestRequest(app, 'POST', '/api/auth/login', undefined, {
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      const response = await createTestRequest(app, 'POST', '/api/auth/login', undefined, {
        email: 'invalid-email',
        password: '',
      });

      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('errors');
    });
  });

  // Additional tests for other auth routes can be added here
}); 