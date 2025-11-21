export async function POST(request: Request) {
  try {
    const { audioBase64 } = await request.json()

    if (!audioBase64) {
      return Response.json({ error: 'audio data required' }, { status: 400 })
    }

    // Mock transcription - in production would use Whisper API or similar
    return Response.json({
      text: 'This is a mock transcription. In production, this would use speech-to-text AI.',
      success: true,
      confidence: 0.95
    })

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
