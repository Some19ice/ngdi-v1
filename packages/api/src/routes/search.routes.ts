import { Hono } from "hono"
import { authMiddleware } from "../middleware/auth.middleware"
import { metadataService } from "../services/metadata.service"

const search = new Hono()

// Apply auth middleware
search.use("*", authMiddleware)

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
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *         description: Start date filter
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *         description: End date filter
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
 *         description: Metadata search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetadataSearchResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
search.get("/metadata", async (c) => {
  try {
    const page = parseInt(c.req.query("page") || "1")
    const limit = parseInt(c.req.query("limit") || "10")
    const searchTerm = c.req.query("search") || ""
    const category = c.req.query("category") || ""
    const dateFrom = c.req.query("dateFrom") || ""
    const dateTo = c.req.query("dateTo") || ""
    const sortBy = c.req.query("sortBy") || "createdAt"
    const sortOrder = (c.req.query("sortOrder") || "desc") as "asc" | "desc"

    const result = await metadataService.searchMetadata({
      page,
      limit,
      search: searchTerm,
      category,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    })

    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error searching metadata:", error)
    return c.json(
      {
        success: false,
        error: "Failed to search metadata",
      },
      500
    )
  }
})

export default search
