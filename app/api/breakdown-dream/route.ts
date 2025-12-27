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
          content: `You are a comic book storyboard artist specializing in surrealist dream comics. Your job is to break down dream narratives into vivid, cinematic comic panel descriptions WITH narrative text overlays.

## OUTPUT FORMAT
Return a JSON array of objects, each with:
- "visual": The image generation prompt (NO text/signs/words - AI cannot render text)
- "caption": Narrative caption text - 1-2 sentences from dream, max 30 words. Use second person ("you"). Goes in a journal-style box.
- "caption_position": "top-left" | "bottom-left" | "top-right" | "bottom-center"
- "dialogue": Speech bubble text if someone speaks, max 15 words. null if no speech.
- "sfx": Sound effect text like "BEEP" or "CRASH". null if no distinct sound.
- "panel_type": "establishing" | "action" | "emotional" | "reaction" | "climax" | "transition"

## NARRATIVE CAPTION RULES (CRITICAL)
Every panel SHOULD have a caption to tell the story. Captions are the reader's guide through the dream.
- Pull directly from the dream text, lightly edited for flow
- Prioritize sensory details and emotional beats
- Use second person: "You feel...", "The floor shifts...", "Your hands..."
- First panel: Set the scene and mood
- Last panel: Emotional resonance or lingering feeling
- If the image clearly shows something, the caption can hint at what ISN'T visible (internal feelings, sounds, smells)

Caption positioning:
- "top-left": Default for most panels
- "bottom-left": For action panels where top may be busy
- "top-right": When something important is on the left
- "bottom-center": For dramatic final panels

## DIALOGUE RULES
Only add dialogue if someone SPEAKS in the dream:
- Keep short: max 15 words
- Include thought trails: "Wait... is that...?"
- Echoes or unclear speech: "...calling your name..."

## SOUND EFFECTS (SFX)
Only for distinct, visceral sounds mentioned in the dream:
- Alarms: "BEEP BEEP", "RING RING"
- Impacts: "CRASH", "THUD"
- Mechanical: "CLICK", "WHIRR"
- Keep uppercase, 1-3 words max

## CRITICAL RULES FOR SURREAL/IMPOSSIBLE ELEMENTS
Dreams contain impossible physics - PRESERVE THEM:
- Make impossible elements the PRIMARY SUBJECT
- Use "cross-section view" for underground scenes
- Add "surrealist, impossible geometry, dream logic" to impossible scenes

## PROTAGONIST CONSISTENCY
The dreamer should ALWAYS be shown:
- From behind (back to viewer)
- In silhouette
- Or with face obscured
This allows viewer self-insertion.

## TEXT IN IMAGES (CRITICAL)
NEVER include readable text in the visual prompt - AI cannot render it.
- Describe signs as "blank neon marquee" or "glowing sign with empty face"

Example output:
[
  {"visual": "Long hallway stretching impossibly far, damp carpet underfoot, flickering fluorescent lights, silhouetted figure seen from behind, surrealist perspective", "caption": "The hallway is too long. The carpet is damp under bare feet, though there's no reason it should be.", "caption_position": "bottom-left", "dialogue": null, "sfx": null, "panel_type": "establishing"},
  {"visual": "Silhouetted figure approaching bright doorway, light spilling through, ghostly hand reaching out from the light", "caption": "Someone is calling your name from a room that doesn't exist anymore.", "caption_position": "top-left", "dialogue": "...your name...", "sfx": null, "panel_type": "action"},
  {"visual": "Wide shot of surreal grocery store interior, aisle signs with blank faces, tilted perspective, empty aisles stretching to infinity", "caption": "Every aisle sign has words that almost make sense—Bread, Time, Appointments You Missed.", "caption_position": "top-left", "dialogue": null, "sfx": null, "panel_type": "establishing"},
  {"visual": "Close-up of hand holding vibrating phone, screen glowing, dozens of notification bubbles, face reflected in screen is blurred", "caption": "Dozens of missed calls. When you answer, you hear your own voice breathing on the other end.", "caption_position": "top-left", "dialogue": "Hello?", "sfx": null, "panel_type": "emotional"},
  {"visual": "Faceless figure in cashier uniform behind counter, scanning mysterious items, single shoe and bent key on conveyor, harsh overhead lighting", "caption": "A faceless cashier scans items you never picked up: a single shoe, unopened letters, a bent house key.", "caption_position": "top-left", "dialogue": null, "sfx": "BEEP BEEP BEEP", "panel_type": "climax"},
  {"visual": "Wide shot of empty gymnasium with single figure at podium, mouth open, sand pouring out instead of words, audience seats empty, dream logic", "caption": "You're supposed to speak. When you open your mouth, sand pours out instead of words.", "caption_position": "bottom-center", "dialogue": null, "sfx": null, "panel_type": "emotional"}
]`
        },
        {
          role: "user",
          content: `Break this dream into exactly ${maxPanels} comic panels. Extract EVERY key moment with narrative captions that help the reader follow the dream's emotional arc.

Dream:
"${dreamText}"

Return ONLY a JSON array with visual, caption, caption_position, dialogue, sfx, and panel_type fields.`
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
      caption: string | null
      caption_position: string | null
      dialogue: string | null
      sfx: string | null
      panel_type: string
      // Legacy fields for backward compatibility
      overlay_text?: string | null
      text_position?: string | null
    }

    let scenes: SceneData[]
    let legacyFormat = false

    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        // Check if it's the new format with caption field
        if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].visual) {
          scenes = parsed.map((s: Record<string, unknown>) => ({
            visual: s.visual as string,
            caption: s.caption as string | null ?? null,
            caption_position: s.caption_position as string | null ?? 'top-left',
            dialogue: s.dialogue as string | null ?? null,
            sfx: s.sfx as string | null ?? null,
            panel_type: s.panel_type as string ?? 'action',
            // Legacy compatibility - also populate old fields
            overlay_text: s.overlay_text as string | null ?? s.dialogue as string | null ?? null,
            text_position: s.text_position as string | null ?? (s.dialogue ? 'speech-bubble' : null),
          }))
        } else if (parsed.length > 0 && typeof parsed[0] === 'string') {
          // Legacy string format - convert to new format
          legacyFormat = true
          scenes = parsed.map((s: string) => ({
            visual: s,
            caption: null,
            caption_position: null,
            dialogue: null,
            sfx: null,
            panel_type: 'action',
            overlay_text: null,
            text_position: null,
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
        caption: null,
        caption_position: null,
        dialogue: null,
        sfx: null,
        panel_type: 'action',
        overlay_text: null,
        text_position: null,
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
      sceneData: scenes, // Full structured data with captions, dialogue, sfx
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
