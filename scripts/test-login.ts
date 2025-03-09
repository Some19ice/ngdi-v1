import axios from 'axios';
import * as jose from "jose"

async function testLogin() {
  try {
    console.log("Testing login flow...")

    // Admin credentials
    const adminEmail = "admin@example.com"
    const adminPassword = "admin123"

    console.log(`Attempting to login as admin (${adminEmail})...`)

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
    console.log("\nDecoding access token...")
    const decoded = jose.decodeJwt(accessToken)

    console.log("Token payload:", {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : "unknown",
    })

    // Check if role is included and correct
    if (!decoded.role) {
      console.error("ERROR: Role is missing from the token!")
    } else if (decoded.role !== "ADMIN") {
      console.error(
        `ERROR: Role in token is "${decoded.role}" instead of "ADMIN"!`
      )
    } else {
      console.log("Role in token is correct: ADMIN")
    }

    // Test a protected endpoint
    console.log("\nTesting access to a protected endpoint...")
    try {
      const protectedResponse = await axios.get(
        "http://localhost:3001/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      console.log(
        "Protected endpoint response status:",
        protectedResponse.status
      )
      console.log("Access to protected endpoint successful!")
    } catch (error: any) {
      console.error(
        "Failed to access protected endpoint:",
        error.response?.status
      )
      console.error("Error response:", error.response?.data)
    }

    console.log("\nLogin flow test completed!")
  } catch (error: any) {
    console.error("Error testing login flow:", error.message)
    if (error.response) {
      console.error("Response status:", error.response.status)
      console.error("Response data:", error.response.data)
    }
  }
}

// Run the function
testLogin(); 