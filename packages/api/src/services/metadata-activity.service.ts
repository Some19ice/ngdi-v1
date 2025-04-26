import { prisma } from "../lib/prisma"
import { logPermissionCheck } from "../utils/permissions"

/**
 * Service for tracking metadata workflow activities
 */
export const metadataActivityService = {
  /**
   * Log a metadata activity
   */
  async logActivity(
    userId: string,
    action: string,
    subject: string,
    metadataId: string,
    metadata: any = {},
    clientInfo: { ipAddress?: string; userAgent?: string } = {}
  ) {
    try {
      // Create activity log entry
      const activityLog = await prisma.activityLog.create({
        data: {
          userId,
          action,
          subject,
          subjectId: metadataId,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString()
          },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      })

      return activityLog
    } catch (error) {
      console.error("Error logging metadata activity:", error)
      throw error
    }
  },

  /**
   * Get recent activities for a metadata record
   */
  async getMetadataActivities(metadataId: string, limit: number = 10) {
    return prisma.activityLog.findMany({
      where: {
        subject: "metadata",
        subjectId: metadataId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
  },

  /**
   * Get recent activities by a user on metadata
   */
  async getUserMetadataActivities(userId: string, limit: number = 10) {
    return prisma.activityLog.findMany({
      where: {
        userId,
        subject: "metadata"
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit
    })
  },

  /**
   * Check if a user has performed a specific activity on a metadata record recently
   */
  async hasRecentActivity(
    userId: string,
    action: string,
    metadataId?: string,
    lookbackHours: number = 24
  ) {
    // Calculate the lookback time
    const lookbackTime = new Date()
    lookbackTime.setHours(lookbackTime.getHours() - lookbackHours)

    // Build the query
    const query: any = {
      userId,
      action,
      subject: "metadata",
      createdAt: {
        gte: lookbackTime
      }
    }

    // Add metadata ID if provided
    if (metadataId) {
      query.subjectId = metadataId
    }

    // Check for recent activity
    const recentActivity = await prisma.activityLog.findFirst({
      where: query
    })

    return !!recentActivity
  },

  /**
   * Get metadata workflow statistics
   */
  async getWorkflowStats(days: number = 30) {
    // Calculate the start date
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get counts by status
    const statusCounts = await prisma.$queryRaw`
      SELECT 
        "validationStatus" as status, 
        COUNT(*) as count 
      FROM "Metadata"
      GROUP BY "validationStatus"
    `

    // Get activity counts by action
    const activityCounts = await prisma.$queryRaw`
      SELECT 
        action, 
        COUNT(*) as count 
      FROM "ActivityLog"
      WHERE 
        subject = 'metadata' AND
        "createdAt" >= ${startDate}
      GROUP BY action
      ORDER BY count DESC
    `

    // Get daily activity counts
    const dailyActivity = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt") as date, 
        COUNT(*) as count 
      FROM "ActivityLog"
      WHERE 
        subject = 'metadata' AND
        "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date
    `

    // Get top contributors
    const topContributors = await prisma.$queryRaw`
      SELECT 
        "userId", 
        u.name as "userName", 
        u.email as "userEmail", 
        COUNT(*) as count 
      FROM "ActivityLog" a
      JOIN "User" u ON a."userId" = u.id
      WHERE 
        a.subject = 'metadata' AND
        a."createdAt" >= ${startDate}
      GROUP BY "userId", u.name, u.email
      ORDER BY count DESC
      LIMIT 10
    `

    return {
      statusCounts,
      activityCounts,
      dailyActivity,
      topContributors
    }
  }
}

export default metadataActivityService
