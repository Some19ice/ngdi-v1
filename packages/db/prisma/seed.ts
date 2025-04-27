import { prisma } from "../src"
import { hash } from "bcryptjs"

/**
 * Define default permissions
 */
const defaultPermissions = [
  // Metadata permissions
  {
    name: "metadata:create",
    action: "create",
    subject: "metadata",
    description: "Create metadata records",
  },
  {
    name: "metadata:read",
    action: "read",
    subject: "metadata",
    description: "View metadata records",
  },
  {
    name: "metadata:update",
    action: "update",
    subject: "metadata",
    description: "Update metadata records",
  },
  {
    name: "metadata:delete",
    action: "delete",
    subject: "metadata",
    description: "Delete metadata records",
  },
  {
    name: "metadata:approve",
    action: "approve",
    subject: "metadata",
    description: "Approve metadata records",
  },
  {
    name: "metadata:publish",
    action: "publish",
    subject: "metadata",
    description: "Publish metadata records",
  },
  {
    name: "metadata:import",
    action: "import",
    subject: "metadata",
    description: "Import metadata records",
  },
  {
    name: "metadata:export",
    action: "export",
    subject: "metadata",
    description: "Export metadata records",
  },

  // User permissions
  {
    name: "user:create",
    action: "create",
    subject: "user",
    description: "Create users",
  },
  {
    name: "user:read",
    action: "read",
    subject: "user",
    description: "View users",
  },
  {
    name: "user:update",
    action: "update",
    subject: "user",
    description: "Update users",
  },
  {
    name: "user:delete",
    action: "delete",
    subject: "user",
    description: "Delete users",
  },
  {
    name: "user:manage-roles",
    action: "manage-roles",
    subject: "user",
    description: "Manage user roles",
  },

  // Role permissions
  {
    name: "role:create",
    action: "create",
    subject: "role",
    description: "Create roles",
  },
  {
    name: "role:read",
    action: "read",
    subject: "role",
    description: "View roles",
  },
  {
    name: "role:update",
    action: "update",
    subject: "role",
    description: "Update roles",
  },
  {
    name: "role:delete",
    action: "delete",
    subject: "role",
    description: "Delete roles",
  },
  {
    name: "role:assign",
    action: "assign",
    subject: "role",
    description: "Assign roles to users",
  },

  // Permission permissions
  {
    name: "permission:create",
    action: "create",
    subject: "permission",
    description: "Create permissions",
  },
  {
    name: "permission:read",
    action: "read",
    subject: "permission",
    description: "View permissions",
  },
  {
    name: "permission:update",
    action: "update",
    subject: "permission",
    description: "Update permissions",
  },
  {
    name: "permission:delete",
    action: "delete",
    subject: "permission",
    description: "Delete permissions",
  },
  {
    name: "permission:assign",
    action: "assign",
    subject: "permission",
    description: "Assign permissions to roles or users",
  },

  // System permissions
  {
    name: "system:settings",
    action: "manage",
    subject: "settings",
    description: "Manage system settings",
  },
  {
    name: "system:logs",
    action: "view",
    subject: "logs",
    description: "View system logs",
  },
  {
    name: "system:backup",
    action: "manage",
    subject: "backup",
    description: "Manage system backups",
  },

  // Dashboard permissions
  {
    name: "dashboard:view",
    action: "view",
    subject: "dashboard",
    description: "View dashboard",
  },
  {
    name: "dashboard:analytics",
    action: "view",
    subject: "analytics",
    description: "View analytics",
  },
  {
    name: "dashboard:reports",
    action: "view",
    subject: "reports",
    description: "View reports",
  },

  // Organization permissions
  {
    name: "organization:create",
    action: "create",
    subject: "organization",
    description: "Create organizations",
  },
  {
    name: "organization:read",
    action: "read",
    subject: "organization",
    description: "View organizations",
  },
  {
    name: "organization:update",
    action: "update",
    subject: "organization",
    description: "Update organizations",
  },
  {
    name: "organization:delete",
    action: "delete",
    subject: "organization",
    description: "Delete organizations",
  },
  {
    name: "organization:manage-members",
    action: "manage-members",
    subject: "organization",
    description: "Manage organization members",
  },
]

/**
 * Define permission groups
 */
const permissionGroups = [
  {
    name: "Metadata Management",
    description: "Permissions for managing metadata",
    permissions: [
      "metadata:create",
      "metadata:read",
      "metadata:update",
      "metadata:delete",
      "metadata:approve",
      "metadata:publish",
      "metadata:import",
      "metadata:export",
    ],
  },
  {
    name: "User Management",
    description: "Permissions for managing users",
    permissions: [
      "user:create",
      "user:read",
      "user:update",
      "user:delete",
      "user:manage-roles",
    ],
  },
  {
    name: "Role Management",
    description: "Permissions for managing roles",
    permissions: [
      "role:create",
      "role:read",
      "role:update",
      "role:delete",
      "role:assign",
    ],
  },
  {
    name: "Permission Management",
    description: "Permissions for managing permissions",
    permissions: [
      "permission:create",
      "permission:read",
      "permission:update",
      "permission:delete",
      "permission:assign",
    ],
  },
  {
    name: "System Administration",
    description: "Permissions for system administration",
    permissions: ["system:settings", "system:logs", "system:backup"],
  },
  {
    name: "Dashboard Access",
    description: "Permissions for dashboard access",
    permissions: ["dashboard:view", "dashboard:analytics", "dashboard:reports"],
  },
  {
    name: "Organization Management",
    description: "Permissions for managing organizations",
    permissions: [
      "organization:create",
      "organization:read",
      "organization:update",
      "organization:delete",
      "organization:manage-members",
    ],
  },
]

/**
 * Define roles with their permissions
 */
const roles = [
  {
    name: "Admin",
    description: "System administrator with full access",
    isSystem: true,
    permissions: defaultPermissions.map((p) => p.name),
  },
  {
    name: "Node Officer",
    description: "Node officer with specific privileges",
    isSystem: true,
    permissions: [
      "metadata:create",
      "metadata:read",
      "metadata:update",
      "metadata:approve",
      "metadata:publish",
      "metadata:import",
      "metadata:export",
      "user:read",
      "user:create",
      "dashboard:view",
      "dashboard:analytics",
      "dashboard:reports",
      "organization:read",
      "organization:update",
    ],
  },
  {
    name: "User",
    description: "Regular user with basic access",
    isSystem: true,
    permissions: ["metadata:read", "metadata:create", "dashboard:view"],
  },
  {
    name: "Guest",
    description: "Guest user with limited access",
    isSystem: true,
    permissions: ["metadata:read"],
  },
  {
    name: "Content Manager",
    description: "User who can manage metadata content",
    isSystem: false,
    permissions: [
      "metadata:create",
      "metadata:read",
      "metadata:update",
      "metadata:delete",
      "metadata:import",
      "metadata:export",
      "dashboard:view",
      "dashboard:reports",
    ],
  },
  {
    name: "Analyst",
    description: "User who can analyze data",
    isSystem: false,
    permissions: [
      "metadata:read",
      "metadata:export",
      "dashboard:view",
      "dashboard:analytics",
      "dashboard:reports",
    ],
  },
]

/**
 * Seed the database with initial data
 */
async function main() {
  console.log("Starting database seeding...")

  // Create permissions
  console.log("Creating permissions...")
  for (const permission of defaultPermissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    })
  }

  // Create permission groups
  console.log("Creating permission groups...")
  for (const group of permissionGroups) {
    const { permissions, ...groupData } = group

    // Create or update the group
    const permissionGroup = await prisma.permissionGroup.upsert({
      where: { name: group.name },
      update: groupData,
      create: groupData,
    })

    // Get permission IDs
    const permissionRecords = await prisma.permission.findMany({
      where: { name: { in: permissions } },
    })

    // Delete existing group items
    await prisma.permissionGroupItem.deleteMany({
      where: { groupId: permissionGroup.id },
    })

    // Create new group items
    for (const permission of permissionRecords) {
      await prisma.permissionGroupItem.create({
        data: {
          groupId: permissionGroup.id,
          permissionId: permission.id,
        },
      })
    }
  }

  // Create roles
  console.log("Creating roles...")
  for (const role of roles) {
    const { permissions, ...roleData } = role

    // Create or update the role
    const roleRecord = await prisma.role.upsert({
      where: { name: role.name },
      update: roleData,
      create: roleData,
    })

    // Get permission IDs
    const permissionRecords = await prisma.permission.findMany({
      where: { name: { in: permissions } },
    })

    // Delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: roleRecord.id },
    })

    // Create new role permissions
    for (const permission of permissionRecords) {
      await prisma.rolePermission.create({
        data: {
          roleId: roleRecord.id,
          permissionId: permission.id,
        },
      })
    }
  }

  // Create admin user if it doesn't exist
  const adminEmail = "admin@example.com"
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    console.log("Creating admin user...")

    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { name: "Admin" },
    })

    if (!adminRole) {
      throw new Error("Admin role not found")
    }

    // Create admin user
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin User",
        password: await hash("Admin123!", 10),
        role: "ADMIN",
        roleId: adminRole.id,
        emailVerified: new Date(),
      },
    })
  }

  // Migrate existing users to new role system
  console.log("Migrating existing users to new role system...")

  // Get roles
  const adminRoleRecord = await prisma.role.findUnique({
    where: { name: "Admin" },
  })
  const nodeOfficerRoleRecord = await prisma.role.findUnique({
    where: { name: "Node Officer" },
  })
  const userRoleRecord = await prisma.role.findUnique({
    where: { name: "User" },
  })

  // Update users without roleId
  if (adminRoleRecord) {
    await prisma.user.updateMany({
      where: { role: "ADMIN", roleId: null },
      data: { roleId: adminRoleRecord.id },
    })
  }

  if (nodeOfficerRoleRecord) {
    await prisma.user.updateMany({
      where: { role: "NODE_OFFICER", roleId: null },
      data: { roleId: nodeOfficerRoleRecord.id },
    })
  }

  if (userRoleRecord) {
    await prisma.user.updateMany({
      where: { role: "USER", roleId: null },
      data: { roleId: userRoleRecord.id },
    })
  }

  console.log("Database seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
