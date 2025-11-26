import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { validateOptimizePromptInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT = 12
const RATE_WINDOW = 5 * 60 * 1000

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rate = checkRateLimit(userId, RATE_LIMIT, RATE_WINDOW)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many prompt optimizations. Try again in ${rate.resetTime}s.` },
        { status: 429, headers: rate.headers },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'Prompt optimization service not configured' },
        { status: 500, headers: rate.headers },
      )
    }

    const body = await req.json()
    const validation = validateOptimizePromptInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400, headers: rate.headers },
      )
    }

    const { description, style, mood } = validation.data

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert comic artist specializing in high-end graphic novel illustration. Transform dream descriptions into stunning, cinematic comic panel prompts.

Your prompts must follow this exact structure:
"Create a highly detailed, vibrant, and cinematic digital illustration of [scene], depicted in a modern comic book style. The artwork should feature sharp lines, intricate shading, vivid colors, and dynamic lighting that emphasizes depth and emotion. The scene should be rich in detail, with textured surfaces, expressive facial features, and a composition that captures energy and drama. Use cinematic lighting with dramatic shadows and highlights, and ensure the overall aesthetic is polished, professional, and visually striking. The style should resemble high-end comic art with a focus on clarity, contrast, and realism, suitable for a graphic novel or a high-quality illustration."

Replace [scene] with a vivid, specific description of what's happening based on the user's input.
Incorporate the mood/atmosphere into the lighting and color choices.
Focus only on WHAT IS VISIBLE - no abstract concepts.`
        },
        {
          role: "user",
          content: `Transform this dream scene into a cinematic comic panel prompt:
"${description}"
${style ? `Incorporate this art style: ${style}` : ''}
${mood ? `Mood/Atmosphere to convey: ${mood}` : ''}

Output only the complete visual description prompt.`
        }
      ],
      temperature: 0.7,
      max_tokens: 350,
    });

    const optimized = response.choices[0]?.message?.content;

    if (!optimized) {
      throw new Error("No optimized prompt returned");
    }

    return NextResponse.json({ optimized }, { headers: rate.headers });
  } catch (error) {
    console.error("❌ Prompt error:", error);
    captureException(error, { route: '/api/optimize-prompt' })
    const message = error instanceof Error ? error.message : 'Failed to optimize prompt'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
