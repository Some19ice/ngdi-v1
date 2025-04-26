import { Hono } from "hono"
import { metadataService } from "../services/metadata.service"
import { 
  authMiddleware, 
  requirePermission, 
  requireOwnership,
  requireAnyPermission
} from "../middleware"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import {
  MetadataIdParamSchema,
  MetadataRequestSchema,
} from "../types/metadata.types"
import { UserRole } from "../types/auth.types"
import { Context } from "../types/hono.types"
import { prisma } from "../lib/prisma"
import { SafeJSON } from "../utils/json-serializer"
import {
  METADATA_CREATE,
  METADATA_READ,
  METADATA_UPDATE,
  METADATA_DELETE,
  METADATA_APPROVE,
  METADATA_REJECT,
  METADATA_PUBLISH,
  METADATA_UNPUBLISH,
  METADATA_SUBMIT_FOR_REVIEW,
  METADATA_VALIDATE
} from "../constants/permissions"

const metadata = new Hono<{
  Variables: {
    userId: string
    userEmail: string
    userRole: UserRole
    user: any
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
  coordinateUnit: z.enum(["DD", "DMS"]).default("DD"),
  minLatitude: z.number().default(0),
  minLongitude: z.number().default(0),
  maxLatitude: z.number().default(0),
  maxLongitude: z.number().default(0),
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
// Apply authentication middleware to all routes
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
metadata.post(
  "/", 
  requirePermission(METADATA_CREATE.action, METADATA_CREATE.subject),
  zValidator("json", metadataSchema), 
  async (c) => {
    const userId = c.get("userId")
    const data = await c.req.json()
    const result = await metadataService.createMetadata(data, userId)

    // Use SafeJSON to handle BigInt values
    return new Response(SafeJSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
)

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
metadata.get(
  "/:id", 
  requirePermission(METADATA_READ.action, METADATA_READ.subject),
  zValidator("param", MetadataIdParamSchema), 
  async (c) => {
    const { id } = c.req.valid("param")

    // Find the metadata by ID
    const metadata = await prisma.metadata.findUnique({
      where: { id },
    })

    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }

    // Use SafeJSON to handle BigInt values
    return new Response(
      SafeJSON.stringify({
        metadata,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
)

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
  requirePermission(METADATA_UPDATE.action, METADATA_UPDATE.subject),
  requireOwnership('metadata', async (c) => {
    const { id } = c.req.param()
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    return metadata?.userId || ''
  }),
  zValidator("param", MetadataIdParamSchema),
  zValidator("json", metadataSchema.partial()),
  async (c) => {
    const userId = c.get("userId")
    const { id } = c.req.valid("param")
    const data = await c.req.json()
    const result = await metadataService.updateMetadata(id, data, userId)

    // Use SafeJSON to handle BigInt values
    return new Response(SafeJSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    })
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
  requirePermission(METADATA_DELETE.action, METADATA_DELETE.subject),
  requireOwnership('metadata', async (c) => {
    const { id } = c.req.param()
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    return metadata?.userId || ''
  }),
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
metadata.get(
  "/search", 
  requirePermission(METADATA_READ.action, METADATA_READ.subject),
  async (c) => {
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

    // Use SafeJSON to handle BigInt values
    return new Response(
      SafeJSON.stringify({
        success: true,
        data: result,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
)

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
metadata.get(
  "/user", 
  requirePermission(METADATA_READ.action, METADATA_READ.subject),
  async (c) => {
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

    // Use SafeJSON to handle BigInt values
    return new Response(SafeJSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/submit-for-review:
 *   post:
 *     summary: Submit metadata for review
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
 *         description: Metadata submitted for review successfully
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
metadata.post(
  "/:id/submit-for-review",
  requirePermission(METADATA_SUBMIT_FOR_REVIEW.action, METADATA_SUBMIT_FOR_REVIEW.subject),
  requireOwnership('metadata', async (c) => {
    const { id } = c.req.param()
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    return metadata?.userId || ''
  }),
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Update metadata status to PENDING_REVIEW
    await prisma.metadata.update({
      where: { id },
      data: {
        validationStatus: "PENDING_REVIEW"
      }
    })
    
    return c.json({ 
      success: true,
      message: "Metadata submitted for review successfully" 
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/approve:
 *   post:
 *     summary: Approve metadata
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
 *         description: Metadata approved successfully
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
metadata.post(
  "/:id/approve",
  requirePermission(METADATA_APPROVE.action, METADATA_APPROVE.subject),
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Update metadata status to APPROVED
    await prisma.metadata.update({
      where: { id },
      data: {
        validationStatus: "APPROVED"
      }
    })
    
    return c.json({ 
      success: true,
      message: "Metadata approved successfully" 
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/reject:
 *   post:
 *     summary: Reject metadata
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
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for rejection
 *     responses:
 *       200:
 *         description: Metadata rejected successfully
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
metadata.post(
  "/:id/reject",
  requirePermission(METADATA_REJECT.action, METADATA_REJECT.subject),
  zValidator("param", MetadataIdParamSchema),
  zValidator("json", z.object({
    reason: z.string().min(1, "Rejection reason is required")
  })),
  async (c) => {
    const { id } = c.req.valid("param")
    const { reason } = await c.req.json()
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Update metadata status to REJECTED
    await prisma.metadata.update({
      where: { id },
      data: {
        validationStatus: "REJECTED",
        rejectionReason: reason
      }
    })
    
    return c.json({ 
      success: true,
      message: "Metadata rejected successfully" 
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/publish:
 *   post:
 *     summary: Publish metadata
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
 *         description: Metadata published successfully
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
metadata.post(
  "/:id/publish",
  requirePermission(METADATA_PUBLISH.action, METADATA_PUBLISH.subject),
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Check if metadata is approved
    if (metadata.validationStatus !== "APPROVED") {
      return c.json({ 
        error: "Metadata must be approved before publishing" 
      }, 400)
    }
    
    // Update metadata status to PUBLISHED
    await prisma.metadata.update({
      where: { id },
      data: {
        validationStatus: "PUBLISHED",
        publishedAt: new Date()
      }
    })
    
    return c.json({ 
      success: true,
      message: "Metadata published successfully" 
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/unpublish:
 *   post:
 *     summary: Unpublish metadata
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
 *         description: Metadata unpublished successfully
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
metadata.post(
  "/:id/unpublish",
  requirePermission(METADATA_UNPUBLISH.action, METADATA_UNPUBLISH.subject),
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Check if metadata is published
    if (metadata.validationStatus !== "PUBLISHED") {
      return c.json({ 
        error: "Metadata is not currently published" 
      }, 400)
    }
    
    // Update metadata status to APPROVED (unpublished but still approved)
    await prisma.metadata.update({
      where: { id },
      data: {
        validationStatus: "APPROVED",
        publishedAt: null
      }
    })
    
    return c.json({ 
      success: true,
      message: "Metadata unpublished successfully" 
    })
  }
)

/**
 * @openapi
 * /api/metadata/{id}/validate:
 *   post:
 *     summary: Validate metadata
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
 *         description: Metadata validation results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 validationResults:
 *                   type: object
 *                   properties:
 *                     isValid:
 *                       type: boolean
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                           message:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
metadata.post(
  "/:id/validate",
  requirePermission(METADATA_VALIDATE.action, METADATA_VALIDATE.subject),
  zValidator("param", MetadataIdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param")
    
    // Check if metadata exists
    const metadata = await prisma.metadata.findUnique({
      where: { id }
    })
    
    if (!metadata) {
      return c.json({ error: "Metadata not found" }, 404)
    }
    
    // Perform validation (this would be a more complex function in a real implementation)
    const validationResults = {
      isValid: true,
      errors: []
    }
    
    // Check required fields
    const requiredFields = [
      'title', 'author', 'organization', 'abstract', 'purpose',
      'coordinateSystem', 'projection', 'scale'
    ]
    
    for (const field of requiredFields) {
      if (!metadata[field]) {
        validationResults.isValid = false
        validationResults.errors.push({
          field,
          message: `${field} is required`
        })
      }
    }
    
    // Update metadata validation status based on results
    if (validationResults.isValid) {
      await prisma.metadata.update({
        where: { id },
        data: {
          validationStatus: "VALIDATED",
          lastValidatedAt: new Date()
        }
      })
    }
    
    return c.json({ 
      success: true,
      validationResults
    })
  }
)

// Export the router
export { metadata }
export default metadata
