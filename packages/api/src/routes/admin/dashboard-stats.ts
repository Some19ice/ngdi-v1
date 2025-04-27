import { Hono } from "hono"
import { authMiddleware } from "../../middleware/auth.middleware"
import { prisma } from "../../lib/prisma"
import { UserRole } from "../../types/auth.types"

// Create admin dashboard stats router
const dashboardStatsRouter = new Hono()

// Apply auth middleware to all routes
dashboardStatsRouter.use("*", authMiddleware)

// Get dashboard stats
dashboardStatsRouter.get("/", async (c) => {
  try {
    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total metadata count
    const totalMetadata = await prisma.metadata.count()

    // Get user role distribution
    const userRoleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        id: true,
      },
    })

    // Get recent metadata count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentMetadataCount = await prisma.metadata.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Get top organizations count
    const topOrganizationsCount = await prisma.metadata.groupBy({
      by: ["organization"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    }).then(orgs => orgs.length)

    // Get metadata by framework count
    const metadataByFrameworkCount = await prisma.metadata.groupBy({
      by: ["frameworkType"],
      _count: {
        id: true,
      },
    }).then(frameworks => frameworks.length)

    // Calculate user growth (new users in last 30 days)
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Return stats
    return c.json({
      totalUsers,
      totalMetadata,
      userRoleDistribution,
      recentMetadataCount,
      userGrowthPoints: newUsers,
      metadataByFrameworkCount,
      topOrganizationsCount,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return c.json(
      {
        success: false,
        message: "Failed to fetch dashboard stats",
      },
      500
    )
  }
})

export default dashboardStatsRouter
