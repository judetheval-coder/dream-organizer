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
          content: `You are a comic book storyboard artist specializing in surrealist dream comics. Your job is to break down dream narratives into vivid, cinematic comic panel descriptions.

## OUTPUT FORMAT
Return a JSON array of objects, each with:
- "visual": The image generation prompt (NO text/signs/words - these render as gibberish)
- "overlay_text": Any text that should appear (speech bubbles, signs, titles) - will be added programmatically
- "text_position": Where the text should go ("top", "bottom", "speech-bubble", "sign")
- "panel_type": "establishing" | "action" | "emotional" | "reaction" | "climax" | "transition"

## CRITICAL RULES FOR SURREAL/IMPOSSIBLE ELEMENTS
Dreams contain impossible physics - PRESERVE THEM, don't normalize:
- Make impossible elements the PRIMARY SUBJECT, not background detail
- Use "cross-section view" or "cutaway showing" for underground/internal scenes
- Describe impossible physics matter-of-factly: "ferris wheel rotating downward INTO the earth" not "ferris wheel going underground"
- Add "surrealist, impossible geometry, MC Escher inspired, dream logic" to scenes with impossible physics
- Be visually LITERAL about surreal concepts - no metaphors

## HANDLING MULTIPLE SPECIFIC ELEMENTS
When a scene has 3+ specific unique elements (creatures, characters, objects):
- Pick the MOST visually striking element as the hero subject
- Describe it in full detail (materials, textures, mechanisms)
- Reference others as "silhouettes in background" or "blurred shapes"

## PROTAGONIST CONSISTENCY
The dreamer/protagonist should ALWAYS be shown:
- From behind (back to viewer)
- In silhouette
- Or with face obscured/in shadow
This allows viewer self-insertion and maintains consistency across panels.

## ABSTRACT CONCEPTS → VISUAL METAPHORS
Never skip emotionally significant moments. Visualize abstract concepts:
- "memories flooding in" → "translucent images swirling around character's head like moths"
- "feeling of falling" → "figure suspended in void, motion lines, floating objects frozen mid-fall"
- "time distortion" → "melting clocks, multiple ghost-exposures of same figure"
- "transformation" → "figure mid-morph, half one form half another, surreal transition"
- "emotional weight" → "heavy chains or stones attached to figure, physically manifested"

## TEXT HANDLING (CRITICAL)
NEVER include readable text in the visual prompt - AI cannot render text properly.
Instead:
- Describe signs as "glowing sign with empty face" or "blank neon marquee"
- Put the actual text in "overlay_text" field
- Speech goes in overlay_text with text_position: "speech-bubble"

## PANEL VARIETY
Include a mix of:
- Wide establishing shots (panel_type: "establishing")
- Dynamic action moments (panel_type: "action")
- Emotional close-ups (panel_type: "emotional")
- Quick reactions (panel_type: "reaction")
- Key dramatic moments (panel_type: "climax")

Example output:
[
  {"visual": "Wide shot of empty school parking lot at dusk, towering carnival emerging from the asphalt, ferris wheel half-buried rotating into the ground, cross-section view showing underground carnival tunnels, impossible geometry, dream logic", "overlay_text": null, "text_position": null, "panel_type": "establishing"},
  {"visual": "Silhouetted figure seen from behind approaching giant carnival entrance shaped like a gaping mouth, neon teeth flickering, blank glowing marquee above, surrealist architecture", "overlay_text": "MIDNIGHT CARNIVAL", "text_position": "sign", "panel_type": "action"},
  {"visual": "Close-up of an anthropomorphic fox in burgundy velvet suit, top hat tilted, one paw extended in welcome, mechanical gears visible through gaps in fur, steampunk carnival booths blurred behind, speech bubble space left empty", "overlay_text": "Welcome, dreamer. We've been waiting.", "text_position": "speech-bubble", "panel_type": "emotional"}
]`
        },
        {
          role: "user",
          content: `Break this dream into exactly ${maxPanels} comic panels. Extract EVERY key visual and emotional moment - do not skip surreal or abstract scenes, visualize them with metaphors.

Dream:
"${dreamText}"

Return ONLY a JSON array of objects with visual, overlay_text, text_position, and panel_type fields.`
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
    type SceneData = {
      visual: string
      overlay_text: string | null
      text_position: string | null
      panel_type: string
    }

    let scenes: SceneData[]
    let legacyFormat = false

    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Check if it's the new object format or legacy string format
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].visual) {
          scenes = parsed as SceneData[]
        } else if (parsed.length > 0 && typeof parsed[0] === 'string') {
          // Legacy string format - convert to new format
          legacyFormat = true
          scenes = parsed.map((s: string) => ({
            visual: s,
            overlay_text: null,
            text_position: null,
            panel_type: 'action'
          }))
        } else {
          throw new Error("Invalid JSON format")
        }
      } else {
        throw new Error("No JSON array found")
      }
    } catch {
      // If parsing fails, split by newlines or use fallback
      console.warn('[breakdown-dream] Failed to parse GPT response, using fallback')
      const fallback = simpleFallbackBreakdown(dreamText, maxPanels)
      scenes = fallback.map(s => ({
        visual: s,
        overlay_text: null,
        text_position: null,
        panel_type: 'action'
      }))
      legacyFormat = true
    }

    // Ensure we have the right number of scenes
    if (scenes.length > maxPanels) {
      scenes = scenes.slice(0, maxPanels)
    }

    // Return full scene data for the new format
    // Also include a simple string array for backward compatibility
    return NextResponse.json({
      scenes: scenes.map(s => s.visual), // Backward compatible
      sceneData: scenes, // Full structured data
      legacyFormat
    }, { headers: rate.headers });
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
