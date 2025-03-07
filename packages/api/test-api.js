// Test script for API endpoints
const { fetch } = require("undici")

async function testApiEndpoints() {
  try {
    // Test login endpoint
    console.log("Testing login endpoint...")
    const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
      }),
    })

    console.log("Login status:", loginResponse.status)
    const loginData = await loginResponse.json()
    console.log("Login response:", loginData)

    // Test register endpoint
    console.log("\nTesting register endpoint...")
    const registerResponse = await fetch(
      "http://localhost:3001/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test User",
          email: "newuser@example.com",
          password: "password123",
        }),
      }
    )

    console.log("Register status:", registerResponse.status)
    const registerData = await registerResponse.json()
    console.log("Register response:", registerData)
  } catch (error) {
    console.error("Error testing API endpoints:", error)
  }
}

testApiEndpoints()
