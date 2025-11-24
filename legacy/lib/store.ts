// Centralized data store using localStorage

// Type Definitions
export type Activity = {
  id: number
  type: 'dream_created' | 'dream_completed' | 'achievement_unlocked' | 'comic_generated' | 'xp_earned'
  title: string
  description: string
  timestamp: string
  icon: string
  relatedId?: number
}

export type Dream = {
  id: number
  title: string
  description: string
  sleepDate: string
  vividness: number
  mood: 'happy' | 'neutral' | 'anxious' | 'scared' | 'excited' | 'sad' | 'peaceful'
  category: string
  emoji: string
  isLucid: boolean
  isNightmare: boolean
  isRecurring: boolean
  tags: string[]
  people: string[]
  places: string[]
  imageUrl?: string
  status: 'recent' | 'archived'
  createdAt: string
  updatedAt: string
  notes: string[]
}

export type Achievement = {
  id: number
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt?: string
  category: string
}

export type UserData = {
  name: string
  email: string
  xp: number
  level: number
  totalDreams: number
  completedDreams: number
  streak: number
  joinedAt: string
}

const STORAGE_KEYS = {
  DREAMS: 'dreamOrganizer_dreams',
  ACHIEVEMENTS: 'dreamOrganizer_achievements',
  USER: 'dreamOrganizer_user',
  SETTINGS: 'dreamOrganizer_settings',
  ACTIVITIES: 'dreamOrganizer_activities',
}

export const getDreams = (): Dream[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.DREAMS)
  return data ? JSON.parse(data) : getInitialDreams()
}

export const saveDream = (dream: Dream): void => {
  const dreams = getDreams()
  const existing = dreams.findIndex(d => d.id === dream.id)
  if (existing >= 0) {
    dreams[existing] = { ...dream, updatedAt: new Date().toISOString() }
  } else {
    dreams.push({ ...dream, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
  }
  localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams))
  checkAchievements()
}

export const deleteDream = (id: number): void => {
  const dreams = getDreams().filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams))
}

export const updateDream = (id: number, updates: Partial<Dream>): void => {
  const dreams = getDreams()
  const index = dreams.findIndex(d => d.id === id)
  if (index >= 0) {
    dreams[index] = { ...dreams[index], ...updates, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.DREAMS, JSON.stringify(dreams))
    checkAchievements()
  }
}

export const getAchievements = (): Achievement[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS)
  return data ? JSON.parse(data) : getInitialAchievements()
}

export const unlockAchievement = (id: string): void => {
  const achievements = getAchievements()
  const achievement = achievements.find(a => a.id.toString() === id)
  if (achievement && !achievement.unlocked) {
    achievement.unlocked = true
    achievement.unlockedAt = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements))
    addXP(100)
  }
}

export const getUserData = (): UserData => {
  if (typeof window === 'undefined') return getDefaultUser()
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : getDefaultUser()
}

export const updateUserData = (updates: Partial<UserData>): void => {
  const user = getUserData()
  const updated = { ...user, ...updates }
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated))
}

export const addXP = (amount: number): void => {
  const user = getUserData()
  user.xp += amount
  const newLevel = Math.floor(user.xp / 500) + 1
  if (newLevel > user.level) {
    user.level = newLevel
    unlockAchievement('level_' + newLevel)
  }
  updateUserData(user)
}

export const getSettings = () => {
  if (typeof window === 'undefined') return getDefaultSettings()
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  return data ? JSON.parse(data) : getDefaultSettings()
}

export const updateSettings = (updates: any) => {
  const settings = getSettings()
  const updated = { ...settings, ...updates }
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated))
}

export const getActivities = (): Activity[] => {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
  return data ? JSON.parse(data) : []
}

export const addActivity = (activity: Omit<Activity, 'id'>): void => {
  const activities = getActivities()
  const newActivity: Activity = {
    ...activity,
    id: Math.max(0, ...activities.map(a => a.id)) + 1
  }
  activities.unshift(newActivity)
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities.slice(0, 50)))
}

export const logComicGenerated = (): void => {
  addActivity({
    type: 'comic_generated',
    title: 'Comic Panel Generated',
    description: 'AI created a new comic panel',
    timestamp: new Date().toISOString(),
    icon: ''
  })
}

export const logDreamCreated = (title: string): void => {
  addActivity({
    type: 'dream_created',
    title: 'Dream Recorded',
    description: title,
    timestamp: new Date().toISOString(),
    icon: ''
  })
}

const checkAchievements = () => {
  const dreams = getDreams()
  const lucidDreams = dreams.filter(d => d.isLucid).length
  const nightmares = dreams.filter(d => d.isNightmare).length
  const vividDreams = dreams.filter(d => d.vividness === 5).length
  const user = getUserData()

  if (dreams.length >= 5) unlockAchievement('5_dreams')
  if (dreams.length >= 10) unlockAchievement('10_dreams')
  if (dreams.length >= 50) unlockAchievement('50_dreams')
  if (lucidDreams >= 1) unlockAchievement('first_lucid')
  if (lucidDreams >= 5) unlockAchievement('lucid_master')
  if (nightmares >= 1) unlockAchievement('nightmare_survivor')
  if (vividDreams >= 1) unlockAchievement('vivid_visionary')

  user.totalDreams = dreams.length
  user.completedDreams = lucidDreams
  updateUserData(user)
}

const getInitialDreams = (): Dream[] => [
  {
    id: 1,
    title: 'Flying Over the City',
    description: 'I was soaring above a futuristic city with glowing buildings.',
    sleepDate: '2025-11-18',
    vividness: 5,
    mood: 'excited',
    category: 'Adventure',
    emoji: 'fly',
    isLucid: true,
    isNightmare: false,
    isRecurring: false,
    tags: ['flying', 'city', 'lucid'],
    people: [],
    places: ['futuristic city'],
    status: 'recent',
    createdAt: '2025-11-18',
    updatedAt: '2025-11-18',
    notes: ['First lucid dream in weeks!']
  },
]

const getInitialAchievements = (): Achievement[] => [
  { id: 1, title: 'Dream Journal Starter', description: 'Record your first dream', emoji: 'star', unlocked: true, unlockedAt: '2025-11-01', category: 'Getting Started' },
  { id: 2, title: 'Dream Collector', description: 'Record 5 dreams', emoji: 'book', unlocked: true, unlockedAt: '2025-11-10', category: 'Collection' },
  { id: 3, title: 'Dream Keeper', description: 'Record 10 dreams', emoji: 'gem', unlocked: false, category: 'Collection' },
]

const getDefaultUser = (): UserData => ({
  name: 'Levi',
  email: 'levi@dreamer.ai',
  xp: 420,
  level: 3,
  totalDreams: 3,
  completedDreams: 1,
  streak: 5,
  joinedAt: '2025-11-01',
})

const getDefaultSettings = () => ({
  notifications: true,
  emailUpdates: false,
  aiSuggestions: true,
  darkMode: true,
  autoSave: true,
  comicStyle: 'anime',
  sdModel: 'nitrosocke/mo-di-diffusion',
})