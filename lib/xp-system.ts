// lib/xp-system.ts
// Simple XP and level progression

export type PlayerStats = {
  totalXP: number
  level: number
  dreamsCreated: number // corrected spelling
  dreamsCrated?: number // legacy field retained for backward compatibility
  panelsGenerated: number
  imagesGenerated: number
}

const STATS_KEY = 'dream-organizer-stats'
const XP_PER_LEVEL = 100

const XP_ACTION_MAP: Record<string, number> = {
  DREAM_CREATE: 100,
  PANEL_GEN: 50,
  IMAGE_GEN: 25
}

function normalizeStats(raw: any): PlayerStats {
  const base: PlayerStats = {
    totalXP: 0,
    level: 1,
    dreamsCreated: 0,
    panelsGenerated: 0,
    imagesGenerated: 0
  }
  if (!raw || typeof raw !== 'object') return base
  // Support legacy typos and corrupted string XP values
  let totalXP: number
  if (typeof raw.totalXP === 'number') {
    totalXP = raw.totalXP
  } else if (typeof raw.totalXP === 'string') {
    const digits = raw.totalXP.replace(/[^0-9]/g, '')
    totalXP = digits ? parseInt(digits, 10) : 0
  } else {
    totalXP = 0
  }
  const dreamsCreated = typeof raw.dreamsCreated === 'number'
    ? raw.dreamsCreated
    : typeof raw.dreamsCrated === 'number'
      ? raw.dreamsCrated
      : 0
  const panelsGenerated = typeof raw.panelsGenerated === 'number' ? raw.panelsGenerated : 0
  const imagesGenerated = typeof raw.imagesGenerated === 'number' ? raw.imagesGenerated : 0
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1
  return { totalXP, level, dreamsCreated, panelsGenerated, imagesGenerated, dreamsCrated: dreamsCreated }
}

function getStats(): PlayerStats {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY) || 'null')
    return normalizeStats(raw)
  } catch {
    return normalizeStats(null)
  }
}

function saveStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {}
}

export function awardXP(amountOrAction: number | string): PlayerStats {
  const stats = getStats()
  const value = typeof amountOrAction === 'string'
    ? (XP_ACTION_MAP[amountOrAction] || 0)
    : amountOrAction
  if (typeof value === 'number' && !Number.isNaN(value)) {
    stats.totalXP += value
  }
  stats.level = Math.floor(stats.totalXP / XP_PER_LEVEL) + 1
  saveStats(stats)
  return stats
}

export function addDreamCreated(): PlayerStats {
  const stats = getStats()
  stats.dreamsCreated += 1
  stats.totalXP += 10
  stats.level = Math.floor(stats.totalXP / XP_PER_LEVEL) + 1
  saveStats(stats)
  return stats
}

export function addPanelGenerated(): PlayerStats {
  const stats = getStats()
  stats.panelsGenerated += 1
  stats.imagesGenerated += 1
  stats.totalXP += 5
  stats.level = Math.floor(stats.totalXP / XP_PER_LEVEL) + 1
  saveStats(stats)
  return stats
}

export function getPlayerStats(): PlayerStats {
  return getStats()
}

export function getXPProgressPercent(): number {
  const stats = getStats()
  const currentLevelXP = (stats.level - 1) * XP_PER_LEVEL
  const nextLevelXP = stats.level * XP_PER_LEVEL
  return ((stats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
}
