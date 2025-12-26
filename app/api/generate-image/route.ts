import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import { validateImageGenerationInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

const RATE_LIMIT = 10
const RATE_WINDOW = 5 * 60 * 1000

// SDXL model on Replicate - latest stable version
const SDXL_MODEL = 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc'

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

    const { allowed, remaining, resetTime, abuse, headers } = checkRateLimit(
      userId,
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

    const { prompt } = validation.data as { prompt: string }

    // Enhance prompt for SDXL comic style
    const enhancedPrompt = `${prompt}, comic book illustration style, graphic novel art, bold ink outlines, vibrant saturated colors, professional digital art, highly detailed, dynamic composition, cinematic lighting`

    const negativePrompt = 'blurry, low quality, distorted, ugly, deformed, photograph, realistic photo, 3d render, watermark, text, signature, cropped, out of frame, worst quality, low resolution, jpeg artifacts, duplicate, morbid, mutilated, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers'

    // Create prediction with SDXL
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: SDXL_MODEL.split(':')[1],
        input: {
          prompt: enhancedPrompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 30,
          guidance_scale: 7.5,
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8,
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('[SDXL] Replicate create error:', createResponse.status, errorText)
      throw new Error(`Replicate API error: ${createResponse.status}`)
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
      console.error('[SDXL] Generation failed:', prediction.error)
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
        model: 'SDXL',
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
