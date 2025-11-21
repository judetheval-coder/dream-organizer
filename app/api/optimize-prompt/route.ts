import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { description, style, mood } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ optimized });
  } catch (error: any) {
    console.error("❌ Prompt error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize prompt" },
      { status: 500 }
    );
  }
}
