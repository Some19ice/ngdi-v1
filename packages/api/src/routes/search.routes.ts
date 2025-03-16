import { Hono } from "hono"
import { metadataService } from "../services/metadata.service"
import { authMiddleware } from "../middleware/auth.middleware"

const searchRouter = new Hono()

// Apply auth middleware to all routes
searchRouter.use("*", authMiddleware)

/**
 * @openapi
 * /api/search/metadata:
 *   get:
 *     summary: Search metadata
 *     tags: [Search]
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
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
searchRouter.get("/metadata", async (c) => {
  const {
    page = "1",
    limit = "10",
    search,
    category,
    dateFrom,
    dateTo,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = c.req.query()

  const result = await metadataService.searchMetadata({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    category,
    dateFrom,
    dateTo,
    sortBy: sortBy as "title" | "author" | "organization" | "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  })

  return c.json({
    success: true,
    data: result,
  })
})

export default searchRouter
