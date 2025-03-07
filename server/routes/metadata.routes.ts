import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { MetadataService } from "../services/metadata.service"
import { authMiddleware } from "../middleware"
import type { Context } from "hono"
import type { Variables } from "hono/types"

interface CustomContext extends Context<{ Variables: Variables }> {
  get(key: "user"): { id: string; role: string }
}

const metadata = new Hono()

const metadataSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  organization: z.string().min(1),
  dateFrom: z.string(),
  dateTo: z.string(),
  abstract: z.string().min(1),
  purpose: z.string().min(1),
  thumbnailUrl: z.string().url(),
  imageName: z.string().min(1),
  frameworkType: z.string().min(1),
  categories: z.array(z.string()),
  coordinateSystem: z.string().min(1),
  projection: z.string().min(1),
  scale: z.number().int().positive(),
  resolution: z.string().optional(),
  accuracyLevel: z.string().min(1),
  completeness: z.number().int().min(0).max(100).optional(),
  consistencyCheck: z.boolean().optional(),
  validationStatus: z.string().optional(),
  fileFormat: z.string().min(1),
  fileSize: z.number().int().positive().optional(),
  numFeatures: z.number().int().positive().optional(),
  softwareReqs: z.string().optional(),
  updateCycle: z.string().optional(),
  lastUpdate: z.string().datetime().optional(),
  nextUpdate: z.string().datetime().optional(),
  distributionFormat: z.string().min(1),
  accessMethod: z.string().min(1),
  downloadUrl: z.string().url().optional(),
  apiEndpoint: z.string().url().optional(),
  licenseType: z.string().min(1),
  usageTerms: z.string().min(1),
  attributionRequirements: z.string().min(1),
  accessRestrictions: z.array(z.string()),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  department: z.string().optional(),
})

metadata.use("*", authMiddleware)

metadata.post(
  "/",
  zValidator("json", metadataSchema),
  async (c: CustomContext) => {
    const user = c.get("user")
    const data = await c.req.json()
    const result = await MetadataService.createMetadata(data, user.id)
    return c.json(result)
  }
)

metadata.get("/:id", async (c: CustomContext) => {
  const id = c.req.param("id")
  const result = await MetadataService.getMetadataById(id)
  if (!result) {
    return c.json({ error: "Metadata not found" }, 404)
  }
  return c.json(result)
})

metadata.put(
  "/:id",
  zValidator("json", metadataSchema.partial()),
  async (c: CustomContext) => {
    const id = c.req.param("id")
    const data = await c.req.json()
    const result = await MetadataService.updateMetadata(id, data)
    return c.json(result)
  }
)

metadata.delete("/:id", async (c: CustomContext) => {
  const id = c.req.param("id")
  await MetadataService.deleteMetadata(id)
  return c.json({ success: true })
})

metadata.get("/search", async (c: CustomContext) => {
  const { query = "", page = "1", limit = "10" } = c.req.query()
  const result = await MetadataService.searchMetadata(
    query,
    parseInt(page),
    parseInt(limit)
  )
  return c.json(result)
})

metadata.get("/user", async (c: CustomContext) => {
  const user = c.get("user")
  const { page = "1", limit = "10" } = c.req.query()
  const result = await MetadataService.getUserMetadata(
    user.id,
    parseInt(page),
    parseInt(limit)
  )
  return c.json(result)
})

export { metadata }
