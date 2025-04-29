import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { UserRole } from "./lib/auth/constants"
import { supabaseAuthConfig } from "./lib/auth/supabase-auth.config"
import { updateSession } from "./utils/supabase/middleware"

// Helper function to check if a path matches any of the routes
function matchesRoute(path: string, routes: string[]): boolean {
  return routes.some((route) => {
    // Exact match
    if (route === path) return true
    // Path starts with route and is followed by / or end of string
    if (path.startsWith(route + "/")) return true
    // Route has a wildcard
    if (route.endsWith("*") && path.startsWith(route.slice(0, -1))) return true
    return false
  })
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Update the session with the Supabase middleware
    const response = await updateSession(request)

    // Create a new URL object from the request URL
    const url = new URL(request.url)

    // Get the session cookie
    const sessionCookie = request.cookies.get("sb-access-token")
    const session = sessionCookie ? { user: { user_metadata: {} } } : null

    // Check if this is a protected route that requires authentication
    if (
      matchesRoute(pathname, supabaseAuthConfig.routes.protected) ||
      matchesRoute(pathname, supabaseAuthConfig.routes.admin) ||
      matchesRoute(pathname, supabaseAuthConfig.routes.nodeOfficer)
    ) {
      // No session, redirect to login
      if (!session) {
        console.log(
          `Redirecting unauthenticated user from protected route: ${pathname}`
        )
        return NextResponse.redirect(
          new URL(supabaseAuthConfig.pages.signIn, request.url)
        )
      }

      // Get user role from session
      const role = session.user.user_metadata?.role || UserRole.USER

      // Check role-based access for admin routes
      if (
        matchesRoute(pathname, supabaseAuthConfig.routes.admin) &&
        role !== UserRole.ADMIN
      ) {
        console.log(`Redirecting non-admin user from admin route: ${pathname}`)
        return NextResponse.redirect(
          new URL(supabaseAuthConfig.pages.unauthorized, request.url)
        )
      }

      // Check role-based access for node officer routes
      if (
        matchesRoute(pathname, supabaseAuthConfig.routes.nodeOfficer) &&
        role !== UserRole.NODE_OFFICER &&
        role !== UserRole.ADMIN
      ) {
        console.log(`Redirecting user from node officer route: ${pathname}`)
        return NextResponse.redirect(
          new URL(supabaseAuthConfig.pages.unauthorized, request.url)
        )
      }
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (
      session &&
      (pathname === supabaseAuthConfig.pages.signIn ||
        pathname === "/login" ||
        pathname === "/register")
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return response
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, allow the request to continue
    return NextResponse.next()
  }
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
