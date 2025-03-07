import { Context, Next } from "hono"
import { RateLimiter } from "limiter"

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
})

const authLimiter = new RateLimiter({
  tokensPerInterval: 20,
  interval: "minute",
})

export async function rateLimiter(c: Context, next: Next) {
  const remainingRequests = await limiter.removeTokens(1)

  if (remainingRequests < 0) {
    return c.json({ error: "Too many requests" }, 429)
  }

  await next()
}

export async function authRateLimiter(c: Context, next: Next) {
  const remainingRequests = await authLimiter.removeTokens(1)

  if (remainingRequests < 0) {
    return c.json({ error: "Too many requests" }, 429)
  }

  await next()
}
