/**
 * In-memory rate limiter for API routes
 * Tracks requests per user within time windows
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (userId, IP, etc)
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request allowed, false if rate limited
   */
  isAllowed(key: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    // New key or window expired
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs })
      return true
    }

    // Check limit
    if (entry.count < limit) {
      entry.count++
      return true
    }

    return false
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, limit: number = 10): number {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      return limit
    }

    return Math.max(0, limit - entry.count)
  }

  /**
   * Get reset time in seconds
   */
  getResetTime(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0
    return Math.ceil((entry.resetAt - Date.now()) / 1000)
  }

  /**
   * Cleanup expired entries
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy limiter (cleanup interval)
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    this.store.clear()
  }
}

// Global instance
let limiter: RateLimiter

export function getRateLimiter(): RateLimiter {
  if (!limiter) {
    limiter = new RateLimiter()
  }
  return limiter
}

/**
 * Middleware helper for API routes
 * Returns error response if rate limited
 */
export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000,
) {
  const limiter = getRateLimiter()
  const allowed = limiter.isAllowed(key, limit, windowMs)
  const remaining = limiter.getRemaining(key, limit)
  const resetTime = limiter.getResetTime(key)

  return {
    allowed,
    remaining,
    resetTime,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
    },
  }
}
