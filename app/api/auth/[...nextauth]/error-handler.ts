import { NextResponse } from "next/server"

export function handleAuthError(error: Error) {
  console.error("Auth error:", error.message)

  switch (error.message) {
    case "TooManyRequests":
      return new NextResponse(
        JSON.stringify({
          error: "Too many login attempts. Please try again later.",
          code: "TOO_MANY_REQUESTS",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

    case "InvalidCredentials":
      return new NextResponse(
        JSON.stringify({
          error: "Invalid email or password.",
          code: "INVALID_CREDENTIALS",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

    case "SessionRequired":
      return new NextResponse(
        JSON.stringify({
          error: "Authentication required.",
          code: "UNAUTHORIZED",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

    case "AccessDenied":
      return new NextResponse(
        JSON.stringify({
          error: "Access denied.",
          code: "FORBIDDEN",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

    case "InternalServerError":
      return new NextResponse(
        JSON.stringify({
          error: "An internal server error occurred.",
          code: "INTERNAL_SERVER_ERROR",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

    default:
      console.error("Unhandled auth error:", error)
      return new NextResponse(
        JSON.stringify({
          error: "An unexpected error occurred.",
          code: "UNKNOWN_ERROR",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
  }
}
