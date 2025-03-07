// Set NODE_ENV to test to disable rate limiting
process.env.NODE_ENV = "test"

// Simple test script for auth routes
const { fetch } = require("undici")

// Simple test script for auth routes
async function testAuth() {
  try {
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

    const loginData = await loginResponse.json()
    console.log("Login response:", loginData)

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

    const registerData = await registerResponse.json()
    console.log("Register response:", registerData)
  } catch (error) {
    console.error("Error testing auth routes:", error)
  }
}

testAuth()
