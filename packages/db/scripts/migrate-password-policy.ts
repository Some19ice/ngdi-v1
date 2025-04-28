/**
 * Migration script to update existing users with password policy fields
 * 
 * This script:
 * 1. Sets passwordLastChanged to the current timestamp for all users
 * 2. Sets passwordExpiresAt to 90 days from now for all users
 * 3. Initializes previousPasswords as an empty array
 * 4. Sets passwordChangeRequired to false for all users
 */

import { PrismaClient } from '@prisma/client'
import { passwordPolicyConfig } from '../../api/src/config/password-policy.config'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting password policy migration...')
  
  // Get all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
    },
  })
  
  console.log(`Found ${users.length} users to update`)
  
  // Calculate expiration date (90 days from now)
  const expirationDate = new Date()
  expirationDate.setDate(
    expirationDate.getDate() + passwordPolicyConfig.expiration.expirationDays
  )
  
  // Update each user
  for (const user of users) {
    console.log(`Updating user: ${user.email}`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordLastChanged: new Date(),
        passwordExpiresAt: expirationDate,
        previousPasswords: [],
        passwordChangeRequired: false,
      },
    })
  }
  
  console.log('Password policy migration completed successfully')
}

main()
  .catch((error) => {
    console.error('Error during migration:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
