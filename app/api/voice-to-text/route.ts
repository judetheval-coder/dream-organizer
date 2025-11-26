export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { audioBase64 } = await request.json()

    if (!audioBase64) {
      return Response.json({ error: 'audio data required' }, { status: 400 })
    }

    // Basic rate limit by IP since this route is unauthenticated
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '0.0.0.0'
    // lightweight in-memory limiter via globalThis cache
    const key = `voice:${ip}`
    const now = Date.now()
    const store: Map<string, { count: number; resetAt: number }> = (globalThis as any).__voiceLimiter__ || new Map()
    if (!(globalThis as any).__voiceLimiter__) (globalThis as any).__voiceLimiter__ = store
    const entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + 60_000 })
    } else if (entry.count >= 10) {
      return Response.json({ error: 'Too Many Requests' }, { status: 429 })
    } else {
      entry.count++
    }

    // Mock transcription - in production would use Whisper API or similar
    return Response.json({
      text: 'This is a mock transcription. In production, this would use speech-to-text AI.',
      success: true,
      confidence: 0.95
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    return Response.json({ error: message }, { status: 500 })
  }
}
