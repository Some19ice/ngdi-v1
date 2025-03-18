import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { UserRole } from "@/lib/auth/constants"

export async function GET() {
  try {
    // Ensure user is authenticated and has admin privileges
    const user = await requireAuth()

    // Check if user has admin role
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required" },
        { status: 403 }
      )
    }

    // Fetch all the statistics in parallel for better performance
    const [userCount, orgCount, metadataCount, activeUserCount] =
      await Promise.all([
        // Total number of users
        prisma.user.count(),

        // Count of unique organizations
        prisma.user
          .groupBy({
            by: ["organization"],
            where: {
              organization: {
                not: null,
              },
            },
            _count: true,
          })
          .then((orgs) => orgs.length),

        // Total metadata entries (combining both types)
        prisma.$queryRaw`
        SELECT 
          (SELECT COUNT(*) FROM "Metadata") + 
          (SELECT COUNT(*) FROM "NGDIMetadata") AS total
      `.then((result: any) => Number(result[0].total)),

        // Active users (users with activity in the last 30 days)
        prisma.user.count({
          where: {
            OR: [
              {
                metadata: {
                  some: {
                    updatedAt: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
              {
                ngdiMetadata: {
                  some: {
                    updatedAt: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                  },
                },
              },
            ],
          },
        }),
      ])

    // Fetch pending approvals - using assessment field which is "Incomplete" for pending items
    const pendingApprovals = await prisma.nGDIMetadata.count({
      where: {
        assessment: "Incomplete",
      },
    })

    // Calculate system health (example calculation)
    // For a real implementation, you might want to check:
    // - Server uptime
    // - Database response time
    // - Error rates in logs
    // - Storage capacity
    // Here we're using a simple calculation based on metadata and user activity
    const metadataRatio =
      metadataCount > 0 ? Math.min(metadataCount / 1000, 1) : 0
    const userRatio = userCount > 0 ? Math.min(userCount / 200, 1) : 0
    const activeRatio = userCount > 0 ? activeUserCount / userCount : 0

    // Weight the factors (adjust as needed)
    const systemHealth = Math.round(
      (metadataRatio * 0.3 + userRatio * 0.3 + activeRatio * 0.4) * 100
    )

    return NextResponse.json({
      userCount,
      orgCount,
      metadataCount,
      activeUsers: activeUserCount,
      pendingApprovals,
      systemHealth,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    )
  }
}
