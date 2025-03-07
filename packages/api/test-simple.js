// Simple test script for the root endpoint
const { fetch } = require("undici")

async function testRoot() {
  try {
    console.log("Testing root endpoint...")
    const response = await fetch("http://localhost:3001/")

    if (response.ok) {
      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        const data = await response.json()
        console.log("Root endpoint response (JSON):", data)
      } else {
        const text = await response.text()
        console.log(
          "Root endpoint response (Text):",
          text.substring(0, 100) + "..."
        )
      }

      console.log("Test passed!")
    } else {
      console.error("Root endpoint returned status:", response.status)
      console.log("Test failed!")
    }
  } catch (error) {
    console.error("Error testing root endpoint:", error)
    console.log("Test failed!")
  }
}

testRoot()
