import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { validateEnhanceStoryInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT = 8
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
        { error: `Too many requests. Try again in ${rate.resetTime}s.` },
        { status: 429, headers: rate.headers },
      )
    }

    const body = await req.json()
    const validation = validateEnhanceStoryInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400, headers: rate.headers },
      )
    }

    const { dreamText } = validation.data

    console.log(" Enhancing dream story...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller specializing in dream narratives. Transform raw dream notes into vivid, compelling stories while preserving the original emotions and imagery. Keep the dreamy, surreal quality. Make it engaging but stay true to the user's experience. Format with proper paragraphs.`
        },
        {
          role: "user",
          content: `Transform this dream into a polished narrative:\n\n${dreamText}`
        }
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const enhanced = response.choices[0]?.message?.content;

    if (!enhanced) {
      throw new Error("No enhanced story returned");
    }

    console.log(" Story enhanced successfully");

    return NextResponse.json({ enhanced }, { headers: rate.headers });
  } catch (error) {
    console.error(" Story enhancement error:", error);
    captureException(error, { route: '/api/enhance-story' })
    const message = error instanceof Error ? error.message : 'Failed to enhance story'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
