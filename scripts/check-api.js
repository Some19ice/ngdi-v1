#!/usr/bin/env node

/**
 * This script checks if the API server is running and restarts it if needed.
 * Run it with: node scripts/check-api.js
 */

const http = require("http")
const { spawn } = require("child_process")
const path = require("path")

const API_PORT = 3001
const API_URL = `http://localhost:${API_PORT}`

// Check API server health
function checkApiHealth() {
  console.log("Checking API server health...")

  return new Promise((resolve) => {
    const healthEndpoints = [`${API_URL}/health`, `${API_URL}/api/health`]
    let endpointsChecked = 0
    let anySuccess = false

    const checkEndpoint = (endpoint) => {
      console.log(`Checking endpoint: ${endpoint}`)
      const req = http.get(endpoint, (res) => {
        let data = ""

        res.on("data", (chunk) => {
          data += chunk
        })

        res.on("end", () => {
          if (res.statusCode === 200) {
            console.log(
              `✅ API server is running at ${endpoint} (status: ${res.statusCode})`
            )
            console.log(`Response: ${data.substring(0, 100)}...`)
            anySuccess = true
            resolve(true)
            return
          }

          console.log(
            `❌ API server responded with status ${res.statusCode} at ${endpoint}`
          )
          console.log(`Response: ${data}`)
          endpointsChecked++

          if (endpointsChecked >= healthEndpoints.length && !anySuccess) {
            resolve(false)
          }
        })
      })

      req.on("error", (err) => {
        console.log(
          `❌ Failed to connect to API server at ${endpoint}: ${err.message}`
        )
        endpointsChecked++

        if (endpointsChecked >= healthEndpoints.length && !anySuccess) {
          resolve(false)
        }
      })

      req.setTimeout(5000, () => {
        console.log(`❌ Request to ${endpoint} timed out after 5s`)
        req.destroy()
        endpointsChecked++

        if (endpointsChecked >= healthEndpoints.length && !anySuccess) {
          resolve(false)
        }
      })
    }

    healthEndpoints.forEach(checkEndpoint)
  })
}

// Start the API server
function startApiServer() {
  console.log("Starting API server...")

  const apiDir = path.resolve(__dirname, "../packages/api")
  const isWindows = process.platform === "win32"
  const npmCmd = isWindows ? "npm.cmd" : "npm"
  const scriptPath = path.resolve(__dirname, "start-api.js")

  // Use the start-api.js script instead of directly running npm
  console.log(`Running start-api.js script from ${scriptPath}`)

  const apiProcess = spawn("node", [scriptPath], {
    stdio: "inherit",
    detached: true,
  })

  apiProcess.on("error", (err) => {
    console.error("Failed to start API server:", err)
  })

  apiProcess.unref()

  console.log("API server starting in the background...")
  console.log("API startup will continue after this script exits")
  console.log("To view the logs, run: cd packages/api && npm run dev")

  // Don't keep the script running, let the start-api.js handle everything
}

// Main function
async function main() {
  const isRunning = await checkApiHealth()

  if (isRunning) {
    console.log("✅ API server is already running. No action needed.")
  } else {
    console.log("❌ API server is not running or not responding.")
    console.log("Starting API server...")
    startApiServer()
  }
}

// Run main function
main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
