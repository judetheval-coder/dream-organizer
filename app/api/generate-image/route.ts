import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { validateImageGenerationInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT = 10
const RATE_WINDOW = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allowed, remaining, resetTime, abuse, headers } = checkRateLimit(
      userId,
      RATE_LIMIT,
      RATE_WINDOW,
    )

    // Check for abuse block first
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

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'Image generation service not configured' },
        { status: 500, headers },
      )
    }

    const { prompt } = validation.data as { prompt: string }

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    return NextResponse.json({ image: imageUrl }, { headers })
  } catch (error) {
    console.error('❌ Image generation error:', error)
    captureException(error, { route: '/api/generate-image' })

    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number((error as { status?: number }).status)
        : undefined

    if (status === 429) {
      return NextResponse.json(
        { error: 'OpenAI rate limit reached. Please try again shortly.' },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 },
    )
  }
}
