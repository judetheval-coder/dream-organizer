// Dream Dictionary - Common dream symbols and their interpretations
// Used for auto-explaining symbols found in user dreams

export type DreamSymbol = {
  symbol: string
  keywords: string[]  // Words that trigger this symbol
  meaning: string
  category: 'emotion' | 'nature' | 'animal' | 'object' | 'action' | 'person' | 'place' | 'body'
  commonInterpretations: string[]
  positiveAspect?: string
  negativeAspect?: string
  relatedSymbols: string[]
}

export const DREAM_SYMBOLS: DreamSymbol[] = [
  // NATURE
  {
    symbol: 'Water',
    keywords: ['water', 'ocean', 'sea', 'river', 'lake', 'rain', 'swimming', 'drowning', 'waves', 'flood'],
    meaning: 'Emotions, the unconscious mind, cleansing, life force',
    category: 'nature',
    commonInterpretations: [
      'Calm water suggests emotional peace',
      'Turbulent water indicates emotional turmoil',
      'Drowning may represent feeling overwhelmed',
      'Swimming suggests navigating emotions well'
    ],
    positiveAspect: 'Emotional clarity, renewal, going with the flow',
    negativeAspect: 'Feeling overwhelmed, suppressed emotions',
    relatedSymbols: ['Ocean', 'Rain', 'Fish', 'Boat']
  },
  {
    symbol: 'Flying',
    keywords: ['flying', 'fly', 'floating', 'soaring', 'levitating', 'wings', 'airborne'],
    meaning: 'Freedom, ambition, escaping limitations, perspective',
    category: 'action',
    commonInterpretations: [
      'Flying high suggests confidence and success',
      'Difficulty flying may indicate obstacles',
      'Fear of falling while flying shows anxiety about failure',
      'Effortless flight represents liberation'
    ],
    positiveAspect: 'Freedom, achievement, rising above problems',
    negativeAspect: 'Escapism, unrealistic expectations',
    relatedSymbols: ['Sky', 'Birds', 'Falling', 'Clouds']
  },
  {
    symbol: 'Falling',
    keywords: ['falling', 'fall', 'dropped', 'plummeting', 'tripping', 'cliff'],
    meaning: 'Loss of control, anxiety, fear of failure, letting go',
    category: 'action',
    commonInterpretations: [
      'Falling often represents fear of losing control',
      'May indicate anxiety about a situation',
      'Can symbolize letting go of something',
      'Sometimes represents a "fall from grace"'
    ],
    positiveAspect: 'Surrendering control, trusting the process',
    negativeAspect: 'Anxiety, insecurity, fear of failure',
    relatedSymbols: ['Flying', 'Cliff', 'Heights', 'Ground']
  },
  {
    symbol: 'Teeth',
    keywords: ['teeth', 'tooth', 'losing teeth', 'teeth falling', 'broken teeth', 'dental'],
    meaning: 'Self-image, communication, anxiety about appearance, powerlessness',
    category: 'body',
    commonInterpretations: [
      'Losing teeth often relates to communication anxieties',
      'May represent concerns about appearance',
      'Can indicate feeling powerless',
      'Sometimes relates to aging or health concerns'
    ],
    positiveAspect: 'Renewal, growth, shedding old self',
    negativeAspect: 'Insecurity, loss, communication problems',
    relatedSymbols: ['Mouth', 'Mirror', 'Body', 'Speaking']
  },
  {
    symbol: 'Being Chased',
    keywords: ['chased', 'chasing', 'running from', 'pursued', 'escape', 'hiding', 'hunt'],
    meaning: 'Avoidance, running from problems, anxiety, unresolved issues',
    category: 'action',
    commonInterpretations: [
      'Often represents avoiding a problem or emotion',
      'The chaser may represent an aspect of yourself',
      'Running successfully suggests handling stress well',
      'Being caught may mean it\'s time to face issues'
    ],
    positiveAspect: 'Awareness of what needs attention',
    negativeAspect: 'Avoidance, anxiety, unresolved fears',
    relatedSymbols: ['Running', 'Monster', 'Shadow', 'Fear']
  },
  {
    symbol: 'Death',
    keywords: ['death', 'dying', 'dead', 'funeral', 'grave', 'killed', 'murder'],
    meaning: 'Endings, transformation, major life changes, fear of loss',
    category: 'action',
    commonInterpretations: [
      'Rarely literal - usually symbolizes transformation',
      'May represent the end of a phase or relationship',
      'Death of someone else can mean changing relationship',
      'Can indicate personal growth and rebirth'
    ],
    positiveAspect: 'Transformation, new beginnings, growth',
    negativeAspect: 'Fear of change, loss, grief',
    relatedSymbols: ['Rebirth', 'Endings', 'Change', 'Transformation']
  },
  {
    symbol: 'Naked in Public',
    keywords: ['naked', 'nude', 'undressed', 'exposed', 'no clothes', 'embarrassed'],
    meaning: 'Vulnerability, fear of exposure, authenticity, insecurity',
    category: 'action',
    commonInterpretations: [
      'Fear of being seen for who you really are',
      'Anxiety about being unprepared or exposed',
      'Can represent desire for authenticity',
      'May indicate imposter syndrome'
    ],
    positiveAspect: 'Authenticity, vulnerability as strength',
    negativeAspect: 'Shame, fear of judgment, insecurity',
    relatedSymbols: ['Clothes', 'Public', 'Embarrassment', 'Exposure']
  },
  // ANIMALS
  {
    symbol: 'Snake',
    keywords: ['snake', 'snakes', 'serpent', 'viper', 'cobra', 'python'],
    meaning: 'Transformation, hidden fears, healing, sexuality, wisdom',
    category: 'animal',
    commonInterpretations: [
      'Can represent hidden fears or threats',
      'Symbolizes transformation and renewal (shedding skin)',
      'May indicate healing energy (medical symbol)',
      'Sometimes represents sexual energy or temptation'
    ],
    positiveAspect: 'Healing, transformation, wisdom',
    negativeAspect: 'Hidden threats, deception, fears',
    relatedSymbols: ['Transformation', 'Fear', 'Healing', 'Rebirth']
  },
  {
    symbol: 'Dog',
    keywords: ['dog', 'dogs', 'puppy', 'canine', 'pet dog'],
    meaning: 'Loyalty, friendship, protection, instincts',
    category: 'animal',
    commonInterpretations: [
      'Friendly dog represents loyal friendships',
      'Aggressive dog may indicate conflict or betrayal',
      'Lost dog suggests feeling disconnected from friends',
      'Playing with dog indicates joy and companionship'
    ],
    positiveAspect: 'Loyalty, unconditional love, protection',
    negativeAspect: 'Feeling attacked, betrayal by friends',
    relatedSymbols: ['Pet', 'Friend', 'Wolf', 'Protection']
  },
  {
    symbol: 'Cat',
    keywords: ['cat', 'cats', 'kitten', 'feline'],
    meaning: 'Independence, intuition, femininity, mystery',
    category: 'animal',
    commonInterpretations: [
      'Represents independence and self-sufficiency',
      'May symbolize intuition or psychic abilities',
      'Can indicate a mysterious situation',
      'Sometimes represents feminine energy'
    ],
    positiveAspect: 'Independence, intuition, grace',
    negativeAspect: 'Aloofness, hidden threats, bad luck (black cat)',
    relatedSymbols: ['Mystery', 'Independence', 'Night', 'Intuition']
  },
  {
    symbol: 'Spider',
    keywords: ['spider', 'spiders', 'web', 'spider web', 'arachnid'],
    meaning: 'Creativity, patience, feminine power, feeling trapped',
    category: 'animal',
    commonInterpretations: [
      'Web-spinning suggests creative endeavors',
      'Being caught in a web indicates feeling trapped',
      'Can represent a powerful feminine presence',
      'May indicate manipulation or being manipulated'
    ],
    positiveAspect: 'Creativity, patience, destiny weaving',
    negativeAspect: 'Feeling trapped, manipulation, fears',
    relatedSymbols: ['Web', 'Trap', 'Creativity', 'Fear']
  },
  {
    symbol: 'Bird',
    keywords: ['bird', 'birds', 'flying bird', 'crow', 'eagle', 'owl', 'raven'],
    meaning: 'Freedom, perspective, spirituality, messages',
    category: 'animal',
    commonInterpretations: [
      'Flying birds represent freedom and aspirations',
      'Caged bird suggests feeling restricted',
      'Different birds have different meanings (owl=wisdom)',
      'May indicate receiving messages or news'
    ],
    positiveAspect: 'Freedom, spiritual messages, perspective',
    negativeAspect: 'Feeling caged, unattainable goals',
    relatedSymbols: ['Flying', 'Sky', 'Freedom', 'Message']
  },
  // PLACES
  {
    symbol: 'House',
    keywords: ['house', 'home', 'room', 'rooms', 'building', 'mansion', 'apartment'],
    meaning: 'Self, psyche, different aspects of personality',
    category: 'place',
    commonInterpretations: [
      'Different rooms represent different aspects of self',
      'Attic often represents higher consciousness or memories',
      'Basement may symbolize the unconscious or suppressed feelings',
      'Condition of house reflects self-perception'
    ],
    positiveAspect: 'Self-understanding, security, identity',
    negativeAspect: 'Neglected areas of self, hidden issues',
    relatedSymbols: ['Room', 'Door', 'Stairs', 'Window']
  },
  {
    symbol: 'School',
    keywords: ['school', 'classroom', 'exam', 'test', 'teacher', 'student', 'university'],
    meaning: 'Learning, personal growth, anxiety, being tested',
    category: 'place',
    commonInterpretations: [
      'Often relates to feeling tested in waking life',
      'Being unprepared for exam suggests anxiety',
      'May indicate learning important life lessons',
      'Can represent social dynamics and hierarchy'
    ],
    positiveAspect: 'Growth, learning, achievement',
    negativeAspect: 'Performance anxiety, fear of failure',
    relatedSymbols: ['Test', 'Learning', 'Teacher', 'Failure']
  },
  // OBJECTS
  {
    symbol: 'Car',
    keywords: ['car', 'driving', 'vehicle', 'automobile', 'driving car', 'crash'],
    meaning: 'Life direction, control, ambition, journey',
    category: 'object',
    commonInterpretations: [
      'Driving represents control over life direction',
      'Passenger suggests letting others control',
      'Car crash may indicate loss of control',
      'Condition of car reflects life circumstances'
    ],
    positiveAspect: 'Direction, progress, control',
    negativeAspect: 'Loss of control, wrong direction',
    relatedSymbols: ['Road', 'Journey', 'Direction', 'Speed']
  },
  {
    symbol: 'Money',
    keywords: ['money', 'cash', 'coins', 'wealth', 'rich', 'poor', 'bankrupt'],
    meaning: 'Self-worth, power, energy, resources',
    category: 'object',
    commonInterpretations: [
      'Finding money suggests discovering hidden talents',
      'Losing money may indicate fear of loss',
      'Represents energy exchange and self-value',
      'Can reflect actual financial concerns'
    ],
    positiveAspect: 'Abundance, self-worth, opportunity',
    negativeAspect: 'Greed, materialism, insecurity',
    relatedSymbols: ['Wealth', 'Power', 'Value', 'Exchange']
  },
  {
    symbol: 'Phone',
    keywords: ['phone', 'telephone', 'cell phone', 'calling', 'text', 'smartphone'],
    meaning: 'Communication, connection, messages, reaching out',
    category: 'object',
    commonInterpretations: [
      'Phone not working suggests communication breakdown',
      'Receiving call may indicate important message',
      'Unable to dial represents feeling unheard',
      'May relate to actual communication issues'
    ],
    positiveAspect: 'Connection, important messages, clarity',
    negativeAspect: 'Miscommunication, isolation, anxiety',
    relatedSymbols: ['Communication', 'Message', 'Connection', 'Voice']
  },
  // PEOPLE
  {
    symbol: 'Baby',
    keywords: ['baby', 'infant', 'newborn', 'child', 'pregnancy', 'pregnant'],
    meaning: 'New beginnings, innocence, vulnerability, creativity',
    category: 'person',
    commonInterpretations: [
      'Often represents new projects or ideas',
      'May indicate desire for children or nurturing',
      'Can symbolize your inner child',
      'Represents something that needs care and attention'
    ],
    positiveAspect: 'New beginnings, potential, innocence',
    negativeAspect: 'Vulnerability, responsibility fears',
    relatedSymbols: ['Birth', 'Beginning', 'Innocence', 'Creation']
  },
  {
    symbol: 'Ex-Partner',
    keywords: ['ex', 'ex-boyfriend', 'ex-girlfriend', 'ex-husband', 'ex-wife', 'former partner'],
    meaning: 'Unresolved feelings, lessons learned, patterns',
    category: 'person',
    commonInterpretations: [
      'Often represents unresolved emotions',
      'May highlight relationship patterns',
      'Can indicate missing certain qualities',
      'Sometimes represents that period of your life'
    ],
    positiveAspect: 'Closure, growth, self-awareness',
    negativeAspect: 'Unresolved issues, longing, regret',
    relatedSymbols: ['Relationship', 'Past', 'Love', 'Breakup']
  },
  {
    symbol: 'Stranger',
    keywords: ['stranger', 'unknown person', 'mysterious person', 'faceless'],
    meaning: 'Unknown aspects of self, potential, mystery',
    category: 'person',
    commonInterpretations: [
      'Often represents undiscovered parts of yourself',
      'May indicate new opportunities or people coming',
      'Can symbolize fears of the unknown',
      'Faceless strangers often represent unknown aspects of self'
    ],
    positiveAspect: 'New possibilities, undiscovered potential',
    negativeAspect: 'Fear of unknown, hidden threats',
    relatedSymbols: ['Shadow', 'Mystery', 'Self', 'Unknown']
  },
  // EMOTIONS/ACTIONS
  {
    symbol: 'Lost',
    keywords: ['lost', 'can\'t find', 'searching', 'wandering', 'confused', 'maze'],
    meaning: 'Uncertainty, life direction, feeling overwhelmed',
    category: 'action',
    commonInterpretations: [
      'Often reflects feeling directionless in life',
      'May indicate need for guidance',
      'Can represent transition periods',
      'Searching suggests seeking answers'
    ],
    positiveAspect: 'Quest for meaning, exploration',
    negativeAspect: 'Confusion, anxiety, directionless',
    relatedSymbols: ['Path', 'Journey', 'Direction', 'Maze']
  },
  {
    symbol: 'Late',
    keywords: ['late', 'running late', 'missed', 'behind', 'deadline', 'time'],
    meaning: 'Anxiety, feeling behind, missed opportunities',
    category: 'action',
    commonInterpretations: [
      'Often reflects real-life time pressure',
      'May indicate fear of missing opportunities',
      'Can suggest feeling behind in life',
      'Represents anxiety about commitments'
    ],
    positiveAspect: 'Awareness of priorities, motivation',
    negativeAspect: 'Anxiety, stress, fear of failure',
    relatedSymbols: ['Time', 'Clock', 'Running', 'Anxiety']
  },
  {
    symbol: 'Mirror',
    keywords: ['mirror', 'reflection', 'looking at self', 'seeing reflection'],
    meaning: 'Self-reflection, self-image, truth, identity',
    category: 'object',
    commonInterpretations: [
      'Represents how you see yourself',
      'Distorted reflection suggests self-image issues',
      'Can indicate need for self-examination',
      'Different reflection may show hidden aspects of self'
    ],
    positiveAspect: 'Self-awareness, truth, clarity',
    negativeAspect: 'Self-criticism, distorted self-image',
    relatedSymbols: ['Self', 'Identity', 'Truth', 'Reflection']
  },
  {
    symbol: 'Fire',
    keywords: ['fire', 'flames', 'burning', 'inferno', 'smoke', 'blaze'],
    meaning: 'Passion, transformation, destruction, anger',
    category: 'nature',
    commonInterpretations: [
      'Can represent passion and desire',
      'Destructive fire may indicate anger',
      'Warming fire suggests comfort',
      'Being burned relates to emotional pain'
    ],
    positiveAspect: 'Passion, purification, transformation',
    negativeAspect: 'Anger, destruction, danger',
    relatedSymbols: ['Heat', 'Passion', 'Anger', 'Light']
  },
  {
    symbol: 'Wedding',
    keywords: ['wedding', 'marriage', 'bride', 'groom', 'ceremony', 'altar'],
    meaning: 'Commitment, union, transition, partnership',
    category: 'action',
    commonInterpretations: [
      'May not be about literal marriage',
      'Represents union of different aspects',
      'Can indicate major life commitment',
      'Wedding problems suggest anxiety about commitment'
    ],
    positiveAspect: 'Commitment, harmony, new chapter',
    negativeAspect: 'Fear of commitment, loss of freedom',
    relatedSymbols: ['Ring', 'Commitment', 'Partnership', 'Love']
  }
]

// Helper function to find symbols in dream text
export function findSymbolsInText(dreamText: string): DreamSymbol[] {
  const lowerText = dreamText.toLowerCase()
  const foundSymbols: DreamSymbol[] = []
  const seenSymbols = new Set<string>()

  for (const symbol of DREAM_SYMBOLS) {
    for (const keyword of symbol.keywords) {
      if (lowerText.includes(keyword) && !seenSymbols.has(symbol.symbol)) {
        foundSymbols.push(symbol)
        seenSymbols.add(symbol.symbol)
        break
      }
    }
  }

  return foundSymbols
}

// Get symbol by name
export function getSymbolByName(name: string): DreamSymbol | undefined {
  return DREAM_SYMBOLS.find(s => s.symbol.toLowerCase() === name.toLowerCase())
}

// Get symbols by category
export function getSymbolsByCategory(category: DreamSymbol['category']): DreamSymbol[] {
  return DREAM_SYMBOLS.filter(s => s.category === category)
}

// Search symbols
export function searchSymbols(query: string): DreamSymbol[] {
  const lowerQuery = query.toLowerCase()
  return DREAM_SYMBOLS.filter(s => 
    s.symbol.toLowerCase().includes(lowerQuery) ||
    s.keywords.some(k => k.includes(lowerQuery)) ||
    s.meaning.toLowerCase().includes(lowerQuery)
  )
}

export default DREAM_SYMBOLS
