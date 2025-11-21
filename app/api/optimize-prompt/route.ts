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

    console.log(" Optimizing DALL-E prompt...");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at crafting DALL-E prompts for dream-like comic panels. Transform user descriptions into detailed, vivid prompts that produce high-quality comic art. Include:
- Art style (comic book, graphic novel, manga, etc.)
- Visual details (colors, lighting, composition)
- Mood and atmosphere
- Character descriptions
- Setting details
Keep it under 300 characters. Focus on visual elements, not story.`
        },
        {
          role: "user",
          content: `Create a DALL-E prompt for this dream scene:
Description: ${description}
${style ? `Style: ${style}` : ''}
${mood ? `Mood: ${mood}` : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const optimized = response.choices[0]?.message?.content;

    if (!optimized) {
      throw new Error("No optimized prompt returned");
    }

    console.log(" Prompt optimized");

    return NextResponse.json({ optimized });
  } catch (error: any) {
    console.error(" Prompt optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize prompt" },
      { status: 500 }
    );
  }
}
