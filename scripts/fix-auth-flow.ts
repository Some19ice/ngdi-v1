import { PrismaClient } from "@prisma/client"
import * as bcrypt from "bcryptjs"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

async function fixAuthFlow() {
  try {
    console.log("Fixing authentication flow...")

    // 1. Check and fix admin users
    console.log("\n1. Checking admin users...")
    const adminUsers = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    })

    console.log(`Found ${adminUsers.length} admin users:`)
    adminUsers.forEach((user) => {
      console.log(
        `- ${user.email} (${user.name || "No name"}) - Role: ${user.role}`
      )
    })

    // Create admin user if none exists
    if (adminUsers.length === 0) {
      console.log("\nNo admin users found. Creating default admin...")

      // Create default admin
      const hashedPassword = await bcrypt.hash("admin123", 10)

      const newAdmin = await prisma.user.create({
        data: {
          email: "admin@example.com",
          name: "Admin User",
          password: hashedPassword,
          role: "ADMIN",
          organization: "NGDI Administration",
        },
      })

      console.log("Default admin user created:")
      console.log(`- ID: ${newAdmin.id}`)
      console.log(`- Email: ${newAdmin.email}`)
      console.log(`- Name: ${newAdmin.name}`)
      console.log(`- Role: ${newAdmin.role}`)
    }

    // 2. Clear all sessions to force re-login
    console.log("\n2. Clearing all sessions...")
    const deletedSessions = await prisma.session.deleteMany({})
    console.log(`Deleted ${deletedSessions.count} sessions`)

    // 3. Create a login test script
    console.log("\n3. Creating login test script...")
    const loginTestScript = `
import axios from "axios"
import * as jose from "jose"

async function testLogin() {
  try {
    console.log("Testing login flow...")
    
    // Admin credentials
    const adminEmail = "admin@example.com"
    const adminPassword = "admin123"
    
    console.log(\`Attempting to login as admin (\${adminEmail})...\`)
    
    // Make login request
    const response = await axios.post("http://localhost:3001/api/auth/login", {
      email: adminEmail,
      password: adminPassword,
    })
    
    console.log("Login response status:", response.status)
    
    if (response.status !== 200) {
      console.error("Login failed with status:", response.status)
      console.error("Response data:", response.data)
      return
    }
    
    const { accessToken, refreshToken, user } = response.data
    
    console.log("Login successful!")
    console.log("User:", {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    
    // Decode the access token
    console.log("\\nDecoding access token...")
    const decoded = jose.decodeJwt(accessToken)
    
    console.log("Token payload:", {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "unknown",
    })
    
    console.log("\\nLogin flow test completed!")
  } catch (error) {
    console.error("Error testing login flow:", error)
  }
}

// Run the function
testLogin()
`

    fs.writeFileSync(
      path.join(process.cwd(), "scripts", "test-admin-login.ts"),
      loginTestScript
    )
    console.log("Login test script created at scripts/test-admin-login.ts")

    // 4. Print instructions
    console.log("\n4. Instructions to fix the issue:")
    console.log("a. Restart your development server")
    console.log("b. Clear your browser cookies and local storage")
    console.log("c. Log in with the following credentials:")
    console.log("   - Email: admin@example.com")
    console.log("   - Password: admin123")
    console.log("d. If you still have issues, run the test script:")
    console.log("   npx ts-node scripts/test-admin-login.ts")

    console.log("\nAuth flow fix completed!")
  } catch (error) {
    console.error("Error fixing auth flow:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
fixAuthFlow()
