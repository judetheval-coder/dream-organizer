// Mock data for feature components - keeps main components lean
import { colors, gradients } from '@/lib/design'

// EventsContest data
export const LEADERBOARD = [
  { id: '1', username: 'DreamWeaver42', dreamTitle: 'Flying Over Crystal Mountains', views: 2847, likes: 156, rank: 1, avatar: '🌟' },
  { id: '2', username: 'NightOwl_Luna', dreamTitle: 'The Underwater City', views: 2103, likes: 132, rank: 2, avatar: '🦉' },
  { id: '3', username: 'StarGazer99', dreamTitle: 'Chase Through Time', views: 1856, likes: 98, rank: 3, avatar: '⭐' },
  { id: '4', username: 'MoonDreamer', dreamTitle: 'Garden of Memories', views: 1432, likes: 87, rank: 4, avatar: '🌙' },
  { id: '5', username: 'CloudSurfer', dreamTitle: 'The Infinite Library', views: 1201, likes: 76, rank: 5, avatar: '☁️' },
  { id: '6', username: 'DreamCatcher_X', dreamTitle: 'Lost in the Mirror Maze', views: 987, likes: 65, rank: 6, avatar: '🔮' },
  { id: '7', username: 'NebulaNight', dreamTitle: 'Dancing with Shadows', views: 876, likes: 54, rank: 7, avatar: '🌌' },
  { id: '8', username: 'PhantomDreams', dreamTitle: 'The Clockwork Dragon', views: 743, likes: 43, rank: 8, avatar: '👻' },
  { id: '9', username: 'AuroraSkies', dreamTitle: 'Whispers of the Forest', views: 654, likes: 38, rank: 9, avatar: '🌈' },
  { id: '10', username: 'MysticVisions', dreamTitle: 'Portal to Nowhere', views: 521, likes: 29, rank: 10, avatar: '✨' },
]

export const PRIZES = [
  { place: '🥇 1st Place', reward: '1 Month Premium FREE', desc: 'Full access to all Premium features' },
  { place: '🥈 2nd Place', reward: '1 Month Pro FREE', desc: 'Full access to all Pro features' },
  { place: '🥉 3rd Place', reward: '50% Off Pro (1 Month)', desc: 'Half price on Pro subscription' },
  { place: '🏅 4th-10th', reward: 'Exclusive Badge', desc: '"Top Dreamer" profile badge' },
]

export const RULES = [
  'Share your dream publicly in the Gallery to enter',
  'Contest runs from the 1st to the last day of each month',
  'Views are counted from unique visitors only',
  'One entry per person - your highest-viewed dream counts',
  'Winners announced on the 1st of the following month',
  'Prize subscriptions activate automatically for winners',
]

export const PAST_WINNERS = [
  { month: 'October 2025', winner: 'CosmicDreamer', views: 4521, avatar: '🚀' },
  { month: 'September 2025', winner: 'MidnightMuse', views: 3876, avatar: '🎭' },
  { month: 'August 2025', winner: 'DreamArchitect', views: 3245, avatar: '🏗️' },
]

// GiftSubscriptions data
export const GIFT_OPTIONS = [
  { duration: '1_month', label: '1 Month', months: 1, discount: 0, popular: false },
  { duration: '3_months', label: '3 Months', months: 3, discount: 10, popular: false },
  { duration: '6_months', label: '6 Months', months: 6, discount: 15, popular: true },
  { duration: '12_months', label: '1 Year', months: 12, discount: 20, popular: false },
] as const

export type GiftDuration = typeof GIFT_OPTIONS[number]['duration']

// DreamGroups data
export type DreamGroup = {
  id: string; name: string; description: string; emoji: string
  memberCount: number; postCount: number; isJoined: boolean; isPrivate: boolean
  category: string; recentActivity?: string; coverGradient?: string
}

export const DEFAULT_GROUPS: DreamGroup[] = [
  { id: 'lucid-dreamers', name: 'Lucid Dreamers', description: 'Master the art of conscious dreaming. Share techniques, experiences, and tips.', emoji: '✨', memberCount: 2847, postCount: 1203, isJoined: false, isPrivate: false, category: 'lucid', recentActivity: '2 hours ago', coverGradient: `linear-gradient(135deg, ${colors.purple} 0%, ${colors.cyan} 100%)` },
  { id: 'nightmare-club', name: 'Nightmare Club', description: 'A safe space to share and process scary dreams. Turn nightmares into art.', emoji: '👻', memberCount: 1523, postCount: 892, isJoined: false, isPrivate: false, category: 'nightmare', recentActivity: '5 hours ago', coverGradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)' },
  { id: 'recurring-dreams', name: 'Recurring Dreams', description: 'Explore patterns in dreams that keep coming back.', emoji: '🔄', memberCount: 1891, postCount: 756, isJoined: false, isPrivate: false, category: 'recurring', recentActivity: '1 day ago', coverGradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' },
  { id: 'creative-dreamers', name: 'Creative Dreamers', description: 'Artists, writers, and creators inspired by their dreams.', emoji: '🎨', memberCount: 3201, postCount: 2104, isJoined: false, isPrivate: false, category: 'creative', recentActivity: '30 minutes ago', coverGradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)' },
  { id: 'dream-analysis', name: 'Dream Analysis', description: 'Deep dive into dream interpretation. Psychology enthusiasts welcome!', emoji: '🔍', memberCount: 2156, postCount: 1567, isJoined: false, isPrivate: false, category: 'analysis', recentActivity: '4 hours ago', coverGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' },
  { id: 'dream-beginners', name: 'Dream Beginners', description: 'New to dream journaling? Start here!', emoji: '🌱', memberCount: 4521, postCount: 3892, isJoined: false, isPrivate: false, category: 'beginners', recentActivity: '1 hour ago', coverGradient: 'linear-gradient(135deg, #10b981 0%, #84cc16 100%)' },
]
