/**
 * This script creates a mock authentication token for admin API requests
 * Run with: node scripts/mock-admin-auth.js
 */

const fs = require("fs")
const path = require("path")
const jose = require("jose")
const crypto = require("crypto")

// Create a secret key for signing the token
const createSecretKey = async () => {
  return crypto.randomBytes(32)
}

// Create a JWT token with admin privileges
const createAdminToken = async (secretKey) => {
  const alg = "HS256"
  const payload = {
    userId: "demo-user-id",
    email: "admin@example.com",
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  }

  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .sign(secretKey)

  return jwt
}

// Write the token to a .env.local file
const updateEnvFile = (token) => {
  const envPath = path.join(process.cwd(), ".env.local")
  let envContent = ""

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8")
    // Remove any existing NEXT_PUBLIC_MOCK_ADMIN_TOKEN
    envContent = envContent.replace(/^NEXT_PUBLIC_MOCK_ADMIN_TOKEN=.*$/m, "")
  }

  // Add the new token
  if (!envContent.endsWith("\n")) {
    envContent += "\n"
  }
  envContent += `NEXT_PUBLIC_MOCK_ADMIN_TOKEN=${token}\n`

  fs.writeFileSync(envPath, envContent)
  console.log("Mock admin token written to .env.local")
}

// Create a helper file in lib/auth/mock.ts
const createMockHelper = () => {
  const helperCode = `/**
 * Helper functions for mock authentication in development
 */
export function getMockAdminToken() {
  return process.env.NEXT_PUBLIC_MOCK_ADMIN_TOKEN || '';
}

export function isMockAuthEnabled() {
  return process.env.NODE_ENV === 'development';
}

export const MOCK_ADMIN_USER = {
  id: 'demo-user-id',
  email: 'admin@example.com',
  role: 'ADMIN',
};
`

  const helperPath = path.join(process.cwd(), "lib", "auth", "mock.ts")
  fs.writeFileSync(helperPath, helperCode)
  console.log("Mock auth helper created at lib/auth/mock.ts")
}

// Main function
const main = async () => {
  try {
    console.log("Creating mock admin authentication token...")
    const secretKey = await createSecretKey()
    const token = await createAdminToken(secretKey)

    updateEnvFile(token)
    createMockHelper()

    console.log("✅ Mock authentication setup complete.")
    console.log("")
    console.log("Now modify your API fetch functions to include this token")
    console.log("in the Authorization header when accessing admin routes:")
    console.log("")
    console.log("Example:")
    console.log("```")
    console.log('import { getMockAdminToken } from "@/lib/auth/mock";')
    console.log("")
    console.log("// In your fetch function")
    console.log("const token = getMockAdminToken();")
    console.log("const headers = { Authorization: `Bearer ${token}` }")
    console.log('const response = await fetch("/api/admin/...", { headers });')
    console.log("```")
  } catch (error) {
    console.error("Error creating mock authentication:", error)
    process.exit(1)
  }
}

main()
