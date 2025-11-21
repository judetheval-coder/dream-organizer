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
  const response = await fetch('/api/optimize-prompt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, style, mood }),
  });

  if (!response.ok) {
    throw new Error('Failed to optimize prompt');
  }

  const data = await response.json();
  return data.optimized;
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
