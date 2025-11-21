export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return Response.json({ error: 'text required' }, { status: 400 })
    }

    // Simple sentiment analysis
    const positiveWords = ['happy', 'excited', 'amazing', 'wonderful', 'love', 'great', 'awesome', 'fantastic']
    const negativeWords = ['sad', 'frustrated', 'difficult', 'hard', 'struggle', 'worry', 'afraid', 'anxious']
    
    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length

    let mood = 'Neutral'
    let emoji = '😐'
    let color = '#8A2BE2'

    if (positiveCount > negativeCount) {
      mood = 'Positive'
      emoji = '😊'
      color = '#03DAC6'
    } else if (negativeCount > positiveCount) {
      mood = 'Challenging'
      emoji = '😰'
      color = '#FF6B6B'
    }

    return Response.json({
      mood,
      emoji,
      color,
      confidence: Math.min(((Math.abs(positiveCount - negativeCount) + 1) / 10) * 100, 95),
      suggestions: mood === 'Challenging' 
        ? ['Break down into smaller steps', 'Celebrate small wins', 'Take regular breaks']
        : ['Keep up the momentum!', 'Share your progress', 'Help others with similar goals']
    })

  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
