"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
const hono_1 = require("hono");
const metadata_service_1 = require("../services/metadata.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const zod_validator_1 = require("@hono/zod-validator");
const zod_1 = require("zod");
const metadata_types_1 = require("../types/metadata.types");
const prisma_1 = require("../lib/prisma");
const metadata = new hono_1.Hono();
exports.metadata = metadata;
const metadataSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    author: zod_1.z.string().min(1, "Author is required"),
    organization: zod_1.z.string().min(1, "Organization is required"),
    dateFrom: zod_1.z.string(),
    dateTo: zod_1.z.string(),
    abstract: zod_1.z.string().min(1, "Abstract is required"),
    purpose: zod_1.z.string().min(1, "Purpose is required"),
    thumbnailUrl: zod_1.z.string().url("Invalid thumbnail URL"),
    imageName: zod_1.z.string(),
    frameworkType: zod_1.z.string(),
    categories: zod_1.z.array(zod_1.z.string()),
    coordinateSystem: zod_1.z.string(),
    projection: zod_1.z.string(),
    scale: zod_1.z.number().positive("Scale must be positive"),
    resolution: zod_1.z.string().optional(),
    accuracyLevel: zod_1.z.string(),
    completeness: zod_1.z.number().min(0).max(100).optional(),
    consistencyCheck: zod_1.z.boolean().optional(),
    validationStatus: zod_1.z.string().optional(),
    fileFormat: zod_1.z.string(),
    fileSize: zod_1.z.number().positive("File size must be positive").optional(),
    numFeatures: zod_1.z
        .number()
        .positive("Number of features must be positive")
        .optional(),
    softwareReqs: zod_1.z.string().optional(),
    updateCycle: zod_1.z.string().optional(),
    lastUpdate: zod_1.z.string().datetime().optional(),
    nextUpdate: zod_1.z.string().datetime().optional(),
    distributionFormat: zod_1.z.string(),
    accessMethod: zod_1.z.string(),
    downloadUrl: zod_1.z.string().url("Invalid download URL").optional(),
    apiEndpoint: zod_1.z.string().url("Invalid API endpoint").optional(),
    licenseType: zod_1.z.string(),
    usageTerms: zod_1.z.string(),
    attributionRequirements: zod_1.z.string(),
    accessRestrictions: zod_1.z.array(zod_1.z.string()),
    contactPerson: zod_1.z.string(),
    email: zod_1.z.string().email("Invalid email format"),
    department: zod_1.z.string().optional(),
});
/**
 * Metadata routes
 */
metadata.use("*", auth_middleware_1.authMiddleware);
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
metadata.post("/", (0, zod_validator_1.zValidator)("json", metadataSchema), async (c) => {
    const userId = c.get("userId");
    const data = await c.req.json();
    const result = await metadata_service_1.metadataService.createMetadata(data, userId);
    return c.json(result);
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
metadata.get("/:id", (0, zod_validator_1.zValidator)("param", metadata_types_1.MetadataIdParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    // Find the metadata by ID
    const metadata = await prisma_1.prisma.metadata.findUnique({
        where: { id },
    });
    if (!metadata) {
        return c.json({ error: "Metadata not found" }, 404);
    }
    return c.json({
        metadata,
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
metadata.put("/:id", (0, zod_validator_1.zValidator)("param", metadata_types_1.MetadataIdParamSchema), (0, zod_validator_1.zValidator)("json", metadataSchema.partial()), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    const data = await c.req.json();
    const result = await metadata_service_1.metadataService.updateMetadata(id, data, userId);
    return c.json(result);
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
metadata.delete("/:id", (0, zod_validator_1.zValidator)("param", metadata_types_1.MetadataIdParamSchema), async (c) => {
    const userId = c.get("userId");
    const { id } = c.req.valid("param");
    await metadata_service_1.metadataService.deleteMetadata(id, userId);
    return c.json({ message: "Metadata deleted successfully" });
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
    const { page = "1", limit = "10", search, category, frameworkType, dateFrom, dateTo, } = c.req.query();
    const result = await metadata_service_1.metadataService.searchMetadata({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        category,
        frameworkType,
        dateFrom,
        dateTo,
        sortBy: "createdAt",
        sortOrder: "desc",
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
metadata.get("/user", async (c) => {
    const userId = c.get("userId");
    const { page = "1", limit = "10", search, category } = c.req.query();
    const result = await metadata_service_1.metadataService.getUserMetadata(userId, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        category,
        sortBy: "createdAt",
        sortOrder: "desc",
    });
    return c.json(result);
});
exports.default = metadata;
