import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    hasHuggingFaceKey: !!process.env.HUGGINGFACE_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json(envVars)
}
