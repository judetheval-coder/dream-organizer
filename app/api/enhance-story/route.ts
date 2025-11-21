import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { dreamText } = await req.json();

    if (!dreamText) {
      return NextResponse.json(
        { error: "Dream text is required" },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ enhanced });
  } catch (error: any) {
    console.error(" Story enhancement error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to enhance story" },
      { status: 500 }
    );
  }
}
