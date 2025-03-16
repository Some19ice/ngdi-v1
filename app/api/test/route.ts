import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function GET(req: NextRequest) {
  try {
    // Test the connection to the API server
    const response = await axios.get(`${API_URL}/api/health`)

    return NextResponse.json({
      success: true,
      message: "API connection successful",
      apiUrl: API_URL,
      apiResponse: response.data,
    })
  } catch (error: any) {
    console.error("API connection test error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "API connection failed",
        apiUrl: API_URL,
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
