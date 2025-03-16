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

    console.log("Search metadata: Token status", {
      hasAuthToken: !!authToken,
      authTokenLength: authToken?.length,
      hasHeaderToken: !!headerToken,
      headerTokenLength: headerToken?.length,
      finalToken: token ? `${token.substring(0, 10)}...` : null,
    })

    // Allow public access for search, but note the token status
    const isAuthenticated = !!token

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const queryString = searchParams.toString()

    console.log(
      `Search metadata proxy: Forwarding request to API server: ${API_URL}/api/search/metadata?${queryString}`
    )

    try {
      // Forward the request to the API server
      const response = await axios.get(
        `${API_URL}/api/search/metadata?${queryString}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      )

      console.log("Search metadata proxy: Received response from API server", {
        status: response.status,
        hasData: !!response.data,
        dataStructure: response.data ? Object.keys(response.data) : null,
        success: response.data?.success,
        dataContent: response.data?.data
          ? {
              total: response.data.data.total,
              currentPage: response.data.data.currentPage,
              totalPages: response.data.data.totalPages,
              metadataCount: response.data.data.metadata?.length,
            }
          : null,
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
          url: `${API_URL}/api/search/metadata?${queryString}`,
          headers: token
            ? { Authorization: `Bearer ${token.substring(0, 5)}...` }
            : "No auth token",
        })

        // If unauthorized and no token provided, return empty results instead of error
        if (axiosError.response?.status === 401 && !isAuthenticated) {
          return NextResponse.json({
            success: true,
            data: {
              metadata: [],
              total: 0,
              currentPage: 1,
              totalPages: 0,
            },
          })
        }

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
    console.error("Error in search metadata API:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
