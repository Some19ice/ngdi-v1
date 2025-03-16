import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import { metadataService } from "@/lib/services/metadata.service"

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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Decode the token
    let userId, email, role
    try {
      const decoded = jose.decodeJwt(token)
      userId = decoded.sub || (decoded.userId as string)
      email = decoded.email as string
      role = decoded.role as string

      if (!userId) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    } catch (error) {
      console.error("Error decoding token:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const limit = searchParams.get("limit") || "10"
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc"

    // Call the metadata service
    const result = await metadataService.searchMetadata({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      category,
      sortBy: sortBy as any,
      sortOrder,
    })

    // Return the response
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error in metadata search API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
