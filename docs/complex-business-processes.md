# Implementation Plan for Complex Business Processes

This document outlines the detailed implementation plan for two complex business processes that leverage our granular permissions system:

1. Metadata Publication Workflow with Editorial Review
2. Organization Hierarchy with Delegated Administration

## 1. Metadata Publication Workflow with Editorial Review

### 1.1 Process Overview

The Metadata Publication Workflow is a multi-stage process that ensures high-quality metadata through a series of reviews and approvals before publication. This workflow involves multiple stakeholders with different responsibilities and permissions.

### 1.2 Workflow Stages

1. **Draft Creation**: Authors create and edit initial metadata records
2. **Technical Validation**: Validators check technical correctness and completeness
3. **Editorial Review**: Reviewers assess content quality and standards compliance
4. **Subject Matter Review**: Domain experts verify domain-specific accuracy
5. **Approval**: Senior editors provide final approval or rejection
6. **Publication**: Publishers make approved metadata publicly available
7. **Monitoring**: Compliance officers audit the process for quality assurance

### 1.3 Role and Permission Matrix

| Role                   | Permissions                                                                         | Description                      |
| ---------------------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| **Author**             | `metadata:create`, `metadata:update`, `metadata:read`, `metadata:submit-for-review` | Create and edit metadata records |
| **Validator**          | `metadata:validate`, `metadata:read`, `metadata:comment`                            | Verify technical correctness     |
| **Reviewer**           | `metadata:review`, `metadata:read`, `metadata:comment`                              | Review content quality           |
| **Domain Expert**      | `metadata:domain-review`, `metadata:read`, `metadata:comment`                       | Verify domain-specific accuracy  |
| **Senior Editor**      | `metadata:approve`, `metadata:reject`, `metadata:read`, `metadata:comment`          | Final approval or rejection      |
| **Publisher**          | `metadata:publish`, `metadata:unpublish`, `metadata:read`                           | Make metadata publicly available |
| **Compliance Officer** | `metadata:audit`, `metadata:read`, `activity:view`                                  | Review process compliance        |

### 1.4 Database Schema Extensions

```prisma
// Add to Prisma schema
enum MetadataStatus {
  DRAFT
  SUBMITTED
  TECHNICAL_VALIDATION
  EDITORIAL_REVIEW
  DOMAIN_REVIEW
  APPROVED
  REJECTED
  PUBLISHED
  UNPUBLISHED
  ARCHIVED
}

model Metadata {
  // Existing fields...

  // Workflow fields
  status              MetadataStatus     @default(DRAFT)
  currentStage        String?
  submittedAt         DateTime?
  validatedAt         DateTime?
  reviewedAt          DateTime?
  domainReviewedAt    DateTime?
  approvedAt          DateTime?
  rejectedAt          DateTime?
  publishedAt         DateTime?
  unpublishedAt       DateTime?
  archivedAt          DateTime?

  // Assignees
  validatorId         String?
  reviewerId          String?
  domainExpertId      String?
  seniorEditorId      String?
  publisherId         String?

  // Relations
  validator           User?              @relation("ValidatorMetadata", fields: [validatorId], references: [id])
  reviewer            User?              @relation("ReviewerMetadata", fields: [reviewerId], references: [id])
  domainExpert        User?              @relation("DomainExpertMetadata", fields: [domainExpertId], references: [id])
  seniorEditor        User?              @relation("SeniorEditorMetadata", fields: [seniorEditorId], references: [id])
  publisher           User?              @relation("PublisherMetadata", fields: [publisherId], references: [id])

  // Comments and activity
  comments            MetadataComment[]
  activities          MetadataActivity[]
  versions            MetadataVersion[]
}

model MetadataComment {
  id                  String             @id @default(cuid())
  metadataId          String
  userId              String
  content             String
  stage               String
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  metadata            Metadata           @relation(fields: [metadataId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model MetadataActivity {
  id                  String             @id @default(cuid())
  metadataId          String
  userId              String
  action              String
  fromStatus          String?
  toStatus            String?
  comment             String?
  createdAt           DateTime           @default(now())

  metadata            Metadata           @relation(fields: [metadataId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model MetadataVersion {
  id                  String             @id @default(cuid())
  metadataId          String
  userId              String
  version             Int
  data                Json
  createdAt           DateTime           @default(now())

  metadata            Metadata           @relation(fields: [metadataId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 1.5 API Endpoints

#### Metadata Workflow Endpoints

```typescript
// Workflow transition endpoints
metadataRouter.post(
  "/:id/submit",
  requirePermission("submit-for-review", "metadata"),
  handleSubmit
)
metadataRouter.post(
  "/:id/validate",
  requirePermission("validate", "metadata"),
  handleValidate
)
metadataRouter.post(
  "/:id/review",
  requirePermission("review", "metadata"),
  handleReview
)
metadataRouter.post(
  "/:id/domain-review",
  requirePermission("domain-review", "metadata"),
  handleDomainReview
)
metadataRouter.post(
  "/:id/approve",
  requirePermission("approve", "metadata"),
  handleApprove
)
metadataRouter.post(
  "/:id/reject",
  requirePermission("reject", "metadata"),
  handleReject
)
metadataRouter.post(
  "/:id/publish",
  requirePermission("publish", "metadata"),
  handlePublish
)
metadataRouter.post(
  "/:id/unpublish",
  requirePermission("unpublish", "metadata"),
  handleUnpublish
)

// Comment endpoints
metadataRouter.post(
  "/:id/comments",
  requirePermission("comment", "metadata"),
  handleAddComment
)
metadataRouter.get(
  "/:id/comments",
  requirePermission("read", "metadata"),
  handleGetComments
)

// Version endpoints
metadataRouter.get(
  "/:id/versions",
  requirePermission("read", "metadata"),
  handleGetVersions
)
metadataRouter.get(
  "/:id/versions/:versionId",
  requirePermission("read", "metadata"),
  handleGetVersion
)

// Assignment endpoints
metadataRouter.post(
  "/:id/assign",
  requirePermission("assign", "metadata"),
  handleAssign
)
```

### 1.6 State Machine Implementation

The workflow transitions follow a state machine pattern to ensure proper progression through stages:

```typescript
// metadata-workflow.service.ts
export const metadataWorkflowService = {
  async submitForReview(metadataId: string, userId: string): Promise<Metadata> {
    const metadata = await prisma.metadata.findUnique({
      where: { id: metadataId },
    })

    // Validate current state
    if (metadata.status !== MetadataStatus.DRAFT) {
      throw new Error("Metadata must be in DRAFT status to submit for review")
    }

    // Check ownership or permission
    if (metadata.userId !== userId) {
      const hasPermission = await permissionService.hasPermission(
        userId,
        "submit-for-review",
        "metadata",
        { id: metadataId }
      )
      if (!hasPermission) {
        throw new Error("Not authorized to submit this metadata for review")
      }
    }

    // Create a version snapshot
    await prisma.metadataVersion.create({
      data: {
        metadataId,
        userId,
        version: await getNextVersionNumber(metadataId),
        data: metadata,
      },
    })

    // Update status and log activity
    const updated = await prisma.metadata.update({
      where: { id: metadataId },
      data: {
        status: MetadataStatus.SUBMITTED,
        submittedAt: new Date(),
        activities: {
          create: {
            userId,
            action: "SUBMIT_FOR_REVIEW",
            fromStatus: MetadataStatus.DRAFT,
            toStatus: MetadataStatus.SUBMITTED,
          },
        },
      },
    })

    // Notify relevant stakeholders
    await notificationService.notifyStakeholders(
      metadataId,
      "Metadata submitted for review",
      "validate"
    )

    return updated
  },

  // Similar implementations for other transitions:
  // - validateMetadata
  // - reviewMetadata
  // - domainReviewMetadata
  // - approveMetadata
  // - rejectMetadata
  // - publishMetadata
  // - unpublishMetadata
}
```

### 1.7 Notification System

```typescript
// notification.service.ts
export const notificationService = {
  async notifyStakeholders(
    metadataId: string,
    message: string,
    requiredPermission: string
  ): Promise<void> {
    // Find users with the required permission
    const users = await prisma.user.findMany({
      where: {
        OR: [
          // Users with direct permission
          {
            userPermissions: {
              some: {
                permission: {
                  action: requiredPermission,
                  subject: "metadata",
                },
                granted: true,
              },
            },
          },
          // Users with role-based permission
          {
            customRole: {
              rolePermissions: {
                some: {
                  permission: {
                    action: requiredPermission,
                    subject: "metadata",
                  },
                },
              },
            },
          },
        ],
      },
    })

    // Create notifications for each user
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: "METADATA_WORKFLOW",
          message,
          relatedId: metadataId,
          read: false,
        },
      })

      // Send email notification
      await emailService.sendEmail({
        to: user.email,
        subject: `Metadata Workflow: ${message}`,
        body: `A metadata record requires your attention. [View Metadata](${process.env.APP_URL}/metadata/${metadataId})`,
      })
    }
  },
}
```

### 1.8 Dashboard Implementation

```typescript
// metadata-dashboard.service.ts
export const metadataDashboardService = {
  async getUserTasks(userId: string): Promise<any[]> {
    // Get user permissions
    const userPermissions = await permissionService.getUserPermissions(userId)

    // Build query based on permissions and roles
    const tasks = []

    // Tasks for validators
    if (
      userPermissions.some(
        (p) => p.action === "validate" && p.subject === "metadata"
      )
    ) {
      const validationTasks = await prisma.metadata.findMany({
        where: {
          status: MetadataStatus.SUBMITTED,
          validatorId: null, // Unassigned
        },
        orderBy: { submittedAt: "desc" },
      })
      tasks.push(
        ...validationTasks.map((t) => ({ ...t, taskType: "VALIDATION" }))
      )
    }

    // Tasks for reviewers
    if (
      userPermissions.some(
        (p) => p.action === "review" && p.subject === "metadata"
      )
    ) {
      const reviewTasks = await prisma.metadata.findMany({
        where: {
          status: MetadataStatus.TECHNICAL_VALIDATION,
          reviewerId: null, // Unassigned
        },
        orderBy: { validatedAt: "desc" },
      })
      tasks.push(...reviewTasks.map((t) => ({ ...t, taskType: "REVIEW" })))
    }

    // Similar queries for other roles...

    // Also include tasks specifically assigned to the user
    const assignedTasks = await prisma.metadata.findMany({
      where: {
        OR: [
          { validatorId: userId },
          { reviewerId: userId },
          { domainExpertId: userId },
          { seniorEditorId: userId },
          { publisherId: userId },
        ],
      },
    })

    tasks.push(
      ...assignedTasks.map((t) => {
        let taskType = "UNKNOWN"
        if (t.validatorId === userId && t.status === MetadataStatus.SUBMITTED)
          taskType = "VALIDATION"
        if (
          t.reviewerId === userId &&
          t.status === MetadataStatus.TECHNICAL_VALIDATION
        )
          taskType = "REVIEW"
        // Similar logic for other roles...
        return { ...t, taskType }
      })
    )

    return tasks
  },

  async getWorkflowStats(): Promise<any> {
    // Get counts by status
    const statusCounts = await prisma.metadata.groupBy({
      by: ["status"],
      _count: true,
    })

    // Get average time in each stage
    const avgTimeInStages = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(EPOCH FROM ("validatedAt" - "submittedAt"))) as avg_validation_time,
        AVG(EXTRACT(EPOCH FROM ("reviewedAt" - "validatedAt"))) as avg_review_time,
        AVG(EXTRACT(EPOCH FROM ("domainReviewedAt" - "reviewedAt"))) as avg_domain_review_time,
        AVG(EXTRACT(EPOCH FROM ("approvedAt" - "domainReviewedAt"))) as avg_approval_time,
        AVG(EXTRACT(EPOCH FROM ("publishedAt" - "approvedAt"))) as avg_publication_time
      FROM "Metadata"
      WHERE "publishedAt" IS NOT NULL
    `

    // Get recent activities
    const recentActivities = await prisma.metadataActivity.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        metadata: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return {
      statusCounts,
      avgTimeInStages,
      recentActivities,
    }
  },
}
```

## 2. Organization Hierarchy with Delegated Administration

### 2.1 Process Overview

The Organization Hierarchy with Delegated Administration implements a multi-level organizational structure where administration rights can be delegated down the hierarchy with appropriate restrictions. This enables large organizations to manage permissions efficiently while maintaining proper access controls.

### 2.2 Hierarchy Levels

1. **Global**: System-wide administration
2. **Organization**: Top-level organizational unit
3. **Department**: Division within an organization
4. **Team**: Group within a department
5. **Project**: Specific initiative within a team

### 2.3 Role and Permission Matrix

| Level            | Role                 | Permissions                                    | Scope                   |
| ---------------- | -------------------- | ---------------------------------------------- | ----------------------- |
| **Global**       | System Administrator | All permissions                                | Entire system           |
| **Organization** | Org Admin            | `org:manage`, `user:manage`, `role:assign`     | Limited to organization |
| **Department**   | Dept Admin           | `dept:manage`, `user:view`, `metadata:approve` | Limited to department   |
| **Team**         | Team Lead            | `team:manage`, `metadata:review`               | Limited to team         |
| **Project**      | Project Manager      | `project:manage`, `metadata:create`            | Limited to project      |

### 2.4 Database Schema Extensions

```prisma
// Add to Prisma schema
model Organization {
  id                  String             @id @default(cuid())
  name                String
  description         String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  departments         Department[]
  users               User[]
  organizationAdmins  OrganizationAdmin[]
}

model Department {
  id                  String             @id @default(cuid())
  name                String
  description         String?
  organizationId      String
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  organization        Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  teams               Team[]
  users               User[]
  departmentAdmins    DepartmentAdmin[]
}

model Team {
  id                  String             @id @default(cuid())
  name                String
  description         String?
  departmentId        String
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  department          Department         @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  projects            Project[]
  users               User[]
  teamLeads           TeamLead[]
}

model Project {
  id                  String             @id @default(cuid())
  name                String
  description         String?
  teamId              String
  startDate           DateTime?
  endDate             DateTime?
  status              String             @default("ACTIVE")
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  team                Team               @relation(fields: [teamId], references: [id], onDelete: Cascade)
  metadata            Metadata[]
  users               User[]
  projectManagers     ProjectManager[]
}

// Junction tables for admin roles
model OrganizationAdmin {
  id                  String             @id @default(cuid())
  organizationId      String
  userId              String
  createdAt           DateTime           @default(now())
  createdById         String?

  // Relations
  organization        Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdBy           User?              @relation("OrgAdminCreator", fields: [createdById], references: [id])

  @@unique([organizationId, userId])
}

model DepartmentAdmin {
  id                  String             @id @default(cuid())
  departmentId        String
  userId              String
  createdAt           DateTime           @default(now())
  createdById         String?

  // Relations
  department          Department         @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdBy           User?              @relation("DeptAdminCreator", fields: [createdById], references: [id])

  @@unique([departmentId, userId])
}

model TeamLead {
  id                  String             @id @default(cuid())
  teamId              String
  userId              String
  createdAt           DateTime           @default(now())
  createdById         String?

  // Relations
  team                Team               @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdBy           User?              @relation("TeamLeadCreator", fields: [createdById], references: [id])

  @@unique([teamId, userId])
}

model ProjectManager {
  id                  String             @id @default(cuid())
  projectId           String
  userId              String
  createdAt           DateTime           @default(now())
  createdById         String?

  // Relations
  project             Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdBy           User?              @relation("ProjectManagerCreator", fields: [createdById], references: [id])

  @@unique([projectId, userId])
}

// Update User model
model User {
  // Existing fields...

  // Organizational hierarchy
  organizationId      String?
  departmentId        String?
  teamId              String?

  // Relations
  organization        Organization?      @relation(fields: [organizationId], references: [id])
  department          Department?        @relation(fields: [departmentId], references: [id])
  team                Team?              @relation(fields: [teamId], references: [id])
  projects            Project[]

  // Admin roles
  orgAdminFor         OrganizationAdmin[]
  deptAdminFor        DepartmentAdmin[]
  teamLeadFor         TeamLead[]
  projectManagerFor   ProjectManager[]

  // Created by relations
  createdOrgAdmins    OrganizationAdmin[] @relation("OrgAdminCreator")
  createdDeptAdmins   DepartmentAdmin[]  @relation("DeptAdminCreator")
  createdTeamLeads    TeamLead[]         @relation("TeamLeadCreator")
  createdProjManagers ProjectManager[]   @relation("ProjectManagerCreator")
}

// Update Metadata model
model Metadata {
  // Existing fields...

  // Organizational hierarchy
  organizationId      String?
  departmentId        String?
  teamId              String?
  projectId           String?

  // Relations
  organization        Organization?      @relation(fields: [organizationId], references: [id])
  department          Department?        @relation(fields: [departmentId], references: [id])
  team                Team?              @relation(fields: [teamId], references: [id])
  project             Project?           @relation(fields: [projectId], references: [id])
}
```

### 2.5 Permission Scope Implementation

The key to implementing hierarchical permissions is to add scope checks to the permission system:

```typescript
// permission-scope.service.ts
export const permissionScopeService = {
  /**
   * Check if a user has permission within the specified scope
   */
  async hasPermissionInScope(
    userId: string,
    action: string,
    subject: string,
    scopeType: "organization" | "department" | "team" | "project",
    scopeId: string
  ): Promise<boolean> {
    // First, check if the user has the permission at all
    const hasPermission = await permissionService.hasPermission(
      userId,
      action,
      subject
    )

    if (!hasPermission) {
      return false
    }

    // Then check if the user is within the scope
    switch (scopeType) {
      case "organization":
        return this.isUserInOrganization(userId, scopeId)
      case "department":
        return this.isUserInDepartment(userId, scopeId)
      case "team":
        return this.isUserInTeam(userId, scopeId)
      case "project":
        return this.isUserInProject(userId, scopeId)
      default:
        return false
    }
  },

  /**
   * Check if a user is in an organization
   */
  async isUserInOrganization(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    return user?.organizationId === organizationId
  },

  /**
   * Check if a user is in a department
   */
  async isUserInDepartment(
    userId: string,
    departmentId: string
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true },
    })

    return user?.departmentId === departmentId
  },

  /**
   * Check if a user is in a team
   */
  async isUserInTeam(userId: string, teamId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    })

    return user?.teamId === teamId
  },

  /**
   * Check if a user is in a project
   */
  async isUserInProject(userId: string, projectId: string): Promise<boolean> {
    const count = await prisma.project.count({
      where: {
        id: projectId,
        users: {
          some: {
            id: userId,
          },
        },
      },
    })

    return count > 0
  },

  /**
   * Check if a user is an admin at any level that includes the specified scope
   */
  async isAdminForScope(
    userId: string,
    scopeType: "organization" | "department" | "team" | "project",
    scopeId: string
  ): Promise<boolean> {
    // Check if user is a system admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (user?.role === "ADMIN") {
      return true
    }

    // Check specific admin roles
    switch (scopeType) {
      case "organization":
        return this.isOrganizationAdmin(userId, scopeId)
      case "department":
        // Department admins or admins of the parent organization
        return (
          (await this.isDepartmentAdmin(userId, scopeId)) ||
          (await this.isAdminOfParentOrganization(
            userId,
            "department",
            scopeId
          ))
        )
      case "team":
        // Team leads or admins of the parent department or organization
        return (
          (await this.isTeamLead(userId, scopeId)) ||
          (await this.isAdminOfParentDepartment(userId, scopeId)) ||
          (await this.isAdminOfParentOrganization(userId, "team", scopeId))
        )
      case "project":
        // Project managers or admins of the parent team, department, or organization
        return (
          (await this.isProjectManager(userId, scopeId)) ||
          (await this.isAdminOfParentTeam(userId, scopeId)) ||
          (await this.isAdminOfParentDepartment(userId, "project", scopeId)) ||
          (await this.isAdminOfParentOrganization(userId, "project", scopeId))
        )
      default:
        return false
    }
  },

  // Helper methods for checking admin roles
  async isOrganizationAdmin(
    userId: string,
    organizationId: string
  ): Promise<boolean> {
    const count = await prisma.organizationAdmin.count({
      where: {
        userId,
        organizationId,
      },
    })

    return count > 0
  },

  async isDepartmentAdmin(
    userId: string,
    departmentId: string
  ): Promise<boolean> {
    const count = await prisma.departmentAdmin.count({
      where: {
        userId,
        departmentId,
      },
    })

    return count > 0
  },

  async isTeamLead(userId: string, teamId: string): Promise<boolean> {
    const count = await prisma.teamLead.count({
      where: {
        userId,
        teamId,
      },
    })

    return count > 0
  },

  async isProjectManager(userId: string, projectId: string): Promise<boolean> {
    const count = await prisma.projectManager.count({
      where: {
        userId,
        projectId,
      },
    })

    return count > 0
  },

  // Helper methods for checking parent-level admin roles
  async isAdminOfParentOrganization(
    userId: string,
    childType: "department" | "team" | "project",
    childId: string
  ): Promise<boolean> {
    let organizationId: string | null = null

    // Get the organization ID based on the child type
    if (childType === "department") {
      const department = await prisma.department.findUnique({
        where: { id: childId },
        select: { organizationId: true },
      })
      organizationId = department?.organizationId || null
    } else if (childType === "team") {
      const team = await prisma.team.findUnique({
        where: { id: childId },
        include: { department: true },
      })
      organizationId = team?.department?.organizationId || null
    } else if (childType === "project") {
      const project = await prisma.project.findUnique({
        where: { id: childId },
        include: { team: { include: { department: true } } },
      })
      organizationId = project?.team?.department?.organizationId || null
    }

    if (!organizationId) {
      return false
    }

    return this.isOrganizationAdmin(userId, organizationId)
  },

  async isAdminOfParentDepartment(
    userId: string,
    childType: "team" | "project",
    childId: string
  ): Promise<boolean> {
    let departmentId: string | null = null

    // Get the department ID based on the child type
    if (childType === "team") {
      const team = await prisma.team.findUnique({
        where: { id: childId },
        select: { departmentId: true },
      })
      departmentId = team?.departmentId || null
    } else if (childType === "project") {
      const project = await prisma.project.findUnique({
        where: { id: childId },
        include: { team: true },
      })
      departmentId = project?.team?.departmentId || null
    }

    if (!departmentId) {
      return false
    }

    return this.isDepartmentAdmin(userId, departmentId)
  },

  async isAdminOfParentTeam(
    userId: string,
    projectId: string
  ): Promise<boolean> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { teamId: true },
    })

    if (!project?.teamId) {
      return false
    }

    return this.isTeamLead(userId, project.teamId)
  },
}
```

### 2.6 Delegation Service

```typescript
// delegation.service.ts
export const delegationService = {
  /**
   * Delegate organization admin role to a user
   */
  async delegateOrganizationAdmin(
    organizationId: string,
    userId: string,
    delegatedBy: string
  ): Promise<OrganizationAdmin> {
    // Check if the delegator has permission to delegate
    const canDelegate = await permissionScopeService.isAdminForScope(
      delegatedBy,
      "organization",
      organizationId
    )

    if (!canDelegate) {
      throw new Error("Not authorized to delegate organization admin role")
    }

    // Check if the user is in the organization
    const isInOrg = await permissionScopeService.isUserInOrganization(
      userId,
      organizationId
    )

    if (!isInOrg) {
      throw new Error("User must be a member of the organization")
    }

    // Create the delegation
    return prisma.organizationAdmin.create({
      data: {
        organizationId,
        userId,
        createdById: delegatedBy,
      },
    })
  },

  /**
   * Delegate department admin role to a user
   */
  async delegateDepartmentAdmin(
    departmentId: string,
    userId: string,
    delegatedBy: string
  ): Promise<DepartmentAdmin> {
    // Check if the delegator has permission to delegate
    const canDelegate = await permissionScopeService.isAdminForScope(
      delegatedBy,
      "department",
      departmentId
    )

    if (!canDelegate) {
      throw new Error("Not authorized to delegate department admin role")
    }

    // Check if the user is in the department
    const isInDept = await permissionScopeService.isUserInDepartment(
      userId,
      departmentId
    )

    if (!isInDept) {
      throw new Error("User must be a member of the department")
    }

    // Create the delegation
    return prisma.departmentAdmin.create({
      data: {
        departmentId,
        userId,
        createdById: delegatedBy,
      },
    })
  },

  /**
   * Delegate team lead role to a user
   */
  async delegateTeamLead(
    teamId: string,
    userId: string,
    delegatedBy: string
  ): Promise<TeamLead> {
    // Check if the delegator has permission to delegate
    const canDelegate = await permissionScopeService.isAdminForScope(
      delegatedBy,
      "team",
      teamId
    )

    if (!canDelegate) {
      throw new Error("Not authorized to delegate team lead role")
    }

    // Check if the user is in the team
    const isInTeam = await permissionScopeService.isUserInTeam(userId, teamId)

    if (!isInTeam) {
      throw new Error("User must be a member of the team")
    }

    // Create the delegation
    return prisma.teamLead.create({
      data: {
        teamId,
        userId,
        createdById: delegatedBy,
      },
    })
  },

  /**
   * Delegate project manager role to a user
   */
  async delegateProjectManager(
    projectId: string,
    userId: string,
    delegatedBy: string
  ): Promise<ProjectManager> {
    // Check if the delegator has permission to delegate
    const canDelegate = await permissionScopeService.isAdminForScope(
      delegatedBy,
      "project",
      projectId
    )

    if (!canDelegate) {
      throw new Error("Not authorized to delegate project manager role")
    }

    // Check if the user is in the project
    const isInProject = await permissionScopeService.isUserInProject(
      userId,
      projectId
    )

    if (!isInProject) {
      throw new Error("User must be a member of the project")
    }

    // Create the delegation
    return prisma.projectManager.create({
      data: {
        projectId,
        userId,
        createdById: delegatedBy,
      },
    })
  },

  /**
   * Revoke an admin role
   */
  async revokeAdminRole(
    roleType: "organization" | "department" | "team" | "project",
    roleId: string,
    userId: string,
    revokedBy: string
  ): Promise<void> {
    // Check if the revoker has permission to revoke
    let canRevoke = false
    let scopeId = ""

    switch (roleType) {
      case "organization":
        const orgAdmin = await prisma.organizationAdmin.findUnique({
          where: { id: roleId },
          select: { organizationId: true },
        })
        scopeId = orgAdmin?.organizationId || ""
        canRevoke = await permissionScopeService.isAdminForScope(
          revokedBy,
          "organization",
          scopeId
        )
        break
      case "department":
        const deptAdmin = await prisma.departmentAdmin.findUnique({
          where: { id: roleId },
          select: { departmentId: true },
        })
        scopeId = deptAdmin?.departmentId || ""
        canRevoke = await permissionScopeService.isAdminForScope(
          revokedBy,
          "department",
          scopeId
        )
        break
      case "team":
        const teamLead = await prisma.teamLead.findUnique({
          where: { id: roleId },
          select: { teamId: true },
        })
        scopeId = teamLead?.teamId || ""
        canRevoke = await permissionScopeService.isAdminForScope(
          revokedBy,
          "team",
          scopeId
        )
        break
      case "project":
        const projectManager = await prisma.projectManager.findUnique({
          where: { id: roleId },
          select: { projectId: true },
        })
        scopeId = projectManager?.projectId || ""
        canRevoke = await permissionScopeService.isAdminForScope(
          revokedBy,
          "project",
          scopeId
        )
        break
    }

    if (!canRevoke) {
      throw new Error(`Not authorized to revoke ${roleType} admin role`)
    }

    // Revoke the role
    switch (roleType) {
      case "organization":
        await prisma.organizationAdmin.delete({
          where: { id: roleId },
        })
        break
      case "department":
        await prisma.departmentAdmin.delete({
          where: { id: roleId },
        })
        break
      case "team":
        await prisma.teamLead.delete({
          where: { id: roleId },
        })
        break
      case "project":
        await prisma.projectManager.delete({
          where: { id: roleId },
        })
        break
    }

    // Log the revocation
    await prisma.activityLog.create({
      data: {
        userId: revokedBy,
        action: "REVOKE_ADMIN_ROLE",
        subject: roleType,
        subjectId: scopeId,
        metadata: {
          roleId,
          revokedUserId: userId,
          roleType,
        },
      },
    })
  },
}
```

### 2.7 API Endpoints

```typescript
// organization-hierarchy.routes.ts
import { Router } from "express"
import {
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
} from "../middleware/permission.middleware"

const router = Router()

// Organization endpoints
router.get(
  "/organizations",
  requirePermission("read", "organization"),
  handleGetOrganizations
)

router.post(
  "/organizations",
  requirePermission("create", "organization"),
  handleCreateOrganization
)

router.get(
  "/organizations/:id",
  requirePermission("read", "organization"),
  handleGetOrganization
)

router.put(
  "/organizations/:id",
  requirePermission("update", "organization"),
  handleUpdateOrganization
)

router.delete(
  "/organizations/:id",
  requirePermission("delete", "organization"),
  handleDeleteOrganization
)

// Department endpoints
router.get(
  "/organizations/:orgId/departments",
  requirePermission("read", "department"),
  handleGetDepartments
)

router.post(
  "/organizations/:orgId/departments",
  requirePermission("create", "department"),
  handleCreateDepartment
)

// Similar endpoints for teams and projects...

// Admin delegation endpoints
router.post(
  "/organizations/:id/admins",
  requirePermission("assign", "role"),
  handleDelegateOrgAdmin
)

router.post(
  "/departments/:id/admins",
  requirePermission("assign", "role"),
  handleDelegateDeptAdmin
)

router.post(
  "/teams/:id/leads",
  requirePermission("assign", "role"),
  handleDelegateTeamLead
)

router.post(
  "/projects/:id/managers",
  requirePermission("assign", "role"),
  handleDelegateProjectManager
)

// Admin revocation endpoints
router.delete(
  "/organization-admins/:id",
  requirePermission("assign", "role"),
  handleRevokeOrgAdmin
)

router.delete(
  "/department-admins/:id",
  requirePermission("assign", "role"),
  handleRevokeDeptAdmin
)

router.delete(
  "/team-leads/:id",
  requirePermission("assign", "role"),
  handleRevokeTeamLead
)

router.delete(
  "/project-managers/:id",
  requirePermission("assign", "role"),
  handleRevokeProjectManager
)

export default router
```

### 2.8 UI Components for Organization Hierarchy

```tsx
// OrganizationHierarchyView.tsx
import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tree, TreeNode } from "../components/ui/tree"
import { Button } from "../components/ui/button"
import { Dialog } from "../components/ui/dialog"
import { PermissionGate } from "../components/ui/permission-gate"
import { api } from "../lib/api"

export function OrganizationHierarchyView() {
  const { data: session } = useSession()
  const [organizations, setOrganizations] = useState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState("")

  useEffect(() => {
    // Fetch organizations
    const fetchOrganizations = async () => {
      const response = await api.get("/organizations")
      setOrganizations(response.data)
    }

    fetchOrganizations()
  }, [])

  const handleNodeSelect = (node) => {
    setSelectedNode(node)
  }

  const handleAddAdmin = (type, id) => {
    setDialogType(`add-${type}-admin`)
    setSelectedNode({ type, id })
    setDialogOpen(true)
  }

  const renderOrganizationTree = () => {
    return organizations.map((org) => (
      <TreeNode
        key={org.id}
        id={org.id}
        label={org.name}
        type="organization"
        onSelect={handleNodeSelect}
        actions={
          <PermissionGate action="assign" subject="role">
            <Button
              size="sm"
              onClick={() => handleAddAdmin("organization", org.id)}
            >
              Add Admin
            </Button>
          </PermissionGate>
        }
      >
        {org.departments.map((dept) => (
          <TreeNode
            key={dept.id}
            id={dept.id}
            label={dept.name}
            type="department"
            onSelect={handleNodeSelect}
            actions={
              <PermissionGate action="assign" subject="role">
                <Button
                  size="sm"
                  onClick={() => handleAddAdmin("department", dept.id)}
                >
                  Add Admin
                </Button>
              </PermissionGate>
            }
          >
            {dept.teams.map((team) => (
              <TreeNode
                key={team.id}
                id={team.id}
                label={team.name}
                type="team"
                onSelect={handleNodeSelect}
                actions={
                  <PermissionGate action="assign" subject="role">
                    <Button
                      size="sm"
                      onClick={() => handleAddAdmin("team", team.id)}
                    >
                      Add Lead
                    </Button>
                  </PermissionGate>
                }
              >
                {team.projects.map((project) => (
                  <TreeNode
                    key={project.id}
                    id={project.id}
                    label={project.name}
                    type="project"
                    onSelect={handleNodeSelect}
                    actions={
                      <PermissionGate action="assign" subject="role">
                        <Button
                          size="sm"
                          onClick={() => handleAddAdmin("project", project.id)}
                        >
                          Add Manager
                        </Button>
                      </PermissionGate>
                    }
                  />
                ))}
              </TreeNode>
            ))}
          </TreeNode>
        ))}
      </TreeNode>
    ))
  }

  return (
    <div>
      <h1>Organization Hierarchy</h1>

      <PermissionGate action="create" subject="organization">
        <Button onClick={() => setDialogType("add-organization")}>
          Add Organization
        </Button>
      </PermissionGate>

      <Tree>{renderOrganizationTree()}</Tree>

      {/* Dialogs for adding organizations, departments, teams, projects, and admins */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={getDialogTitle(dialogType)}
      >
        {/* Dialog content based on dialogType */}
      </Dialog>
    </div>
  )
}
```

## 3. Integration of Both Systems

The Metadata Publication Workflow and Organization Hierarchy systems can be integrated to provide a comprehensive solution:

1. **Scoped Metadata**: Metadata records are associated with specific levels of the organization hierarchy.

2. **Permission Inheritance**: Users inherit permissions based on their position in the hierarchy and their assigned roles.

3. **Delegated Workflow Management**: Organization admins can delegate workflow responsibilities to department admins, who can further delegate to team leads.

4. **Cross-Organizational Collaboration**: Teams from different departments can collaborate on metadata records with appropriate permissions.

5. **Activity Tracking**: All actions are logged with organizational context for comprehensive auditing.

This integration creates a powerful system that supports complex business processes while maintaining proper access controls at all levels of the organization.
