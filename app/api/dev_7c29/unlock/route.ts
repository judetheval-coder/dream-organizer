import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { devRoutesEnabled, disallowedDevResponse } from '@/lib/dev-utils'

console.log('[dev-unlock] DEV_STEALTH_SECRET:', process.env.DEV_STEALTH_SECRET)
const DEV_SECRET = process.env.DEV_STEALTH_SECRET

export async function GET() {
  if (!devRoutesEnabled()) return disallowedDevResponse()
  const cookieStore = await cookies()
  const unlocked = cookieStore.get('dev_unlocked')?.value === 'true'
  return NextResponse.json({ unlocked })
}

export async function POST(request: Request) {
  console.log('[dev-unlock] POST request received')
  if (!devRoutesEnabled()) return disallowedDevResponse()
  const { secret } = await request.json()
  // Quick rate-limiting to prevent brute-force attempts (dev-only precaution)
  type DevUnlockAttempts = { count: number; resetAt: number }
  const g = globalThis as unknown as { __devUnlockAttempts__?: DevUnlockAttempts }
  const store = g.__devUnlockAttempts__ || { count: 0, resetAt: 0 }
  if (!g.__devUnlockAttempts__) g.__devUnlockAttempts__ = store
  const now = Date.now()
  if (store.resetAt < now) {
    store.count = 0
    store.resetAt = now + 60_000 // 1 minute
  }
  store.count += 1
  if (store.count > 20) {
    return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  }

  if (secret === DEV_SECRET) {
    const response = NextResponse.json({ unlocked: true })
    response.cookies.set('dev_unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })
    console.info(`[dev-unlock] success - unlocked by secret (timestamp: ${new Date().toISOString()})`)
    return response
  }
  console.warn(`[dev-unlock] failed attempt (timestamp: ${new Date().toISOString()})`)
  return NextResponse.json({ unlocked: false }, { status: 401 })
}