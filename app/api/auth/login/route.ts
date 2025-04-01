import { NextRequest, NextResponse } from "next/server"

// Define API base URL
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.INTERNAL_API_URL || "https://ngdi-api.vercel.app"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Enhanced logging for production debugging
const logLevel = process.env.AUTH_LOG_LEVEL || 'info'
const logger = {
  debug: (...args: any[]) => {
    if (logLevel === 'debug') console.debug('[AUTH DEBUG]', ...args)
  },
  info: (...args: any[]) => console.info('[AUTH INFO]', ...args),
  warn: (...args: any[]) => console.warn('[AUTH WARN]', ...args),
  error: (...args: any[]) => console.error('[AUTH ERROR]', ...args),
}

export async function POST(request: NextRequest) {
  logger.info(`Environment: ${process.env.NODE_ENV}, API URL: ${API_BASE_URL}`)
  logger.debug(
    `Request headers: ${JSON.stringify(Object.fromEntries(request.headers))}`
  )

  // Record start time for performance monitoring
  const startTime = Date.now()
  
  try {
    // First, make a GET request to get a CSRF token
    logger.debug("Fetching CSRF token")
    const csrfResponse = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        "X-Request-Origin": "ngdi-frontend",
      },
    })

    // Get the CSRF token from the cookies
    const setCookieHeader = csrfResponse.headers.get("set-cookie")
    logger.debug(`CSRF health check status: ${csrfResponse.status}`)
    logger.debug(`CSRF cookies received: ${setCookieHeader ? "yes" : "no"}`)

    let csrfToken = ""
    let csrfCookieValue = ""

    if (csrfResponse.ok && setCookieHeader) {
      const csrfCookie = setCookieHeader
        .split(";")
        .find((cookie) => cookie.trim().startsWith("csrf_token="))

      if (csrfCookie) {
        csrfToken = csrfCookie.split("=")[1].split(";")[0]
        csrfCookieValue = csrfCookie
        logger.info("Successfully obtained CSRF token")
      } else {
        logger.warn("CSRF token not found in cookies")
      }
    } else {
      logger.warn(`Health check failed: ${csrfResponse.status}`)
      // Try to get response text for debugging
      try {
        const responseText = await csrfResponse.text()
        logger.debug(`Health check response: ${responseText}`)
      } catch (e) {
        logger.debug(`Could not get health check response text: ${e}`)
      }
    }

    // Forward the original request authorization headers if present
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Origin": "ngdi-frontend",
      "X-Request-ID": crypto.randomUUID(),
    }

    // Add CSRF token to headers if available
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken
    }

    // Forward the authorization header if present
    const authHeader = request.headers.get("authorization")
    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    // Forward cookies if present
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader
    }

    // Fixed API URL construction to ensure correct endpoint
    const apiUrl = `${API_BASE_URL}/api/auth/login`
    logger.info(`Forwarding to API: ${apiUrl}`)

    const requestBody = await request.json()
    logger.info(`Login attempt for user: ${requestBody.email}`)

    // Make the API request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const apiResponse = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    logger.info(`API Response status: ${apiResponse.status}`)

    // Get response details for debugging
    const responseHeaders = Object.fromEntries(apiResponse.headers)
    logger.debug(`API response headers: ${JSON.stringify(responseHeaders)}`)

    const responseData = await apiResponse.json()
    logger.debug(
      `Login response received: ${JSON.stringify({
        success: responseData.success,
        hasUser: !!responseData.user,
        hasTokens: !!(responseData.accessToken && responseData.refreshToken),
      })}`
    )

    // Create the response
    const response = NextResponse.json(responseData, {
      status: apiResponse.status,
    })

    // Forward cookies from API to client
    const responseCookies = apiResponse.headers.get("set-cookie")
    if (responseCookies) {
      logger.info("Setting cookies from API response")
      response.headers.set("set-cookie", responseCookies)
    } else if (csrfCookieValue) {
      // If no cookies in the response but we have a CSRF token, set it
      logger.info("No cookies in API response, setting CSRF cookie")
      response.headers.set("set-cookie", csrfCookieValue)
    } else {
      logger.warn("No cookies available to set in response")
    }

    // Add security headers
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Log performance metrics
    const endTime = Date.now()
    logger.info(`Login request completed in ${endTime - startTime}ms`)

    return response
  } catch (error: any) {
    logger.error(`Login error:`, error)
    
    // More detailed error reporting
    const errorDetails = {
      message: error.message || 'Unknown error',
      name: error.name,
      code: error.code,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
    }
    
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: String(error),
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
