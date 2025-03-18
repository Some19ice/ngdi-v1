import { Hono } from "hono"
import { metadataService } from "../services/metadata.service"
import { authMiddleware } from "../middleware/auth.middleware"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import {
  MetadataIdParamSchema,
  MetadataRequestSchema,
} from "../types/metadata.types"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"
import { prisma } from "../lib/prisma"

const metadata = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
  }
}>()

const metadataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  organization: z.string().min(1, "Organization is required"),
  dateFrom: z.string(),
  dateTo: z.string(),
  abstract: z.string().min(1, "Abstract is required"),
  purpose: z.string().min(1, "Purpose is required"),
  thumbnailUrl: z.string().url("Invalid thumbnail URL"),
  imageName: z.string(),
  frameworkType: z.string(),
  categories: z.array(z.string()),
  coordinateSystem: z.string(),
  projection: z.string(),
  scale: z.number().positive("Scale must be positive"),
  resolution: z.string().optional(),
  accuracyLevel: z.string(),
  completeness: z.number().min(0).max(100).optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string(),
  fileSize: z.number().positive("File size must be positive").optional(),
  numFeatures: z
    .number()
    .positive("Number of features must be positive")
    .optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.string().datetime().optional(),
  nextUpdate: z.string().datetime().optional(),
  distributionFormat: z.string(),
  accessMethod: z.string(),
  downloadUrl: z.string().url("Invalid download URL").optional(),
  apiEndpoint: z.string().url("Invalid API endpoint").optional(),
  licenseType: z.string(),
  usageTerms: z.string(),
  attributionRequirements: z.string(),
  accessRestrictions: z.array(z.string()),
  contactPerson: z.string(),
  email: z.string().email("Invalid email format"),
  department: z.string().optional(),
})

/**
 * Metadata routes
 */
metadata.use("*", authMiddleware)

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
metadata.post("/", zValidator("json", metadataSchema), async (c) => {
  const userId = c.get("userId")
  const data = await c.req.json()
  const result = await metadataService.createMetadata(data, userId)
  return c.json(result)
})

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
metadata.get("/:id", zValidator("param", MetadataIdParamSchema), async (c) => {
  const { id } = c.req.valid("param")

  // Find the metadata by ID
  const metadata = await prisma.metadata.findUnique({
    where: { id },
  })

  if (!metadata) {
    return c.json({ error: "Metadata not found" }, 404)
  }

  return c.json({
    metadata,
  })
})

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
metadata.put(
  "/:id",
  zValidator("param", MetadataIdParamSchema),
  zValidator("json", metadataSchema.partial()),
  async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const data = await c.req.json()
    const result = await metadataService.updateMetadata(id, data, userId)
    return c.json(result)
  }
)

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
metadata.delete(
  "/:id",
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    await metadataService.deleteMetadata(id, userId)
    return c.json({ message: "Metadata deleted successfully" })
  }
)

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
 *         name: frameworkType
 *         schema:
 *           type: string
 *         description: Filter by framework type (Vector, Raster, Table)
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
metadata.get("/search", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    frameworkType,
    dateFrom,
    dateTo,
  } = c.req.query()

  const result = await metadataService.searchMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    frameworkType,
    dateFrom,
    dateTo,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  return c.json({
    success: true,
    data: result,
  })
})

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
metadata.get("/user", async (c) => {
  const userId = c.get("userId")
  const { page = "1", limit = "10", search, category } = c.req.query()

  const result = await metadataService.getUserMetadata(userId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  return c.json(result)
})

// Export the router
export { metadata }
export default metadata
