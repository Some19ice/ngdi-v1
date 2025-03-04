import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { userService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth';
import { 
  ChangePasswordSchema, 
  UpdateProfileSchema, 
  UserIdParamSchema 
} from '../types/user.types';
import { UserRole } from '../types/auth.types';

/**
 * User routes
 */
export const userRouter = new Hono()
  // Apply authentication middleware to all routes
  .use('*', authMiddleware);

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.get('/profile', async (c) => {
  const userId = c.get('userId');
  const user = await userService.getProfile(userId);
  
  return c.json({
    success: true,
    data: user,
  });
});

/**
 * @openapi
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileSchema'
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.put('/profile', zValidator('json', UpdateProfileSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  
  const updatedUser = await userService.updateProfile(userId, data);
  
  return c.json({
    success: true,
    data: updatedUser,
  });
});

/**
 * @openapi
 * /api/users/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordSchema'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
userRouter.post('/change-password', zValidator('json', ChangePasswordSchema), async (c) => {
  const userId = c.get('userId');
  const { currentPassword, newPassword } = c.req.valid('json');
  
  await userService.changePassword(userId, currentPassword, newPassword);
  
  return c.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Admin-only routes
const adminRouter = new Hono()
  // Check if user is admin
  .use('*', async (c, next) => {
    const userRole = c.get('userRole');
    
    if (userRole !== UserRole.ADMIN) {
      return c.json({
        success: false,
        message: 'Unauthorized. Admin access required.',
      }, 403);
    }
    
    await next();
  });

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for email, first name, or last name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [USER, ADMIN]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get('/', async (c) => {
  const { page = '1', limit = '10', search, role } = c.req.query();
  
  const users = await userService.getAllUsers({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    role: role as UserRole | undefined,
  });
  
  return c.json({
    success: true,
    data: users,
  });
});

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.get('/:id', zValidator('param', UserIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  
  const user = await userService.getUserById(id);
  
  return c.json({
    success: true,
    data: user,
  });
});

/**
 * @openapi
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN]
 *     responses:
 *       200:
 *         description: User role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.put('/:id/role', zValidator('param', UserIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { role } = await c.req.json();
  
  if (!role || !Object.values(UserRole).includes(role as UserRole)) {
    return c.json({
      success: false,
      message: 'Invalid role',
    }, 400);
  }
  
  const updatedUser = await userService.updateUserRole(id, role as UserRole);
  
  return c.json({
    success: true,
    data: updatedUser,
  });
});

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
adminRouter.delete('/:id', zValidator('param', UserIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  
  await userService.deleteUser(id);
  
  return c.json({
    success: true,
    message: 'User deleted successfully',
  });
});

// Mount admin routes
userRouter.route('', adminRouter);

export default userRouter; 