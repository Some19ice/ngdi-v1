import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { handleCsrf } from "@/lib/api-utils"

// Mark this route as dynamic to prevent static optimization
export const dynamic = "force-dynamic"

// Define proper type for CSRF response
interface CsrfResponse {
  csrfToken: string | null
}

// Helper function to parse cookies from a cookie string
function parseCookies(cookieString: string) {
  const cookies: Record<string, string> = {}
  if (!cookieString) return cookies

  cookieString.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=")
    if (name) cookies[name] = rest.join("=") || ""
  })
  return cookies
}

// Custom CSRF token handler to prevent request body consumption issues
export async function GET(req: Request) {
  const requestId = req.headers.get("x-request-id") || "unknown"

  try {
    const secret = process.env.NEXTAUTH_SECRET

    // Extract cookies from the request headers
    const cookieString = req.headers.get("cookie") || ""
    const cookies = parseCookies(cookieString)

    // Create a compatible request object for getToken
    const compatReq = {
      headers: Object.fromEntries(req.headers.entries()),
      cookies,
    }

    // Get the token from the request cookies
    const token = await getToken({ req: compatReq as any, secret })

    if (!token) {
      console.log(`No CSRF token found for request: ${requestId}`)
    } else {
      console.log(`CSRF token retrieved for request: ${requestId}`)
    }

    // Return CSRF token with explicit headers for better client compatibility
    return new NextResponse(
      JSON.stringify({
        csrfToken: token?.csrfToken || null,
      } as CsrfResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  } catch (error) {
    console.error(`CSRF Error for request: ${requestId}:`, error)
    // Always return status 200 for better client compatibility
    return new NextResponse(
      JSON.stringify({
        csrfToken: null,
      } as CsrfResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  }
}

export async function POST(req: Request) {
  const requestId = req.headers.get("x-request-id") || "unknown"

  try {
    // Use our safe handler for the request body
    const body = await handleCsrf(req)
    console.log(`CSRF POST request processed: ${requestId}`)

    // Return response with explicit JSON formatting and headers
    return new NextResponse(
      JSON.stringify({
        csrfToken: body?.csrfToken || null,
      } as CsrfResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  } catch (error) {
    console.error(`CSRF POST Error for request: ${requestId}:`, error)
    // Always return status 200 for better client compatibility
    return new NextResponse(
      JSON.stringify({
        csrfToken: null,
      } as CsrfResponse),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  }
}
