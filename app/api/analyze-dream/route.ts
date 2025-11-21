import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { dreams, analyzeCharacters = false } = await req.json();

    if (!dreams || dreams.length === 0) {
      return NextResponse.json(
        { error: "Dreams array is required" },
        { status: 400 }
      );
    }

    console.log(" Analyzing dreams...");

    const dreamTexts = dreams.map((d: any, i: number) => 
      `Dream ${i + 1} (${d.date || 'undated'}): ${d.description || d.text || d}`
    ).join('\n\n');

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

    console.log(" Analysis complete");

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error(" Dream analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze dreams" },
      { status: 500 }
    );
  }
}

