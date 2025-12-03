/**
 * In-memory rate limiter for API routes
 * Tracks requests per user within time windows
 * Includes abuse detection for suspicious patterns
 */

interface RateLimitEntry {
  count: number
  resetAt: number
  // Abuse detection tracking
  timestamps: number[] // Recent request timestamps for pattern analysis
  abuseScore: number // Accumulated abuse score
  blocked: boolean // Temporary block flag
  blockedUntil: number // When block expires
}

interface AbusePattern {
  name: string
  detect: (timestamps: number[]) => boolean
  score: number // How much to increment abuse score
}

// Abuse patterns to detect
const ABUSE_PATTERNS: AbusePattern[] = [
  {
    name: 'rapid-fire',
    // More than 5 requests within 2 seconds
    detect: (timestamps) => {
      if (timestamps.length < 5) return false
      const recent = timestamps.slice(-5)
      return (recent[4] - recent[0]) < 2000
    },
    score: 10,
  },
  {
    name: 'burst',
    // More than 20 requests within 30 seconds
    detect: (timestamps) => {
      if (timestamps.length < 20) return false
      const cutoff = Date.now() - 30000
      const recentCount = timestamps.filter(t => t > cutoff).length
      return recentCount >= 20
    },
    score: 15,
  },
  {
    name: 'sustained-abuse',
    // Consistent high rate for over a minute
    detect: (timestamps) => {
      if (timestamps.length < 30) return false
      const oneMinAgo = Date.now() - 60000
      const recentCount = timestamps.filter(t => t > oneMinAgo).length
      return recentCount >= 30
    },
    score: 25,
  },
]

// Abuse score thresholds
const ABUSE_WARNING_THRESHOLD = 20
const ABUSE_BLOCK_THRESHOLD = 50
const ABUSE_BLOCK_DURATION = 5 * 60 * 1000 // 5 minutes
const ABUSE_SCORE_DECAY_INTERVAL = 60 * 1000 // Decay score every minute
const MAX_TIMESTAMPS_TRACKED = 100

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout
  private decayInterval: NodeJS.Timeout

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
    // Decay abuse scores every minute
    this.decayInterval = setInterval(() => this.decayAbuseScores(), ABUSE_SCORE_DECAY_INTERVAL)
  }

  private getOrCreateEntry(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now()
    let entry = this.store.get(key)

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
        timestamps: [],
        abuseScore: entry?.abuseScore || 0, // Preserve abuse score
        blocked: entry?.blocked || false,
        blockedUntil: entry?.blockedUntil || 0,
      }
      this.store.set(key, entry)
    }

    return entry
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (userId, IP, etc)
   * @param limit - Max requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and abuse info
   */
  isAllowed(key: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = this.getOrCreateEntry(key, windowMs)

    // Check if user is blocked
    if (entry.blocked && now < entry.blockedUntil) {
      return false
    } else if (entry.blocked && now >= entry.blockedUntil) {
      // Unblock if time has passed
      entry.blocked = false
    }

    // Track timestamp for pattern analysis
    entry.timestamps.push(now)
    if (entry.timestamps.length > MAX_TIMESTAMPS_TRACKED) {
      entry.timestamps.shift()
    }

    // Check for abuse patterns
    for (const pattern of ABUSE_PATTERNS) {
      if (pattern.detect(entry.timestamps)) {
        entry.abuseScore += pattern.score
        console.warn(`[RateLimiter] Abuse pattern detected: ${pattern.name} for key: ${key}, score: ${entry.abuseScore}`)

        // Block if threshold exceeded
        if (entry.abuseScore >= ABUSE_BLOCK_THRESHOLD) {
          entry.blocked = true
          entry.blockedUntil = now + ABUSE_BLOCK_DURATION
          console.warn(`[RateLimiter] User blocked for abuse: ${key}, until: ${new Date(entry.blockedUntil).toISOString()}`)
          return false
        }
      }
    }

    // Normal rate limit check
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

    // If blocked, return block expiry
    if (entry.blocked) {
      return Math.ceil((entry.blockedUntil - Date.now()) / 1000)
    }

    return Math.ceil((entry.resetAt - Date.now()) / 1000)
  }

  /**
   * Get abuse status for a key
   */
  getAbuseStatus(key: string): { score: number; blocked: boolean; warning: boolean } {
    const entry = this.store.get(key)
    if (!entry) return { score: 0, blocked: false, warning: false }

    return {
      score: entry.abuseScore,
      blocked: entry.blocked && Date.now() < entry.blockedUntil,
      warning: entry.abuseScore >= ABUSE_WARNING_THRESHOLD,
    }
  }

  /**
   * Decay abuse scores over time
   */
  private decayAbuseScores() {
    for (const entry of this.store.values()) {
      if (entry.abuseScore > 0) {
        entry.abuseScore = Math.max(0, entry.abuseScore - 5)
      }
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      // Keep entries with high abuse scores around longer
      if (now > entry.resetAt && entry.abuseScore < ABUSE_WARNING_THRESHOLD) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Destroy limiter (cleanup interval)
   */
  destroy() {
    clearInterval(this.cleanupInterval)
    clearInterval(this.decayInterval)
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
 * Includes abuse detection status
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
  const abuseStatus = limiter.getAbuseStatus(key)

  return {
    allowed,
    remaining,
    resetTime,
    abuse: abuseStatus,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
      ...(abuseStatus.warning && { 'X-Abuse-Warning': 'true' }),
      ...(abuseStatus.blocked && { 'X-Abuse-Blocked': 'true' }),
    },
  }
}

/**
 * Create a rate-limited wrapper for Supabase operations
 * Use this for client-side rate limiting
 */
export function createClientRateLimiter() {
  const timestamps: number[] = []
  const WINDOW = 60000 // 1 minute
  const LIMIT = 30 // 30 operations per minute

  return {
    canProceed(): boolean {
      const now = Date.now()
      // Remove old timestamps
      while (timestamps.length && timestamps[0] < now - WINDOW) {
        timestamps.shift()
      }

      if (timestamps.length >= LIMIT) {
        return false
      }

      timestamps.push(now)
      return true
    },

    getWaitTime(): number {
      if (timestamps.length < LIMIT) return 0
      const oldestInWindow = timestamps[0]
      return Math.max(0, oldestInWindow + WINDOW - Date.now())
    },
  }
}
