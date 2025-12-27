/**
 * Request/input validation schemas using Zod
 * Centralized schemas for type safety and validation
 */

// Note: zod will be added to package.json in the setup
// For now, using simple runtime validation

/**
 * Validate dream creation request
 */
export function validateDreamInput(data: unknown): {
  valid: boolean
  errors: string[]
  data?: Record<string, unknown>
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Request body must be an object')
    return { valid: false, errors }
  }

  const obj = data as Record<string, unknown>
  const validated: Record<string, unknown> = {}

  // Validate text
  if (typeof obj.text !== 'string') {
    errors.push('text: must be a string')
  } else if (obj.text.trim().length === 0) {
    errors.push('text: cannot be empty')
  } else if (obj.text.length > 5000) {
    errors.push('text: must be less than 5000 characters')
  } else {
    validated.text = obj.text.trim()
  }

  // Validate style
  if (obj.style && typeof obj.style !== 'string') {
    errors.push('style: must be a string')
  } else {
    validated.style = obj.style || 'Anime'
  }

  // Validate mood
  if (obj.mood && typeof obj.mood !== 'string') {
    errors.push('mood: must be a string')
  } else {
    validated.mood = obj.mood || 'Dreamy'
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validated : undefined,
  }
}

/**
 * Validate image generation request
 */
export function validateImageGenerationInput(data: unknown): {
  valid: boolean
  errors: string[]
  data?: Record<string, unknown>
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Request body must be an object')
    return { valid: false, errors }
  }

  const obj = data as Record<string, unknown>
  const validated: Record<string, unknown> = {}

  // Validate prompt
  if (typeof obj.prompt !== 'string') {
    errors.push('prompt: must be a string')
  } else if (obj.prompt.trim().length === 0) {
    errors.push('prompt: cannot be empty')
  } else if (obj.prompt.length > 2000) {
    errors.push('prompt: must be less than 2000 characters')
  } else {
    validated.prompt = obj.prompt.trim()
  }

  // Validate dream_id
  if (obj.dream_id && typeof obj.dream_id !== 'string') {
    errors.push('dream_id: must be a string')
  } else if (obj.dream_id) {
    validated.dream_id = obj.dream_id
  }

  // Validate panel_number
  if (obj.panel_number && typeof obj.panel_number !== 'number') {
    errors.push('panel_number: must be a number')
  } else if (typeof obj.panel_number === 'number' && obj.panel_number < 1) {
    errors.push('panel_number: must be at least 1')
  } else if (typeof obj.panel_number === 'number') {
    validated.panel_number = obj.panel_number
  }

  // Validate settings
  if (obj.modelId && typeof obj.modelId !== 'string') {
    errors.push('modelId: must be a string')
  } else {
    validated.modelId = obj.modelId || 'dall-e-3'
  }

  if (obj.steps && (typeof obj.steps !== 'number' || obj.steps < 1 || obj.steps > 100)) {
    errors.push('steps: must be a number between 1 and 100')
  } else {
    validated.steps = obj.steps || 30
  }

  if (obj.guidance && (typeof obj.guidance !== 'number' || obj.guidance < 1 || obj.guidance > 25)) {
    errors.push('guidance: must be a number between 1 and 25')
  } else {
    validated.guidance = obj.guidance || 10
  }

  // Validate seed for consistent style across panels
  if (obj.seed !== undefined) {
    if (typeof obj.seed !== 'number' || obj.seed < 0) {
      errors.push('seed: must be a non-negative number')
    } else {
      validated.seed = obj.seed
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? validated : undefined,
  }
}

/**
 * Validate pagination params
 */
export function validatePaginationParams(data: unknown): {
  valid: boolean
  errors: string[]
  data?: { limit: number; offset: number; cursor?: string }
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return {
      valid: true,
      errors: [],
      data: { limit: 20, offset: 0 },
    }
  }

  const obj = data as Record<string, unknown>
  const limit = typeof obj.limit === 'number' ? obj.limit : 20
  const offset = typeof obj.offset === 'number' ? obj.offset : 0
  const cursor = typeof obj.cursor === 'string' ? obj.cursor : undefined

  if (limit < 1 || limit > 100) {
    errors.push('limit: must be between 1 and 100')
  }

  if (offset < 0) {
    errors.push('offset: must be non-negative')
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { limit: Math.min(limit, 100), offset, cursor } : undefined,
  }
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

export type DreamAnalysisRecord = {
  description?: string
  text?: string
  date?: string
}

export type DreamAnalysisValidation = {
  dreams: DreamAnalysisRecord[]
  analyzeCharacters: boolean
}

export function validateDreamAnalysisInput(data: unknown): {
  valid: boolean
  errors: string[]
  data?: DreamAnalysisValidation
} {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body required'] }
  }

  const obj = data as Record<string, unknown>

  if (!Array.isArray(obj.dreams) || obj.dreams.length === 0) {
    errors.push('dreams: must be a non-empty array')
  }

  const dreams = Array.isArray(obj.dreams)
    ? obj.dreams.map((dream, index) => {
        if (!dream || typeof dream !== 'object') {
          errors.push(`dreams[${index}]: must be an object`)
          return { description: undefined, text: undefined, date: undefined }
        }

        const record = dream as Record<string, unknown>
        return {
          description: typeof record.description === 'string' ? record.description : undefined,
          text: typeof record.text === 'string' ? record.text : undefined,
          date: typeof record.date === 'string' ? record.date : undefined,
        }
      })
    : []

  if (obj.analyzeCharacters !== undefined && typeof obj.analyzeCharacters !== 'boolean') {
    errors.push('analyzeCharacters: must be boolean')
  }

  return {
    valid: errors.length === 0,
    errors,
    data:
      errors.length === 0
        ? {
            dreams,
            analyzeCharacters: obj.analyzeCharacters === true,
          }
        : undefined,
  }
}

export function validateEnhanceStoryInput(data: unknown) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body required'] }
  }

  const obj = data as Record<string, unknown>
  const errors: string[] = []

  if (typeof obj.dreamText !== 'string' || obj.dreamText.trim().length === 0) {
    errors.push('dreamText: must be a non-empty string')
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? { dreamText: sanitizeText(obj.dreamText as string) } : undefined,
  }
}

export function validateOptimizePromptInput(data: unknown) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body required'] }
  }

  const obj = data as Record<string, unknown>
  const errors: string[] = []

  if (typeof obj.description !== 'string' || obj.description.trim().length === 0) {
    errors.push('description: must be a non-empty string')
  }

  if (obj.style && typeof obj.style !== 'string') {
    errors.push('style: must be a string')
  }

  if (obj.mood && typeof obj.mood !== 'string') {
    errors.push('mood: must be a string')
  }

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      description: sanitizeText(obj.description as string),
      style: obj.style ? sanitizeText(obj.style as string) : undefined,
      mood: obj.mood ? sanitizeText(obj.mood as string) : undefined,
    } : undefined,
  }
}
