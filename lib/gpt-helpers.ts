// GPT-4 Enhancement Utilities

export async function enhanceDreamStory(dreamText: string): Promise<string> {
  const response = await fetch('/api/enhance-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dreamText }),
  });

  if (!response.ok) {
    throw new Error('Failed to enhance story');
  }

  const data = await response.json();
  return data.enhanced;
}

export async function optimizePromptForDalle(
  description: string,
  style?: string,
  mood?: string
): Promise<string> {
  try {
    const response = await fetch('/api/optimize-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, style, mood }),
    });

    if (!response.ok) {
      // Fall back to a basic prompt if optimization fails
      console.warn('[optimizePromptForDalle] Optimization failed, using fallback prompt')
      return buildFallbackPrompt(description, style, mood)
    }

    const data = await response.json();
    return data.optimized;
  } catch (error) {
    // Network or other error - use fallback
    console.warn('[optimizePromptForDalle] Error during optimization, using fallback:', error)
    return buildFallbackPrompt(description, style, mood)
  }
}

// Fallback prompt builder when OpenAI optimization is unavailable
function buildFallbackPrompt(description: string, style?: string, mood?: string): string {
  const styleMap: Record<string, string> = {
    comic: 'bold comic book style, cel-shaded, dynamic lines',
    manga: 'Japanese manga style, expressive, detailed',
    watercolor: 'soft watercolor wash, dreamy, ethereal',
    noir: 'high contrast noir, dramatic shadows, moody',
    fantasy: 'fantasy illustration, magical, vibrant colors',
    surreal: 'surrealist art, dreamlike, Dali-inspired',
  }

  const moodMap: Record<string, string> = {
    dreamy: 'ethereal atmosphere, soft lighting',
    dark: 'dark moody atmosphere, shadows',
    peaceful: 'calm serene atmosphere, gentle lighting',
    intense: 'dramatic intense atmosphere, dynamic',
    mysterious: 'mysterious foggy atmosphere, enigmatic',
    joyful: 'bright cheerful atmosphere, warm colors',
  }

  const stylePrefix = style && styleMap[style.toLowerCase()]
    ? styleMap[style.toLowerCase()]
    : 'comic book illustration style'

  const moodSuffix = mood && moodMap[mood.toLowerCase()]
    ? moodMap[mood.toLowerCase()]
    : ''

  return `${stylePrefix}, ${description}${moodSuffix ? ', ' + moodSuffix : ''}`
}

export async function analyzeDreams(
  dreams: Array<{ description: string; date?: string; text?: string }>,
  analyzeCharacters: boolean = false
): Promise<string> {
  const response = await fetch('/api/analyze-dream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dreams, analyzeCharacters }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze dreams');
  }

  const data = await response.json();
  return data.analysis;
}
