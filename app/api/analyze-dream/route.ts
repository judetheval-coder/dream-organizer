import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { validateDreamAnalysisInput } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rate-limiter'
import { captureException } from '@/lib/sentry'

export const runtime = 'nodejs'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RATE_LIMIT = 5
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
        { error: `Too many analyses. Try again in ${rate.resetTime}s.` },
        { status: 429, headers: rate.headers },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not configured')
      return NextResponse.json(
        { error: 'Analysis service not configured' },
        { status: 500, headers: rate.headers },
      )
    }

    const body = await req.json()
    const validation = validateDreamAnalysisInput(body)

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400, headers: rate.headers },
      )
    }

    const { dreams, analyzeCharacters } = validation.data

    const dreamTexts = dreams
      .map((dream, index) => {
        const dateLabel = dream.date || 'undated'
        const content = dream.description || dream.text || 'No description provided'
        return `Dream ${index + 1} (${dateLabel}): ${content}`
      })
      .join('\n\n')

    const systemPrompt = analyzeCharacters 
      ? `You are a dream analyst specializing in character and symbol recognition. Analyze the dreams to identify:
1. Recurring characters (people, animals, entities) with their traits
2. Character relationships and roles
3. Common symbols and their meanings
4. Psychological themes
Provide actionable insights for artistic consistency in comic creation.`
      : `You are a Jungian dream analyst. Analyze the dreams to identify:
1. Recurring symbols and archetypes
2. Common themes and patterns
3. Emotional undertones
4. Psychological insights
5. Potential meanings
Be insightful but accessible. Focus on patterns across multiple dreams.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: analyzeCharacters 
            ? `Identify recurring characters and symbols for artistic consistency:\n\n${dreamTexts}`
            : `Analyze these dreams for patterns and insights:\n\n${dreamTexts}`
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    const analysis = response.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error("No analysis returned");
    }

    return NextResponse.json({ analysis }, { headers: rate.headers });
  } catch (error) {
    console.error(" Dream analysis error:", error);
    captureException(error, { route: '/api/analyze-dream' })
    const message = error instanceof Error ? error.message : 'Failed to analyze dreams'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

