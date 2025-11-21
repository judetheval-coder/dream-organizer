export type PanelPalette = {
  name: string
  background: string
  surface: string
  highlight: string
  border: string
  accent: string
  text: string
  shadow: string
  gradientDark: string
  gradientLight: string
}

export type DreamPanel = {
  id: string
  title: string
  caption: string
  narration: string
  prompt: string
  mood: string
  keywords: string[]
  layout: "full" | "split-left" | "split-right" | "tall"
  palette: PanelPalette
  focus: string
}

export type DreamAnalysis = {
  storyTitle: string
  synopsis: string
  tone: string
  keywords: string[]
  characters: string[]
  settings: string[]
  palette: PanelPalette
  panels: DreamPanel[]
}

type AnalyzerOptions = {
  mergeShort?: boolean
  maxPanels?: number
}

const DEFAULT_PALETTE: PanelPalette = {
  name: "nocturne",
  background: "#0f0a1f",
  surface: "#1a1035",
  highlight: "#2c124a",
  border: "#f472b6",
  accent: "#fef08a",
  text: "#f7ecff",
  shadow: "rgba(147, 51, 234, 0.45)",
  gradientDark: "linear-gradient(135deg,#080111,#1f0432 40%,#080111)",
  gradientLight: "linear-gradient(135deg,#fdf4ff,#fde68a 45%,#f3e8ff)"
}

const toneProfiles = [
  {
    tone: "wonder",
    keywords: ["star", "sky", "galaxy", "light", "glow", "floating", "cosmic"],
    palette: {
      name: "neon-dream",
      background: "#08021a",
      surface: "#1a0f2d",
      highlight: "#2a1342",
      border: "#f472b6",
      accent: "#c084fc",
      text: "#fdf4ff",
      shadow: "rgba(168, 85, 247, 0.45)",
      gradientDark: "linear-gradient(135deg,#05010c,#1a0b2d,#05010c)",
      gradientLight: "linear-gradient(135deg,#faf5ff,#fde68a,#fecdd3)"
    }
  },
  {
    tone: "serene",
    keywords: ["ocean", "calm", "quiet", "soft", "gentle", "breeze", "glide"],
    palette: {
      name: "dawn-mist",
      background: "#061424",
      surface: "#132437",
      highlight: "#1e3550",
      border: "#7dd3fc",
      accent: "#f9a8d4",
      text: "#f0f9ff",
      shadow: "rgba(56, 189, 248, 0.35)",
      gradientDark: "linear-gradient(135deg,#030713,#041f33,#030713)",
      gradientLight: "linear-gradient(135deg,#e0f2fe,#fdf2f8,#e0f2fe)"
    }
  },
  {
    tone: "nightmare",
    keywords: ["dark", "shadow", "fall", "chase", "storm", "monster", "scream"],
    palette: {
      name: "voidfire",
      background: "#050304",
      surface: "#1f0411",
      highlight: "#330517",
      border: "#fb7185",
      accent: "#facc15",
      text: "#fee2e2",
      shadow: "rgba(248, 113, 113, 0.4)",
      gradientDark: "linear-gradient(135deg,#020202,#30060d,#050202)",
      gradientLight: "linear-gradient(135deg,#fee2e2,#fef3c7,#fee2e2)"
    }
  },
  {
    tone: "adventure",
    keywords: ["run", "race", "mountain", "forest", "city", "battle", "flight"],
    palette: {
      name: "pulsewave",
      background: "#040912",
      surface: "#111b2c",
      highlight: "#1d2942",
      border: "#f97316",
      accent: "#34d399",
      text: "#f8fafc",
      shadow: "rgba(249, 115, 22, 0.35)",
      gradientDark: "linear-gradient(135deg,#01040a,#0f172a,#01040a)",
      gradientLight: "linear-gradient(135deg,#fff7ed,#cffafe,#fef9c3)"
    }
  }
]

const stopWords = new Set([
  "the", "and", "then", "with", "from", "that", "this", "into", "were", "was", "have", "when", "your",
  "about", "there", "their", "after", "before", "they", "them", "over", "like", "just", "into", "onto", "only",
  "very", "while", "where", "thats", "these", "those", "also", "suddenly", "because", "through"
])

const settingKeywords = [
  "forest",
  "ocean",
  "city",
  "castle",
  "desert",
  "mountain",
  "temple",
  "sky",
  "space",
  "island",
  "bridge",
  "cliff",
  "river",
  "school",
  "room",
  "house",
  "tunnel",
  "garden",
  "lab",
  "palace"
]

const layoutCycle: DreamPanel["layout"][] = ["full", "split-left", "split-right", "tall"]

const cleanText = (input: string) => input.replace(/\s+/g, " ").replace(/\s([,.!?;:])/g, "$1").trim()

const splitIntoSentences = (text: string) => {
  const matches = text.match(/[^.!?]+[.!?]?/g) || []
  return matches.map((s) => cleanText(s))
}

const combineScenes = (sentences: string[], target: number) => {
  if (sentences.length <= target) return sentences

  const chunkSize = Math.ceil(sentences.length / target)
  const chunks: string[] = []
  for (let i = 0; i < sentences.length; i += chunkSize) {
    const slice = sentences.slice(i, i + chunkSize)
    chunks.push(cleanText(slice.join(" ")))
  }
  return chunks
}

const scoreTone = (text: string) => {
  const lower = text.toLowerCase()
  let best = { tone: DEFAULT_PALETTE.name, score: 0, palette: DEFAULT_PALETTE }

  for (const profile of toneProfiles) {
    const score = profile.keywords.reduce((acc, keyword) => (lower.includes(keyword) ? acc + 1 : acc), 0)
    if (score > best.score) {
      best = { tone: profile.tone, score, palette: profile.palette }
    }
  }

  return best.score === 0 ? { tone: "wonder", palette: DEFAULT_PALETTE } : { tone: best.tone, palette: best.palette }
}

const extractKeywords = (text: string, limit = 6) => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))

  const freq: Record<string, number> = {}
  words.forEach((word) => {
    freq[word] = (freq[word] || 0) + 1
  })

  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, limit)
}

const extractCharacters = (text: string) => {
  const matches = text.match(/\b[A-Z][a-z]+\b/g) || []
  const filtered = matches.filter((name) => name.length > 2 && !stopWords.has(name.toLowerCase()))
  return Array.from(new Set(filtered)).slice(0, 5)
}

const detectSettings = (text: string) => {
  const lower = text.toLowerCase()
  return settingKeywords.filter((keyword) => lower.includes(keyword)).slice(0, 4)
}

const buildPanelTitle = (index: number, text: string) => {
  const verbs = text.match(/\b([A-Za-z]+ing)\b/g)
  if (verbs && verbs.length > 0) {
    return verbs[0].replace(/^[a-z]/, (char) => char.toUpperCase())
  }
  const words = text.split(" ")
  return words.slice(0, 3).join(" ").replace(/^[a-z]/, (char) => char.toUpperCase()) || `Scene ${index + 1}`
}

const describeFocus = (text: string) => {
  const nouns = text.match(/\b[a-z]{4,}\b/gi) || []
  return nouns.slice(0, 3).join(", ")
}

const createPrompt = (chunk: string, tone: string, palette: PanelPalette, keywords: string[]) => {
  const toneDescriptors: Record<string, string> = {
    wonder: "vibrant neon glow, cinematic depth of field",
    serene: "soft gradients, gentle lighting, tranquil energy",
    nightmare: "dramatic chiaroscuro, sharp angular shadows",
    adventure: "bold perspective, dynamic motion, kinetic lines"
  }

  const descriptor = toneDescriptors[tone] || toneDescriptors.wonder
  const keywordList = keywords.slice(0, 4).join(", ")

  return `${chunk}. ${descriptor}. ${palette.name} palette, bold ink outlines, halftone shading, ${keywordList}. comic book panel, widescreen.`
}

const ensureId = () => {
  const cryptoObj = typeof globalThis !== "undefined" ? (globalThis.crypto as Crypto | undefined) : undefined
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID()
  }
  return `panel-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function analyzeDream(text: string, options: AnalyzerOptions = {}): DreamAnalysis {
  const mergeShort = options.mergeShort ?? true
  const maxPanels = options.maxPanels ?? 6

  const cleaned = cleanText(text || "")
  const sentences = splitIntoSentences(cleaned)
  let scenes = sentences.filter(Boolean)

  if (mergeShort) {
    scenes = combineScenes(scenes, maxPanels)
  } else if (scenes.length > maxPanels) {
    scenes = scenes.slice(0, maxPanels)
  }

  if (scenes.length === 0 && cleaned) {
    scenes = [cleaned]
  }

  const storyText = scenes.join(" ")
  const keywords = extractKeywords(storyText)
  const characters = extractCharacters(text)
  const settings = detectSettings(text)
  const { tone, palette } = scoreTone(text)
  const synopsis = scenes.slice(0, 3).join(" ")

  const panels: DreamPanel[] = scenes.map((chunk, index) => {
    const chunkTone = scoreTone(chunk).tone || tone
    const chunkPalette = scoreTone(chunk).palette || palette
    return {
      id: ensureId(),
      title: buildPanelTitle(index, chunk),
      caption: chunk.slice(0, 140) + (chunk.length > 140 ? "…" : ""),
      narration: chunk,
      prompt: createPrompt(chunk, chunkTone, chunkPalette, keywords),
      mood: chunkTone,
      keywords: extractKeywords(chunk, 4),
      layout: layoutCycle[index % layoutCycle.length],
      palette: chunkPalette,
      focus: describeFocus(chunk)
    }
  })

  const storyTitle = characters.length
    ? `${characters[0]}'s ${tone === "nightmare" ? "Midnight" : "Dream"}`
    : scenes[0]?.split(" ").slice(0, 2).join(" ").replace(/^[a-z]/, (char) => char.toUpperCase()) || "Dream Sequence"

  return {
    storyTitle,
    synopsis,
    tone,
    keywords,
    characters,
    settings,
    palette,
    panels
  }
}
