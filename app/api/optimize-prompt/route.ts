import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { validateOptimizePromptInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

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

    const body = await req.json()
    const validation = validateOptimizePromptInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400, headers: rate.headers },
      )
    }

    const { description, style, mood } = validation.data

    console.log("🎨 Optimizing comic panel prompt...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert comic artist. Transform dream descriptions into detailed, high-quality comic panel prompts for DALL-E 3.

Create a prompt that describes a single comic panel with:
- Clear, dynamic composition
- A person or character doing something specific
- Vivid visual details (lighting, colors, texture)
- Specific comic book art style (e.g., "digital comic book art", "graphic novel style", "vibrant colors", "inked lines")
- Mention the mood explicitly

Do not use "under 150 characters". Make it descriptive (around 50-75 words) to ensure high quality. Focus only on WHAT IS VISIBLE.`
        },
        {
          role: "user",
          content: `Make a comic panel prompt:
"${description}"
${style ? `Art style: ${style}` : ''}
${mood ? `Mood/Atmosphere: ${mood}` : ''}

Output only the visual description.`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const optimized = response.choices[0]?.message?.content;

    if (!optimized) {
      throw new Error("No optimized prompt returned");
    }

    console.log("✓ Prompt ready");

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
