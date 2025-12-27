import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

const RATE_LIMIT = 10
const RATE_WINDOW = 5 * 60 * 1000

// SDXL model on Replicate
const SDXL_MODEL = 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc'

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string[]
  error?: string
}

interface ComicPageRequest {
  scenes: string[]
  panelCount: 2 | 3 | 4
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
        },
        { status: 429, headers },
      )
    }

    const body: ComicPageRequest = await req.json()
    const { scenes, panelCount } = body

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: scenes array required' },
        { status: 400, headers },
      )
    }

    if (scenes.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 scenes per comic page' },
        { status: 400, headers },
      )
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN

    if (!replicateToken) {
      console.error('❌ Replicate API token not configured')
      return NextResponse.json(
        { error: 'Image generation service not configured.' },
        { status: 500, headers },
      )
    }

    // Build the comic page prompt - focused on clean panel layout with white borders
    const layoutDescription = getLayoutDescription(panelCount || scenes.length as 2 | 3 | 4)

    const sceneDescriptions = scenes
      .map((scene, i) => `Panel ${i + 1}: ${scene}`)
      .join('\n')

    const comicPagePrompt = `Comic book page, ${layoutDescription}, white borders between panels, bold ink outlines, vibrant colors, dynamic action poses, professional illustration:

${sceneDescriptions}

Single cohesive page with white gutters separating each panel. Consistent art style throughout all panels.`

    const negativePrompt = 'realistic photo, 3d render, watermark, text, speech bubbles, dialogue, words, letters, blurry, low quality, distorted, deformed, photograph, cropped, worst quality, low resolution, jpeg artifacts, separate images, no borders, borderless'

    // Use a taller aspect ratio for comic pages (portrait orientation like real comics)
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: SDXL_MODEL.split(':')[1],
        input: {
          prompt: comicPagePrompt,
          negative_prompt: negativePrompt,
          width: 832,  // Portrait orientation for comic page
          height: 1216,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 35, // Slightly more steps for better quality
          guidance_scale: 8.5, // Higher guidance for more prompt adherence
          refine: 'expert_ensemble_refiner',
          high_noise_frac: 0.8,
        }
      })
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('[Comic Page] Replicate create error:', createResponse.status, errorText)
      throw new Error(`Replicate API error: ${createResponse.status}`)
    }

    let prediction: ReplicatePrediction = await createResponse.json()

    // Poll for completion
    let attempts = 0
    const maxAttempts = 150 // 2.5 minutes max (comic pages take longer)

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
      console.error('[Comic Page] Generation failed:', prediction.error)
      throw new Error(prediction.error || 'Comic page generation failed')
    }

    if (prediction.status !== 'succeeded' || !prediction.output?.[0]) {
      throw new Error('Generation timed out or no output')
    }

    const imageUrl = prediction.output[0]

    // Fetch the image and convert to base64
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
        panelCount: scenes.length,
        style: 'marvel-comic'
      }
    }, { headers })

  } catch (error) {
    console.error('❌ Comic page generation error:', error)
    captureException(error, { route: '/api/generate-comic-page' })

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
      { error: error instanceof Error ? error.message : 'Failed to generate comic page' },
      { status: 500 },
    )
  }
}

function getLayoutDescription(panelCount: 2 | 3 | 4): string {
  switch (panelCount) {
    case 2:
      return 'two panels stacked vertically, top panel and bottom panel'
    case 3:
      return 'three panel layout with one large panel on top and two smaller panels on bottom'
    case 4:
      return 'four panel grid layout, 2x2 arrangement with equal sized panels'
    default:
      return 'four panel grid layout, 2x2 arrangement'
  }
}
