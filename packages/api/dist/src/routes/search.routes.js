"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const metadata_service_1 = require("../services/metadata.service");
const searchRouter = new hono_1.Hono();
// Create a public search endpoint that doesn't require authentication
searchRouter.get("/metadata", async (c) => {
    const { page = "1", limit = "10", search, category, dateFrom, dateTo, sortBy = "createdAt", sortOrder = "desc", } = c.req.query();
    try {
        const result = await metadata_service_1.metadataService.searchMetadata({
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search,
            category,
            dateFrom,
            dateTo,
            sortBy: sortBy,
            sortOrder: sortOrder === "asc" ? "asc" : "desc",
        });
        return c.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error("Public search error:", error);
        return c.json({
            success: false,
            error: "Failed to search metadata",
        }, 500);
    }
});
exports.default = searchRouter;
