import { NextRequest, NextResponse } from 'next/server'
import { getApiUrl } from '@/lib/api-config'

export const dynamic = 'force-dynamic'

/**
 * API proxy route to forward authentication requests to the API server
 * This helps avoid CORS issues when the frontend and API are on different domains/ports
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    
    // Get API URL
    const apiUrl = getApiUrl('/auth/login')
    console.log(`Auth proxy forwarding login request to: ${apiUrl}`)
    
    // Forward the request to the API server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward CSRF token if present
        ...(request.headers.get('X-CSRF-Token') 
          ? { 'X-CSRF-Token': request.headers.get('X-CSRF-Token') } 
          : {}),
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })
    
    // Get the response data
    const data = await response.json()
    
    // If login was successful, set cookies on the Next.js side too
    if (response.ok && data.accessToken) {
      const headers = new Headers()
      
      // Copy any Set-Cookie headers from the API response
      const cookies = response.headers.getSetCookie()
      if (cookies && cookies.length > 0) {
        for (const cookie of cookies) {
          headers.append('Set-Cookie', cookie)
        }
      }
      
      // Return the response with cookies
      return NextResponse.json(data, {
        status: response.status,
        headers,
      })
    }
    
    // For errors, just pass through the response
    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Auth proxy error:', error)
    
    // Return a helpful error message
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? `Auth proxy error: ${error.message}` 
          : 'Unknown auth proxy error'
      },
      { status: 500 }
    )
  }
}
