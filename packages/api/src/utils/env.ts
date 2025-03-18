import dotenv from "dotenv"
import fs from "fs"
import path from "path"

/**
 * Load environment variables from .env files
 * Tries to load from .env.local first, then falls back to .env
 */
export function loadEnv() {
  console.log("[ENV] Current working directory:", process.cwd())

  // Try to load from .env.local first
  const localEnvPath = path.resolve(process.cwd(), ".env.local")
  const defaultEnvPath = path.resolve(process.cwd(), ".env")

  console.log("[ENV] Checking for .env.local at:", localEnvPath)
  console.log("[ENV] Checking for .env at:", defaultEnvPath)

  if (fs.existsSync(localEnvPath)) {
    console.log("[ENV] Loading variables from .env.local")
    dotenv.config({ path: localEnvPath })
  } else if (fs.existsSync(defaultEnvPath)) {
    console.log("[ENV] Loading variables from .env")
    dotenv.config({ path: defaultEnvPath })
  } else {
    console.warn("[ENV] No .env or .env.local file found")
  }

  // Check if SERVER_API_KEY is loaded
  if (process.env.SERVER_API_KEY) {
    console.log("[ENV] SERVER_API_KEY is loaded")
  } else {
    console.warn("[ENV] SERVER_API_KEY is not loaded")
  }

  // Also try parent directory for monorepo setups
  const parentEnvPath = path.resolve(process.cwd(), "..", "..", ".env.local")
  if (fs.existsSync(parentEnvPath)) {
    console.log("[ENV] Loading variables from parent directory .env.local")
    dotenv.config({ path: parentEnvPath })
  }

  // Set default values for required variables
  process.env.SERVER_API_KEY =
    process.env.SERVER_API_KEY || "admin-api-secret-token-for-server-requests"
}

// Immediately load environment variables
loadEnv()
