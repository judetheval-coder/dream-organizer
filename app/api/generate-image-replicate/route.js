// Replicate API Integration for Image Generation
// Using Stable Diffusion 1.5 for affordable, quality comic book illustrations

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN

    if (!replicateToken || replicateToken === 'YOUR_REPLICATE_TOKEN_HERE') {
      return NextResponse.json(
        { error: 'REPLICATE_API_TOKEN not configured. Get yours at https://replicate.com/account/api-tokens' },
        { status: 500 }
      )
    }

    console.log(`[API] Generating image with Replicate for: "${prompt.substring(0, 50)}..."`)

    // Enhance prompt for comic style
    const enhancedPrompt = `${prompt}, comic book illustration, graphic novel style, vibrant colors, bold lines, professional art, highly detailed`

    const startTime = Date.now()

    // Create prediction with SD 1.5 (much cheaper than SDXL)
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9cb3369f',
        input: {
          prompt: enhancedPrompt,
          negative_prompt: 'blurry, ugly, distorted, low quality, photograph, realistic photo, 3d render, watermark, text, cropped',
          width: 512,
          height: 768,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Replicate error:', errorText)
      return NextResponse.json(
        { error: `Replicate API error: ${response.status}`, details: errorText },
        { status: 500 }
      )
    }

    const prediction = await response.json()
    console.log('[API] Prediction created:', prediction.id)

    // Poll for completion
    let result = prediction
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max wait

    while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateToken}`,
        }
      })

      if (!pollResponse.ok) {
        throw new Error(`Poll failed: ${pollResponse.status}`)
      }

      result = await pollResponse.json()
      attempts++
      
      if (result.status === 'processing' || result.status === 'starting') {
        console.log(`[API] Generation progress: ${attempts}s elapsed...`)
      }
    }

    const elapsed = Date.now() - startTime
    console.log(`[API] Generation completed in ${elapsed}ms with status: ${result.status}`)

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: 'Image generation failed', details: result.error },
        { status: 500 }
      )
    }

    if (result.status !== 'succeeded' || !result.output || !result.output[0]) {
      return NextResponse.json(
        { error: 'Generation timed out or no output' },
        { status: 500 }
      )
    }

    // Get the image URL from output
    const imageUrl = result.output[0]

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataUri = `data:image/png;base64,${base64Image}`

    return NextResponse.json({ 
      image: dataUri,
      metadata: {
        elapsed_ms: elapsed,
        prediction_id: prediction.id,
        model: 'SD 1.5',
        cost: '~$0.001 per image'
      }
    })

  } catch (error) {
    console.error('[API] Generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
