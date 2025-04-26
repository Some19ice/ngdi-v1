import { Context } from "hono"

export interface CookieOptions {
  path: string
  httpOnly: boolean
  secure: boolean
  sameSite: "lax" | "strict" | "none"
  maxAge: number
  domain?: string
}

export const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax", // Changed from strict to lax for better compatibility
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === "production") {
    // Use cookie domain from environment variable if available
    // This improves cross-subdomain support while maintaining security
    const cookieDomain = process.env.COOKIE_DOMAIN

    // Only use domain setting when explicitly configured
    return cookieDomain || undefined
  }
  return undefined
}

export function setCookieWithOptions(
  c: Context,
  name: string,
  value: string,
  options: Partial<CookieOptions> = {}
): void {
  const finalOptions = { ...DEFAULT_COOKIE_OPTIONS, ...options }
  const domain = getCookieDomain()

  let cookie = `${name}=${value}; Path=${finalOptions.path}`
  if (finalOptions.httpOnly) cookie += "; HttpOnly"
  if (finalOptions.secure) cookie += "; Secure"
  cookie += `; SameSite=${finalOptions.sameSite}; Max-Age=${finalOptions.maxAge}`

  // Only add domain if explicitly set
  if (domain) cookie += `; Domain=${domain}`

  // Log cookie setting for debugging
  console.log(
    `Setting cookie: ${name} (SameSite=${finalOptions.sameSite}, Secure=${finalOptions.secure}, HttpOnly=${finalOptions.httpOnly})`
  )

  // Use append instead of set to allow multiple cookies with different names
  c.header("Set-Cookie", cookie, { append: true })
}

export function clearCookie(c: Context, name: string): void {
  // Set cookie with past expiration to clear it
  let cookie = `${name}=; Path=/; Max-Age=0; HttpOnly`
  if (process.env.NODE_ENV === "production") cookie += "; Secure"
  cookie += `; SameSite=${DEFAULT_COOKIE_OPTIONS.sameSite}`

  const domain = getCookieDomain()
  if (domain) cookie += `; Domain=${domain}`

  // Log cookie clearing for debugging
  console.log(`Clearing cookie: ${name}`)

  // Use append instead of set to allow clearing multiple cookies
  c.header("Set-Cookie", cookie, { append: true })
}
