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
          content: `You are an expert comic artist specializing in graphic novel illustration, optimizing prompts for Stable Diffusion XL.

Create concise, visually-focused prompts that describe:
1. The main subject and action (WHO is doing WHAT)
2. The setting/environment (WHERE)
3. Lighting and atmosphere (HOW it looks)
4. Camera angle/framing (close-up, wide shot, etc.)

Keep prompts under 150 words. Focus on concrete visual elements only - no abstract concepts.
Use descriptive adjectives: dramatic, ethereal, mysterious, vibrant, dark, glowing, etc.
Include artistic style cues: bold ink lines, cel-shaded, watercolor wash, noir shadows, etc.

DO NOT include: "Create a...", "illustration of...", technical terms like "8k", "trending on artstation", or quality modifiers - these are added automatically.`
        },
        {
          role: "user",
          content: `Transform this dream scene into a visual prompt for a comic panel:
"${description}"
${style ? `Art style preference: ${style}` : ''}
${mood ? `Mood/Atmosphere: ${mood}` : ''}

Output only the visual description, no preamble.`
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
