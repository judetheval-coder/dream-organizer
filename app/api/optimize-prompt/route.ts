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
          content: `You are an expert comic artist. Transform dream descriptions into visual comic panel prompts. Keep it simple and visual.

Create a prompt that describes a single comic panel with:
- Clear, simple composition
- A person or character doing something
- Vivid but clear visual details
- Comic book art style (like graphic novels)
- Strong colors and mood

Be concise (under 150 characters). Focus only on WHAT IS VISIBLE in the panel.`
        },
        {
          role: "user",
          content: `Make a comic panel prompt:
"${description}"
${style ? `Art style hint: ${style}` : ''}
${mood ? `Feeling: ${mood}` : ''}

Output only the visual description, nothing else.`
        }
      ],
      temperature: 0.7,
      max_tokens: 120,
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
