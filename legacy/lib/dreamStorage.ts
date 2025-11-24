// lib/dreamStorage.ts
// Persistent dream archive system with sessionStorage for current session

export type DreamArchive = {
  id: string
  title: string
  dream: string
  analysis: any
  panels: any[]
  timestamp: number
  generatedCount: number
}

const ARCHIVE_KEY = 'dream-organizer-archive'
const SESSION_KEY = 'dream-organizer-session'

export function saveDreamToArchive(title: string, dream: string, analysis: any, panels: any[]): string {
  const id = `dream-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`
  const archive: DreamArchive = {
    id,
    title: title || analysis?.storyTitle || 'Untitled Dream',
    dream,
    analysis,
    panels,
    timestamp: Date.now(),
    generatedCount: panels.filter((p: any) => p.imageGenerated).length
  }

  let archives: DreamArchive[] = []
  try {
    const existing = localStorage.getItem(ARCHIVE_KEY)
    if (existing) archives = JSON.parse(existing)
  } catch {}

  archives.push(archive)
  try {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives.slice(-50))) // Keep last 50
  } catch {}

  return id
}

export function loadDreamFromArchive(id: string): DreamArchive | null {
  try {
    const archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]')
    return archives.find((d: DreamArchive) => d.id === id) || null
  } catch {
    return null
  }
}

export function getAllArchives(): DreamArchive[] {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]').sort(
      (a: DreamArchive, b: DreamArchive) => b.timestamp - a.timestamp
    )
  } catch {
    return []
  }
}

export function deleteArchive(id: string): void {
  try {
    let archives = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || '[]')
    archives = archives.filter((d: DreamArchive) => d.id !== id)
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archives))
  } catch {}
}

export function saveSessionState(dreamText: string, analysis: any, panels: any[]): void {
  try {
    const session = { dreamText, analysis, panels, timestamp: Date.now() }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {}
}

export function loadSessionState(): { dreamText: string; analysis: any; panels: any[] } | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null')
    if (session && Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
      return { dreamText: session.dreamText, analysis: session.analysis, panels: session.panels }
    }
  } catch {}
  return null
}

export function clearSessionState(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
}
