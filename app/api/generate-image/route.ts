import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import { validateImageGenerationInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

// Rate limit for image generation: 12 panels max + retries
const RATE_LIMIT = 30
const RATE_WINDOW = 5 * 60 * 1000
const RATE_KEY_PREFIX = 'gen-img:' // Separate rate limit bucket from other endpoints

// Comic-style Flux model on Replicate - produces consistent comic book art
const COMIC_FLUX_MODEL = 'genericdeag/comic-style:b02e16758db6ee6d8ff6f75cb5cfb73119cecff157439a87f0bd598d72525599'

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use prefixed key to separate rate limits from other endpoints
    const { allowed, remaining, resetTime, abuse, headers } = checkRateLimit(
      `${RATE_KEY_PREFIX}${userId}`,
      RATE_LIMIT,
      RATE_WINDOW,
    )

    if (abuse.blocked) {
      return NextResponse.json(
        {
          error: 'Temporarily blocked due to suspicious activity. Please wait before trying again.',
          blocked: true,
          resetTime,
        },
        { status: 429, headers },
      )
    }

    if (!allowed) {
      return NextResponse.json(
        {
          error: `Rate limited. Try again in ${resetTime} seconds.`,
          remaining,
          resetTime,
          ...(abuse.warning && { warning: 'Unusual activity detected. Slow down to avoid temporary block.' }),
        },
        { status: 429, headers },
      )
    }

    const body = await req.json()
    const validation = validateImageGenerationInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400, headers },
      )
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN

    if (!replicateToken) {
      console.error('❌ Replicate API token not configured')
      return NextResponse.json(
        { error: 'Image generation service not configured. Set REPLICATE_API_TOKEN.' },
        { status: 500, headers },
      )
    }

    const { prompt, seed, panel_type } = validation.data as { prompt: string; seed?: number; panel_type?: string }

    // Comic style suffix - emphasizes bold outlines and comic book aesthetics
    const comicStyleSuffix = "comic book panel art, bold black ink outlines, cel shaded coloring, dramatic shadows, slight halftone texture, graphic novel illustration, professional sequential art"

    // Adjust style based on panel type for variety
    const panelTypeStyle = panel_type === 'establishing' ? ', wide cinematic shot, epic scale'
      : panel_type === 'emotional' ? ', intimate close-up, expressive lighting'
      : panel_type === 'climax' ? ', dramatic angle, high contrast, intense action'
      : panel_type === 'reaction' ? ', tight framing, focus on expression'
      : ', dynamic composition'

    // Enhance prompt for comic book style - Flux model responds well to descriptive prompts
    const enhancedPrompt = `${prompt}, ${comicStyleSuffix}${panelTypeStyle}`

    // Create prediction with Flux comic-style model
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: COMIC_FLUX_MODEL.split(':')[1],
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: '1:1',
          output_format: 'png',
          output_quality: 90,
          // Flux uses seed for consistency
          seed: seed !== undefined ? Math.floor(seed) : Math.floor(Math.random() * 2147483647),
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('[Flux Comic] Replicate create error:', createResponse.status, errorText)
      // Return specific error for debugging
      return NextResponse.json(
        { error: `Image service error: ${createResponse.status}`, details: errorText },
        { status: createResponse.status === 401 ? 401 : 500, headers }
      )
    }

    let prediction: ReplicatePrediction = await createResponse.json()

    // Poll for completion if not using Prefer: wait or if still processing
    let attempts = 0
    const maxAttempts = 120 // 2 minutes max

    while (prediction.status !== 'succeeded' && prediction.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        }
      })

      if (!pollResponse.ok) {
        throw new Error(`Poll failed: ${pollResponse.status}`)
      }

      prediction = await pollResponse.json()
      attempts++
    }

    if (prediction.status === 'failed') {
      console.error('[Flux Comic] Generation failed:', prediction.error)
      throw new Error(prediction.error || 'Image generation failed')
    }

    if (prediction.status !== 'succeeded' || !prediction.output?.[0]) {
      throw new Error('Generation timed out or no output')
    }

    const imageUrl = prediction.output[0]

    // Fetch the image and convert to base64 for consistent handling
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch generated image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const dataUri = `data:${contentType};base64,${base64Image}`

    return NextResponse.json({
      image: dataUri,
      metadata: {
        model: 'Flux-Comic',
        prediction_id: prediction.id,
      }
    }, { headers })

  } catch (error) {
    console.error('❌ Image generation error:', error)
    captureException(error, { route: '/api/generate-image' })

    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined

    if (status === 429) {
      return NextResponse.json(
        { error: 'Rate limit reached. Please try again shortly.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 },
    )
  }
}
