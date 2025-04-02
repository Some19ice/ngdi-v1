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
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export function getCookieDomain(): string | undefined {
  if (process.env.NODE_ENV === "production") {
    // Use exactly what's specified in the environment variable
    return process.env.COOKIE_DOMAIN || undefined
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
  if (domain) cookie += `; Domain=${domain}`

  c.header("Set-Cookie", cookie)
}

export function clearCookie(c: Context, name: string): void {
  setCookieWithOptions(c, name, "", { maxAge: 0 })
}
