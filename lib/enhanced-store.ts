// Enhanced Dream Store with Tags, Collections, and Analytics
import { Activity } from './store'

export interface DreamTag {
  id: string
  name: 'nightmare' | 'lucid' | 'recurring' | 'vivid' | 'prophetic' | 'mundane'
  color: string
}

export interface Dream {
  id: string
  text: string
  image: string
  tags: string[] // tag IDs
  notes: string
  lucidityScore: number // 0-10
  moodScore: number // 0-10 (negative to positive)
  createdAt: number
  updatedAt: number
  collection?: string // collection ID
  favorited?: boolean
}

export interface DreamCollection {
  id: string
  name: string
  description: string
  dreamIds: string[]
  createdAt: number
  color?: string
}

export interface DreamStats {
  totalDreams: number
  totalLucidDreams: number
  totalNightmares: number
  averageLucidityScore: number
  averageMoodScore: number
  tagBreakdown: Record<string, number>
  dreamStreak: number
  longestStreak: number
  lastDreamDate: number | null
}

const STORAGE_KEYS = {
  DREAMS: 'dream-organizer-dreams',
  TAGS: 'dream-organizer-tags',
  COLLECTIONS: 'dream-organizer-collections',
  STATS: 'dream-organizer-stats'
}

// Default tags
const DEFAULT_TAGS: DreamTag[] = [
  { id: 'nightmare', name: 'nightmare', color: '#dc2626' },
  { id: 'lucid', name: 'lucid', color: '#8b5cf6' },
  { id: 'recurring', name: 'recurring', color: '#0ea5e9' },
  { id: 'vivid', name: 'vivid', color: '#ec4899' },
  { id: 'prophetic', name: 'prophetic', color: '#f59e0b' },
  { id: 'mundane', name: 'mundane', color: '#6b7280' }
]

// Get all dreams with tags populated
export function getDreamsWithTags(): Dream[] {
  try {
    const dreamsJson = localStorage.getItem(STORAGE_KEYS.DREAMS)
    return dreamsJson ? JSON.parse(dreamsJson) : []
  } catch {
    return []
  }
}

// Add or update dream
export function saveDream(dream: Dream): void {
  try {
    const dreams = getDreamsWithTags()
    const index = dreams.findIndex(d => d.id === dream.id)
    
    if (index >= 0) {
      dreams[index] = { ...dream, updatedAt: Date.now() }
    } else {
      dreams.push({ ...dream, createdAt: Date.now(), updatedAt: Date.now() })
    }
    
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams))
    updateStreak()
  } catch (e) {
    console.error('Error saving dream:', e)
  }
}

// Get dream by ID
export function getDreamById(id: string): Dream | null {
  const dreams = getDreamsWithTags()
  return dreams.find(d => d.id === id) || null
}

// Delete dream
export function deleteDream(id: string): void {
  try {
    const dreams = getDreamsWithTags()
    const filtered = dreams.filter(d => d.id !== id)
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(filtered))
  } catch (e) {
    console.error('Error deleting dream:', e)
  }
}

// Tag management
export function getTags(): DreamTag[] {
  try {
    const tagsJson = localStorage.getItem(STORAGE_KEYS.TAGS)
    return tagsJson ? JSON.parse(tagsJson) : DEFAULT_TAGS
  } catch {
    return DEFAULT_TAGS
  }
}

// Get dreams by tag
export function getDreamsByTag(tagId: string): Dream[] {
  const dreams = getDreamsWithTags()
  return dreams.filter(d => d.tags?.includes(tagId))
}

// Get dreams by date range
export function getDreamsByDateRange(startDate: number, endDate: number): Dream[] {
  const dreams = getDreamsWithTags()
  return dreams.filter(d => d.createdAt >= startDate && d.createdAt <= endDate)
}

// Collection management
export function getCollections(): DreamCollection[] {
  try {
    const collectionsJson = localStorage.getItem(STORAGE_KEYS.COLLECTIONS)
    return collectionsJson ? JSON.parse(collectionsJson) : []
  } catch {
    return []
  }
}

export function saveCollection(collection: DreamCollection): void {
  try {
    const collections = getCollections()
    const index = collections.findIndex(c => c.id === collection.id)
    
    if (index >= 0) {
      collections[index] = collection
    } else {
      collections.push(collection)
    }
    
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections))
  } catch (e) {
    console.error('Error saving collection:', e)
  }
}

// Calculate dream statistics
export function calculateDreamStats(): DreamStats {
  const dreams = getDreamsWithTags()
  const tags = getTags()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats: DreamStats = {
    totalDreams: dreams.length,
    totalLucidDreams: dreams.filter(d => d.lucidityScore >= 5).length,
    totalNightmares: dreams.filter(d => d.tags?.includes('nightmare')).length,
    averageLucidityScore: dreams.length > 0 ? dreams.reduce((sum, d) => sum + (d.lucidityScore || 0), 0) / dreams.length : 0,
    averageMoodScore: dreams.length > 0 ? dreams.reduce((sum, d) => sum + (d.moodScore || 5), 0) / dreams.length : 0,
    tagBreakdown: {},
    dreamStreak: 0,
    longestStreak: 0,
    lastDreamDate: dreams.length > 0 ? Math.max(...dreams.map(d => d.createdAt)) : null
  }

  // Tag breakdown
  tags.forEach(tag => {
    stats.tagBreakdown[tag.name] = dreams.filter(d => d.tags?.includes(tag.id)).length
  })

  return stats
}

// Dream streak tracking
function updateStreak(): void {
  try {
    const dreams = getDreamsWithTags().sort((a, b) => b.createdAt - a.createdAt)
    let currentStreak = 0
    let longestStreak = 0
    let lastDate: Date | null = null

    dreams.forEach(dream => {
      const dreamDate = new Date(dream.createdAt)
      dreamDate.setHours(0, 0, 0, 0)

      if (!lastDate) {
        currentStreak = 1
        lastDate = dreamDate
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
        lastDate = dreamDate
      }
    })

    longestStreak = Math.max(longestStreak, currentStreak)
  } catch (e) {
    console.error('Error updating streak:', e)
  }
}

// Search dreams
export function searchDreams(query: string): Dream[] {
  const dreams = getDreamsWithTags()
  const lowerQuery = query.toLowerCase()
  
  return dreams.filter(dream => 
    dream.text.toLowerCase().includes(lowerQuery) ||
    dream.notes?.toLowerCase().includes(lowerQuery)
  )
}

// Filter dreams with multiple criteria
export interface DreamFilter {
  tags?: string[]
  lucidityMin?: number
  moodMin?: number
  startDate?: number
  endDate?: number
  favorited?: boolean
}

export function filterDreams(filters: DreamFilter): Dream[] {
  let dreams = getDreamsWithTags()

  if (filters.tags?.length) {
    dreams = dreams.filter(d => 
      filters.tags!.some(tag => d.tags?.includes(tag))
    )
  }

  if (filters.lucidityMin !== undefined) {
    dreams = dreams.filter(d => (d.lucidityScore || 0) >= filters.lucidityMin!)
  }

  if (filters.moodMin !== undefined) {
    dreams = dreams.filter(d => (d.moodScore || 5) >= filters.moodMin!)
  }

  if (filters.startDate || filters.endDate) {
    dreams = dreams.filter(d => {
      if (filters.startDate && d.createdAt < filters.startDate) return false
      if (filters.endDate && d.createdAt > filters.endDate) return false
      return true
    })
  }

  if (filters.favorited) {
    dreams = dreams.filter(d => d.favorited)
  }

  return dreams
}
