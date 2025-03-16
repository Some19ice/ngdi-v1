import { Hono } from "hono"
import { metadataService } from "../services/metadata.service"
import { authMiddleware } from "../middleware/auth.middleware"

const searchRouter = new Hono()

// Create a public search endpoint that doesn't require authentication
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

  try {
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
  } catch (error) {
    console.error("Public search error:", error)
    return c.json(
      {
        success: false,
        error: "Failed to search metadata",
      },
      500
    )
  }
})

export default searchRouter
