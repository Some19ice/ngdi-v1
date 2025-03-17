import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"
import axios from "axios"
import { metadataServerService as metadataService } from "@/lib/server/metadata.server"

// In production, we need to use the local API routes from the packages directory
const isProduction = process.env.NODE_ENV === "production"

// Use a different URL for the backend API to avoid redirection loops
// The frontend and API should be on different domains or ports
const API_URL = isProduction
  ? process.env.BACKEND_API_URL || "http://localhost:3001"
  : "http://localhost:3001"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract auth token from request headers
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null

    console.log("API route received request:", {
      url: request.url,
      hasAuthToken: !!token,
      tokenLength: token?.length,
    })

    // Extract search parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "9")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const dateFrom = searchParams.get("dateFrom") || undefined
    const dateTo = searchParams.get("dateTo") || undefined

    // Log search parameters for debugging
    console.log("Search parameters:", {
      page,
      limit,
      search: search ? `"${search}"` : "(empty)",
      searchLength: search?.length,
      category: category || "(none)",
      dateFrom: dateFrom || "(none)",
      dateTo: dateTo || "(none)",
    })

    // Call the metadata service with the token
    console.log("Calling metadata service...")
    const result = await metadataService.searchMetadata({
      page,
      limit,
      search,
      category,
      dateFrom,
      dateTo,
    })

    console.log("Search results:", {
      totalResults: result.total,
      itemsReturned: result.metadata.length,
      firstItem: result.metadata.length > 0 ? result.metadata[0].title : "none",
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error in search metadata API:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
