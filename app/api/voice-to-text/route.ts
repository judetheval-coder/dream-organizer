export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null
    const audioBase64 = formData.get('audioBase64') as string | null

    if (!audioFile && !audioBase64) {
      return Response.json({ error: 'audio data required' }, { status: 400 })
    }

    // Basic rate limit by IP since this route is unauthenticated
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || '0.0.0.0'
    const key = `voice:${ip}`
    const now = Date.now()
    type VoiceLimiterEntry = { count: number; resetAt: number }
    const g = globalThis as unknown as { __voiceLimiter__?: Map<string, VoiceLimiterEntry> }
    const store: Map<string, VoiceLimiterEntry> = g.__voiceLimiter__ || new Map()
    if (!g.__voiceLimiter__) g.__voiceLimiter__ = store
    const entry = store.get(key)
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + 60_000 })
    } else if (entry.count >= 10) {
      return Response.json({ error: 'Too Many Requests' }, { status: 429 })
    } else {
      entry.count++
    }

    // Check if OpenAI API key is available
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      return Response.json({ 
        error: 'Voice transcription not configured',
        text: '',
        success: false 
      }, { status: 503 })
    }

    // Prepare audio data for OpenAI Whisper API
    let audioBlob: Blob

    if (audioFile) {
      audioBlob = audioFile
    } else if (audioBase64) {
      // Convert base64 to blob
      const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '')
      const binaryData = Buffer.from(base64Data, 'base64')
      audioBlob = new Blob([binaryData], { type: 'audio/webm' })
    } else {
      return Response.json({ error: 'Invalid audio data' }, { status: 400 })
    }

    // Create form data for OpenAI API
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioBlob, 'audio.webm')
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('language', 'en')

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Whisper API error:', errorData)
      return Response.json({ 
        error: 'Transcription failed',
        text: '',
        success: false 
      }, { status: 500 })
    }

    const result = await response.json()

    return Response.json({
      text: result.text || '',
      success: true,
      confidence: 0.95
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error'
    console.error('Voice-to-text error:', message)
    return Response.json({ error: message, text: '', success: false }, { status: 500 })
  }
}
