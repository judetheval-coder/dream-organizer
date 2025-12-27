import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limiter'

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

    const rate = checkRateLimit(userId, RATE_LIMIT, RATE_WINDOW)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rate.resetTime}s.` },
        { status: 429, headers: rate.headers },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      // Fallback to simple breakdown if no OpenAI key
      const body = await req.json()
      const { dreamText, maxPanels = 8 } = body
      return NextResponse.json({
        scenes: simpleFallbackBreakdown(dreamText, maxPanels)
      }, { headers: rate.headers })
    }

    const body = await req.json()
    const { dreamText, maxPanels = 8 } = body

    if (!dreamText || typeof dreamText !== 'string') {
      return NextResponse.json(
        { error: 'dreamText is required' },
        { status: 400, headers: rate.headers },
      )
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a comic book storyboard artist. Your job is to break down dream narratives into vivid, cinematic comic panel descriptions.

For each panel, describe:
1. The SETTING (where - be specific about environment, lighting, colors)
2. The ACTION (what's happening - dynamic poses, movement)
3. Any KEY ELEMENTS (characters, objects, surreal details)
4. The MOOD (emotional tone, atmosphere)

Guidelines:
- Each panel should be a single, capturable moment
- Use vivid, visual language that an AI image generator can interpret
- Include surreal/dreamlike elements that make dreams special
- For characters, describe their appearance, pose, and expression
- For dialogue, indicate it should appear in a speech bubble
- Progress the story logically from panel to panel
- Include establishing shots, close-ups, and action shots for variety

Output format: Return a JSON array of panel descriptions. Each description should be 2-3 sentences of pure visual description.

Example output:
["Wide shot of an empty school parking lot at dusk, neon carnival lights glowing in the distance, ferris wheel silhouette against purple sky",
"Close-up of a giant carnival entrance shaped like a gaping mouth, neon teeth flickering, 'WELCOME' sign buzzing overhead",
"A fox in a burgundy velvet suit tips his top hat, speech bubble saying 'Welcome, dreamer', carnival games blurred in background"]`
        },
        {
          role: "user",
          content: `Break this dream into ${maxPanels} comic panels. Extract the key visual moments and make each panel description vivid and specific:

"${dreamText}"

Return ONLY a JSON array of strings, no other text.`
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from GPT");
    }

    // Parse the JSON array from the response
    let scenes: string[]
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON array found")
      }
    } catch {
      // If parsing fails, split by newlines or use fallback
      console.warn('[breakdown-dream] Failed to parse GPT response, using fallback')
      scenes = simpleFallbackBreakdown(dreamText, maxPanels)
    }

    // Ensure we have the right number of scenes
    if (scenes.length > maxPanels) {
      scenes = scenes.slice(0, maxPanels)
    }

    return NextResponse.json({ scenes }, { headers: rate.headers });
  } catch (error) {
    console.error("❌ Dream breakdown error:", error);
    const message = error instanceof Error ? error.message : 'Failed to break down dream'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// Simple fallback that splits dream into scenes without GPT
function simpleFallbackBreakdown(dreamText: string, maxPanels: number): string[] {
  const sentences = dreamText.match(/[^.!?]+[.!?]+/g) || [dreamText]
  const scenes: string[] = []

  // Try to group sentences into logical scenes
  const perPanel = Math.ceil(sentences.length / maxPanels)

  for (let i = 0; i < maxPanels && i * perPanel < sentences.length; i++) {
    const start = i * perPanel
    const end = Math.min(start + perPanel, sentences.length)
    const chunk = sentences.slice(start, end).join(' ').trim()
    if (chunk) {
      // Add some visual enhancement to the raw text
      scenes.push(`Comic panel showing: ${chunk}`)
    }
  }

  // Ensure minimum panels
  while (scenes.length < Math.min(4, maxPanels)) {
    scenes.push(scenes[scenes.length - 1] || `Dream scene: ${dreamText.slice(0, 200)}`)
  }

  return scenes
}
