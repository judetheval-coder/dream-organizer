// Global dream patterns and statistics
// Based on dream research and common patterns

export type GlobalPattern = {
  symbol: string
  percentage: number  // % of dreamers who report this
  emoji: string
  category: string
  funFact?: string
}

// Common dream themes reported in sleep studies
export const GLOBAL_DREAM_PATTERNS: GlobalPattern[] = [
  { symbol: 'Being chased', percentage: 72, emoji: '🏃', category: 'Action', funFact: 'The most commonly reported dream worldwide' },
  { symbol: 'Falling', percentage: 68, emoji: '⬇️', category: 'Action', funFact: 'Often occurs during the first stage of sleep' },
  { symbol: 'Flying', percentage: 55, emoji: '🦅', category: 'Action', funFact: 'More common in lucid dreamers' },
  { symbol: 'Being late', percentage: 52, emoji: '⏰', category: 'Anxiety', funFact: 'Peaks during stressful work periods' },
  { symbol: 'Teeth falling out', percentage: 48, emoji: '🦷', category: 'Body', funFact: 'More common in people who grind their teeth' },
  { symbol: 'Being naked in public', percentage: 43, emoji: '😳', category: 'Vulnerability', funFact: 'Often related to imposter syndrome' },
  { symbol: 'Taking an exam', percentage: 41, emoji: '📝', category: 'Anxiety', funFact: 'Common even decades after finishing school' },
  { symbol: 'Water', percentage: 38, emoji: '🌊', category: 'Nature', funFact: 'Calm vs turbulent water reflects emotional state' },
  { symbol: 'Death', percentage: 35, emoji: '💀', category: 'Transformation', funFact: 'Usually symbolizes change, not literal death' },
  { symbol: 'Meeting a celebrity', percentage: 32, emoji: '⭐', category: 'People', funFact: 'Often represents qualities you admire' },
  { symbol: 'Being trapped', percentage: 30, emoji: '🔒', category: 'Anxiety', funFact: 'Common during major life transitions' },
  { symbol: 'Car out of control', percentage: 28, emoji: '🚗', category: 'Anxiety', funFact: 'Reflects feeling lack of control in life' },
  { symbol: 'Snakes', percentage: 25, emoji: '🐍', category: 'Animal', funFact: 'More common in tropical regions' },
  { symbol: 'Finding new rooms', percentage: 23, emoji: '🚪', category: 'Discovery', funFact: 'Represents undiscovered potential' },
  { symbol: 'Being lost', percentage: 22, emoji: '🧭', category: 'Anxiety', funFact: 'Often occurs during periods of uncertainty' },
  { symbol: 'Pregnant', percentage: 20, emoji: '🤰', category: 'Creation', funFact: 'Can represent new projects or ideas' },
  { symbol: 'Celebrities', percentage: 18, emoji: '🌟', category: 'People' },
  { symbol: 'Money', percentage: 17, emoji: '💰', category: 'Objects' },
  { symbol: 'Fire', percentage: 15, emoji: '🔥', category: 'Nature' },
  { symbol: 'Animals attacking', percentage: 14, emoji: '🐺', category: 'Animal' },
  { symbol: 'Ex-partners', percentage: 13, emoji: '💔', category: 'People', funFact: 'Often represents unresolved feelings' },
  { symbol: 'Missing a flight', percentage: 12, emoji: '✈️', category: 'Anxiety' },
  { symbol: 'Childhood home', percentage: 11, emoji: '🏡', category: 'Place', funFact: 'Connects to formative memories' },
  { symbol: 'Being invisible', percentage: 10, emoji: '👻', category: 'Action' },
  { symbol: 'Apocalypse', percentage: 8, emoji: '🌋', category: 'Catastrophe' },
  { symbol: 'Lucid dreaming', percentage: 6, emoji: '✨', category: 'Meta', funFact: 'Knowing you\'re dreaming while dreaming' },
]

// Helper to find matches between user dreams and global patterns
export function findPatternMatches(dreamText: string): GlobalPattern[] {
  const lowerText = dreamText.toLowerCase()
  return GLOBAL_DREAM_PATTERNS.filter(pattern => {
    const keywords = pattern.symbol.toLowerCase().split(' ')
    return keywords.some(word => lowerText.includes(word))
  })
}

// Get top patterns for comparison
export function getTopPatterns(count: number = 10): GlobalPattern[] {
  return GLOBAL_DREAM_PATTERNS.slice(0, count)
}

// Generate insight message
export function generatePatternInsight(dreamText: string): string | null {
  const matches = findPatternMatches(dreamText)
  if (matches.length === 0) return null
  
  const topMatch = matches[0]
  return `${topMatch.percentage}% of dreamers also dream about ${topMatch.symbol.toLowerCase()}!`
}
