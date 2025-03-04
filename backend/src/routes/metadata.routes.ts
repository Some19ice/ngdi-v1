import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { metadataService } from '../services/metadata.service';
import { authMiddleware } from '../middleware/auth';
import { 
  MetadataIdParamSchema,
  MetadataRequestSchema
} from '../types/metadata.types';
import { UserRole } from '../types/auth.types';

/**
 * Metadata routes
 */
export const metadataRouter = new Hono()
  // Apply authentication middleware to all routes
  .use('*', authMiddleware);

/**
 * @openapi
 * /api/metadata:
 *   post:
 *     summary: Create new metadata
 *     tags: [Metadata]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetadataRequestSchema'
 *     responses:
 *       201:
 *         description: Metadata created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
metadataRouter.post('/', zValidator('json', MetadataRequestSchema), async (c) => {
  const userId = c.get('userId');
  const data = c.req.valid('json');
  
  const metadata = await metadataService.createMetadata(userId, data);
  
  return c.json({
    success: true,
    data: metadata,
  }, 201);
});

/**
 * @openapi
 * /api/metadata/{id}:
 *   get:
 *     summary: Get metadata by ID
 *     tags: [Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Metadata ID
 *     responses:
 *       200:
 *         description: Metadata details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
metadataRouter.get('/:id', zValidator('param', MetadataIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  
  const metadata = await metadataService.getMetadataById(id);
  
  return c.json({
    success: true,
    data: metadata,
  });
});

/**
 * @openapi
 * /api/metadata/{id}:
 *   put:
 *     summary: Update metadata
 *     tags: [Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Metadata ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetadataRequestSchema'
 *     responses:
 *       200:
 *         description: Metadata updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataResponse'
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
metadataRouter.put('/:id', zValidator('param', MetadataIdParamSchema), zValidator('json', MetadataRequestSchema), async (c) => {
  const { id } = c.req.valid('param');
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  const data = c.req.valid('json');
  
  const metadata = await metadataService.updateMetadata(id, userId, userRole, data);
  
  return c.json({
    success: true,
    data: metadata,
  });
});

/**
 * @openapi
 * /api/metadata/{id}:
 *   delete:
 *     summary: Delete metadata
 *     tags: [Metadata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Metadata ID
 *     responses:
 *       200:
 *         description: Metadata deleted successfully
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
metadataRouter.delete('/:id', zValidator('param', MetadataIdParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const userId = c.get('userId');
  const userRole = c.get('userRole');
  
  await metadataService.deleteMetadata(id, userId, userRole);
  
  return c.json({
    success: true,
    message: 'Metadata deleted successfully',
  });
});

/**
 * @openapi
 * /api/metadata/search:
 *   get:
 *     summary: Search metadata
 *     tags: [Metadata]
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
 *         description: Search term for title, author, or organization
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date from
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date to
 *     responses:
 *       200:
 *         description: List of metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
metadataRouter.get('/search', async (c) => {
  const { 
    page = '1', 
    limit = '10', 
    search, 
    category,
    dateFrom,
    dateTo
  } = c.req.query();
  
  const result = await metadataService.searchMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    dateFrom,
    dateTo,
  });
  
  return c.json({
    success: true,
    data: result,
  });
});

/**
 * @openapi
 * /api/metadata/user:
 *   get:
 *     summary: Get current user's metadata
 *     tags: [Metadata]
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
 *         description: Search term for title, author, or organization
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of user's metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
metadataRouter.get('/user', async (c) => {
  const userId = c.get('userId');
  const { 
    page = '1', 
    limit = '10', 
    search, 
    category 
  } = c.req.query();
  
  const result = await metadataService.getUserMetadata(userId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
  });
  
  return c.json({
    success: true,
    data: result,
  });
});

export default metadataRouter; 