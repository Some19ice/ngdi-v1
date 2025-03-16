import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import axios from "axios"

// In production, we need to use the local API routes from the packages directory
const isProduction = process.env.NODE_ENV === "production"
const API_URL = isProduction
  ? process.env.NEXT_PUBLIC_API_URL || "https://ngdi-v1.vercel.app/api"
  : "http://localhost:3001"

export async function GET(req: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("auth_token")?.value

    // Get the auth token from authorization header as fallback
    const authHeader = req.headers.get("authorization")
    const headerToken = authHeader?.replace("Bearer ", "")

    // Use the token from cookies or header
    const token = authToken || headerToken
    
    console.log("Metadata search: Token status", {
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      hasHeaderToken: !!headerToken,
      headerTokenLength: headerToken?.length,
      finalToken: token ? `${token.substring(0, 10)}...` : null,
    })

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const queryString = searchParams.toString()

    console.log(
      `Metadata search proxy: Forwarding request to API server: ${API_URL}/api/metadata/search?${queryString}`
    )

    try {
      // Forward the request to the API server
      const response = await axios.get(
        `${API_URL}/api/metadata/search?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log("Metadata search proxy: Received response from API server", {
        status: response.status,
        hasData: !!response.data,
      })

      // Return the response from the API server
      return NextResponse.json(response.data)
    } catch (axiosError) {
      if (axios.isAxiosError(axiosError)) {
        console.error("API server error details:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          message: axiosError.message,
        })

        const status = axiosError.response?.status || 500
        const message =
          axiosError.response?.data?.message ||
          axiosError.response?.data ||
          "Internal server error"

        return NextResponse.json({ error: message }, { status })
      }
      throw axiosError // Re-throw if not an axios error
    }
  } catch (error) {
    console.error("Error in metadata search API:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
