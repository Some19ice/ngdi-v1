#!/usr/bin/env node

const { spawn, exec } = require("child_process")
const http = require("http")
const path = require("path")

const API_PORT = 3001
const API_URL = `http://localhost:${API_PORT}`

// Check if API server is already running
function checkApiServer() {
  return new Promise((resolve) => {
    // Try both with and without /api prefix for health check
    // Some deployments use /health and some use /api/health
    const healthEndpoints = [`${API_URL}/health`, `${API_URL}/api/health`]
    let endpointChecked = 0
    let anySuccess = false

    const checkEndpoint = (endpoint) => {
      console.log(`Trying health check at: ${endpoint}`)
      const req = http.get(endpoint, (res) => {
        let responseData = ""

        res.on("data", (chunk) => {
          responseData += chunk
        })

        res.on("end", () => {
          console.log(
            `API health check status (${endpoint}): ${res.statusCode}, Response: ${responseData.substring(0, 100)}...`
          )
          if (res.statusCode === 200) {
            anySuccess = true
            resolve(true)
          } else {
            endpointChecked++
            if (endpointChecked >= healthEndpoints.length && !anySuccess) {
              resolve(false)
            }
          }
        })
      })

      req.on("error", (err) => {
        console.log(`Health check failed for ${endpoint}: ${err.message}`)
        endpointChecked++
        if (endpointChecked >= healthEndpoints.length && !anySuccess) {
          resolve(false)
        }
      })

      req.setTimeout(5000, () => {
        req.destroy()
        console.log(`Health check timed out for ${endpoint}`)
        endpointChecked++
        if (endpointChecked >= healthEndpoints.length && !anySuccess) {
          resolve(false)
        }
      })
    }

    // Try all endpoints
    healthEndpoints.forEach(checkEndpoint)
  })
}

// Start the API server
function startApiServer() {
  console.log("Starting API server...")

  const apiDir = path.resolve(__dirname, "../packages/api")

  // Check if process is already running
  try {
    if (process.platform === "win32") {
      exec('tasklist | findstr /i "node.exe"', (error, stdout) => {
        if (stdout.includes("node.exe")) {
          console.log(
            "Node process already running, checking if it might be our API server..."
          )
        }
      })
    } else {
      exec('ps aux | grep "[n]ode.*api"', (error, stdout) => {
        if (stdout.trim()) {
          console.log("Detected potential API server process already running")
        }
      })
    }
  } catch (err) {
    // Ignore any error from the process check
  }

  // Use the appropriate npm command
  const isWindows = process.platform === "win32"
  const npmCmd = isWindows ? "npm.cmd" : "npm"

  // Different spawn approach with direct command, this time capturing output
  let apiProcess

  // Promise that resolves when server is ready or times out
  return new Promise((resolve) => {
    // Set a timeout in case we never get the startup message
    const timeoutId = setTimeout(() => {
      console.log("API server startup timeout - trying health check anyway")
      resolve(waitForApiServer())
    }, 60000) // Longer timeout (60s instead of 30s)

    if (isWindows) {
      apiProcess = spawn(npmCmd, ["run", "dev"], {
        cwd: apiDir,
        stdio: ["inherit", "pipe", "pipe"], // Capture both stdout and stderr
        detached: true,
        shell: true,
      })
    } else {
      // For Unix systems, use this approach
      apiProcess = spawn("cd " + apiDir + " && npm run dev", {
        stdio: ["inherit", "pipe", "pipe"], // Capture both stdout and stderr
        detached: true,
        shell: true,
      })
    }

    // Listen for key startup patterns on both stdout and stderr
    const startupPatterns = [
      "Server startup complete",
      "ready to accept connections",
      "API server is running on port",
      "Prisma connected successfully",
      "listening at http://localhost:3001",
    ]

    // Check if output contains any of our startup patterns
    const checkForStartupPatterns = (data) => {
      const output = data.toString()
      console.log(output)

      for (const pattern of startupPatterns) {
        if (output.includes(pattern)) {
          console.log(
            `API server startup detected! (matched pattern: "${pattern}")`
          )

          // Wait a bit to allow the server to fully initialize
          setTimeout(async () => {
            console.log("Verifying API server is responsive...")
            const isHealthy = await checkApiServer()

            if (isHealthy) {
              console.log("API server health check passed - server is ready!")
              clearTimeout(timeoutId)
              resolve(true)
            } else {
              console.log(
                "API server not responding yet despite startup messages - waiting longer"
              )
              // Don't clear the timeout, let it continue trying
              // Will be resolved by the timeout handler
            }
          }, 2000)

          // Break out of pattern matching after first match
          return
        }
      }
    }

    // Listen for both stdout and stderr
    apiProcess.stdout?.on("data", checkForStartupPatterns)
    apiProcess.stderr?.on("data", checkForStartupPatterns)

    apiProcess.unref()

    console.log(`API server starting on port ${API_PORT}`)
    console.log("API server process detached, waiting for startup signals...")
  })
}

// Wait for the API server to be responsive
function waitForApiServer(attempts = 0) {
  return new Promise((resolve) => {
    if (attempts > 60) {
      // Increase max attempts from 30 to 60
      console.log("Gave up waiting for API server")
      resolve(false)
      return
    }

    setTimeout(async () => {
      const isRunning = await checkApiServer()
      if (isRunning) {
        console.log("API server is now running!")
        resolve(true)
      } else {
        console.log(`Waiting for API server... (${attempts + 1}/60)`)
        resolve(waitForApiServer(attempts + 1))
      }
    }, 1000)
  })
}

// Main function
async function main() {
  try {
    const isRunning = await checkApiServer()

    if (isRunning) {
      console.log("API server is already running")
    } else {
      console.log("API server is not running, attempting to start it...")
      await startApiServer()
    }
  } catch (err) {
    console.error("Error in API server startup:", err)
  }
}

// Run the main function
main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
