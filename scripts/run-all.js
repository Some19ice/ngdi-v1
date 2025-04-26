#!/usr/bin/env node

const { spawn } = require("child_process")
const path = require("path")

// Colors for console output
const colors = {
  api: "\x1b[36m", // Cyan
  next: "\x1b[35m", // Magenta
  reset: "\x1b[0m", // Reset
}

// Function to start the API server
function startApiServer() {
  console.log(`${colors.api}[API] Starting API server...${colors.reset}`)

  const apiDir = path.resolve(__dirname, "../packages/api")
  const isWindows = process.platform === "win32"
  const npmCmd = isWindows ? "npm.cmd" : "npm"

  const apiProcess = spawn(npmCmd, ["run", "dev"], {
    cwd: apiDir,
    stdio: "pipe",
    shell: true,
  })

  apiProcess.stdout.on("data", (data) => {
    console.log(`${colors.api}[API] ${data.toString().trim()}${colors.reset}`)
  })

  apiProcess.stderr.on("data", (data) => {
    console.error(
      `${colors.api}[API ERROR] ${data.toString().trim()}${colors.reset}`
    )
  })

  apiProcess.on("close", (code) => {
    console.log(
      `${colors.api}[API] Process exited with code ${code}${colors.reset}`
    )
  })

  return apiProcess
}

// Function to start the Next.js application
function startNextApp() {
  console.log(
    `${colors.next}[NEXT] Starting Next.js application...${colors.reset}`
  )

  const rootDir = path.resolve(__dirname, "..")
  const isWindows = process.platform === "win32"
  const nextCmd = isWindows ? "npx.cmd" : "npx"

  const nextProcess = spawn(nextCmd, ["next", "dev"], {
    cwd: rootDir,
    stdio: "pipe",
    shell: true,
  })

  nextProcess.stdout.on("data", (data) => {
    console.log(`${colors.next}[NEXT] ${data.toString().trim()}${colors.reset}`)
  })

  nextProcess.stderr.on("data", (data) => {
    console.error(
      `${colors.next}[NEXT ERROR] ${data.toString().trim()}${colors.reset}`
    )
  })

  nextProcess.on("close", (code) => {
    console.log(
      `${colors.next}[NEXT] Process exited with code ${code}${colors.reset}`
    )
  })

  return nextProcess
}

// Main function to run both processes
function main() {
  console.log("Starting all services for development...")

  // Start API server first
  const apiProcess = startApiServer()

  // Wait for API to initialize before starting Next.js
  setTimeout(() => {
    const nextProcess = startNextApp()

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down all services...")
      apiProcess.kill()
      nextProcess.kill()
      process.exit(0)
    })
  }, 5000) // Wait 5 seconds for API to start
}

// Run the main function
main()
