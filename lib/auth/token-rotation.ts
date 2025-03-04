import { redis } from "@/lib/redis"

interface RefreshTokenRotationResult {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface TokenSet {
  accessToken: string
  refreshToken: string
  accessTokenExpires: number
}

export async function rotateRefreshToken(
  oldRefreshToken: string
): Promise<RefreshTokenRotationResult> {
  try {
    // Check if refresh token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${oldRefreshToken}`)
    if (isBlacklisted) {
      throw new Error("Refresh token has been revoked")
    }

    // Get new tokens from OAuth provider
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: oldRefreshToken }),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const tokens = await response.json()

    // Blacklist the old refresh token
    await redis.setex(
      `blacklist:${oldRefreshToken}`,
      60 * 60 * 24 * 90, // 90 days
      "revoked"
    )

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    }
  } catch (error) {
    console.error("Token rotation error:", error)
    throw error
  }
}

export async function storeTokenSet(
  userId: string,
  tokens: TokenSet
): Promise<void> {
  const key = `user:${userId}:tokens`
  const record: Record<string, string | number> = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    accessTokenExpires: tokens.accessTokenExpires,
  }
  await redis.hset(key, record)
  await redis.expire(key, 60 * 60 * 24 * 90) // 90 days
}

export async function getStoredTokenSet(
  userId: string
): Promise<TokenSet | null> {
  const key = `user:${userId}:tokens`
  const tokens = await redis.hgetall(key)
  if (!tokens) return null

  return {
    accessToken: tokens.accessToken as string,
    refreshToken: tokens.refreshToken as string,
    accessTokenExpires: Number(tokens.accessTokenExpires),
  }
}

export async function invalidateTokenSet(userId: string): Promise<void> {
  const key = `user:${userId}:tokens`
  await redis.del(key)
}
