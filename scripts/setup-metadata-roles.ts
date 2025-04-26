import { PrismaClient } from '@prisma/client'
import { 
  METADATA_AUTHOR_PERMISSIONS,
  METADATA_REVIEWER_PERMISSIONS,
  METADATA_PUBLISHER_PERMISSIONS,
  METADATA_ADMIN_PERMISSIONS,
  DASHBOARD_VIEW
} from '../packages/api/src/constants/permissions'

const prisma = new PrismaClient()

/**
 * Setup metadata workflow roles
 */
async function setupMetadataRoles() {
  console.log('Setting up metadata workflow roles...')

  // Create metadata workflow roles
  const roles = [
    {
      name: 'Metadata Author',
      description: 'Can create and edit metadata records and submit them for review',
      permissions: [...METADATA_AUTHOR_PERMISSIONS, DASHBOARD_VIEW]
    },
    {
      name: 'Metadata Reviewer',
      description: 'Can review, approve, or reject metadata records',
      permissions: [...METADATA_REVIEWER_PERMISSIONS, DASHBOARD_VIEW]
    },
    {
      name: 'Metadata Publisher',
      description: 'Can publish or unpublish approved metadata records',
      permissions: [...METADATA_PUBLISHER_PERMISSIONS, DASHBOARD_VIEW]
    },
    {
      name: 'Metadata Administrator',
      description: 'Has full control over metadata records and workflow',
      permissions: [...METADATA_ADMIN_PERMISSIONS, DASHBOARD_VIEW]
    }
  ]

  for (const roleData of roles) {
    console.log(`Setting up role: ${roleData.name}`)
    
    // Create or update the role
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        description: roleData.description
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        isSystem: false
      }
    })

    // Get permissions
    const permissions = []
    for (const permission of roleData.permissions) {
      const permissionRecord = await prisma.permission.findUnique({
        where: {
          action_subject: {
            action: permission.action,
            subject: permission.subject
          }
        }
      })

      if (permissionRecord) {
        permissions.push(permissionRecord)
      } else {
        console.warn(`Permission not found: ${permission.action}:${permission.subject}`)
      }
    }

    // Delete existing role permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    })

    // Create new role permissions
    for (const permission of permissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id
        }
      })
    }

    console.log(`Role "${roleData.name}" set up with ${permissions.length} permissions`)
  }

  console.log('Metadata workflow roles setup complete!')
}

// Run the setup
setupMetadataRoles()
  .catch(e => {
    console.error('Error setting up metadata roles:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
