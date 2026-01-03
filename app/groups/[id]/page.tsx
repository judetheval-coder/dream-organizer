'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'
import StructuredDreamPost from '@/components/group/StructuredDreamPost'
import DreamReactions from '@/components/group/DreamReactions'

interface GroupPost {
  id: string
  dream_id?: string
  dream_title?: string
  dream_type?: string
  dream_mood?: string
  vividness?: number
  tags?: string[]
  title?: string
  content?: string
  media_url?: string
  like_count: number
  comment_count: number
  created_at: string
  user_id: string
  users?: { email: string }
  dreams?: {
    id: string
    text: string
    style: string
    mood: string
    panels?: Array<{
      id: string
      image_url: string | null
      description: string
      scene_number: number
    }>
  }
}

interface CircleRitual {
  id: string
  prompt_text: string
  ritual_type: string
  scheduled_date: string
  is_active: boolean
}

interface DreamMatch {
  post_id_1: string
  post_id_2: string
  similarity_score: number
  matched_symbols: string[]
}

interface Group {
  id: string
  name: string
  description: string
  emoji: string
  member_count: number
  is_private: boolean
  category: string
}

export default function GroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const groupId = params.id as string

  const [group, setGroup] = useState<Group | null>(null)
  const [posts, setPosts] = useState<GroupPost[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPostModal, setShowPostModal] = useState(false)
  const [selectedDream, setSelectedDream] = useState<any>(null)
  const [userDreams, setUserDreams] = useState<any[]>([])
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [postReactions, setPostReactions] = useState<Record<string, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({})
  const [circleRitual, setCircleRitual] = useState<CircleRitual | null>(null)
  const [dreamMatches, setDreamMatches] = useState<DreamMatch[]>([])
  const [dreamStreak, setDreamStreak] = useState(0)
  const [dreamSymbols, setDreamSymbols] = useState<Array<{symbol: string, count: number}>>([])
  const [showReflections, setShowReflections] = useState<string | null>(null)
  const [reflections, setReflections] = useState<Record<string, any[]>>({})
  const [reflectionInputs, setReflectionInputs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!groupId) return
    loadGroup()
    loadPosts()
    loadCircleRitual()
    loadDreamSymbols()
    if (user) {
      checkMembership()
      loadUserDreams()
      loadLikedPosts()
      loadUserReactions()
      loadDreamStreak()
    }
  }, [groupId, user])

  const loadGroup = async () => {
    try {
      const { data, error } = await supabase
        .from('dream_groups')
        .select('*')
        .eq('id', groupId)
        .single()

      if (error) throw error
      setGroup(data)
    } catch (err) {
      console.error('Error loading group:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkMembership = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      setIsMember(!!data)
    } catch {
      setIsMember(false)
    }
  }

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          users (email),
          dreams (
            id,
            text,
            style,
            mood,
            panels (
              id,
              image_url,
              description,
              scene_number
            )
          )
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setPosts(data || [])
      
      // Load reactions for each post
      if (data) {
        for (const post of data) {
          await loadPostReactions(post.id)
        }
      }
    } catch (err) {
      console.error('Error loading posts:', err)
    }
  }

  const loadPostReactions = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('dream_reactions')
        .select('reaction_type')
        .eq('post_id', postId)

      if (data) {
        const counts: Record<string, number> = {}
        data.forEach(r => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
        })
        setPostReactions(prev => ({ ...prev, [postId]: counts }))
      }
    } catch (err) {
      console.error('Error loading reactions:', err)
    }
  }

  const loadUserReactions = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('dream_reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)

      if (data) {
        const reactions: Record<string, string[]> = {}
        data.forEach(r => {
          if (!reactions[r.post_id]) reactions[r.post_id] = []
          reactions[r.post_id].push(r.reaction_type)
        })
        setUserReactions(reactions)
      }
    } catch (err) {
      console.error('Error loading user reactions:', err)
    }
  }

  const loadCircleRitual = async () => {
    try {
      const { data } = await supabase
        .from('circle_rituals')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('scheduled_date', { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setCircleRitual(data)
      }
    } catch (err) {
      // No active ritual is fine
    }
  }

  const loadDreamSymbols = async () => {
    try {
      const { data } = await supabase
        .from('dream_symbols')
        .select('symbol, count')
        .eq('group_id', groupId)
        .order('count', { ascending: false })
        .limit(10)

      if (data) {
        setDreamSymbols(data)
      }
    } catch (err) {
      console.error('Error loading symbols:', err)
    }
  }

  const loadDreamStreak = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('dream_streaks')
        .select('current_streak')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single()

      if (data) {
        setDreamStreak(data.current_streak || 0)
      }
    } catch (err) {
      // No streak yet is fine
    }
  }

  const loadReflections = async (postId: string) => {
    try {
      const { data } = await supabase
        .from('dream_reflections')
        .select(`
          *,
          users (email)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (data) {
        setReflections(prev => ({ ...prev, [postId]: data }))
      }
    } catch (err) {
      console.error('Error loading reflections:', err)
    }
  }

  const loadUserDreams = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('dreams')
        .select(`
          *,
          panels (id, image_url, description, scene_number)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setUserDreams(data || [])
    } catch (err) {
      console.error('Error loading user dreams:', err)
    }
  }

  const loadLikedPosts = async () => {
    if (!user) return
    try {
      const { data } = await supabase
        .from('social_events')
        .select('target_id')
        .eq('user_id', user.id)
        .eq('event_type', 'like')
        .eq('target_type', 'group_post')

      if (data) {
        setLikedPosts(new Set(data.map(d => d.target_id)))
      }
    } catch (err) {
      console.error('Error loading liked posts:', err)
    }
  }

  const handleJoin = async () => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        })

      if (error) throw error

      await supabase.rpc('increment_group_member_count', { group_id: groupId })
      setIsMember(true)
      if (group) {
        setGroup({ ...group, member_count: group.member_count + 1 })
      }
    } catch (err) {
      console.error('Error joining group:', err)
    }
  }

  const handleLeave = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error

      setIsMember(false)
      if (group) {
        setGroup({ ...group, member_count: Math.max(0, group.member_count - 1) })
      }
    } catch (err) {
      console.error('Error leaving group:', err)
    }
  }

  const handleLike = async (postId: string) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    const isLiked = likedPosts.has(postId)

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('social_events')
          .delete()
          .eq('user_id', user.id)
          .eq('event_type', 'like')
          .eq('target_type', 'group_post')
          .eq('target_id', postId)

        // Update like count directly
        await supabase
          .from('group_posts')
          .update({ like_count: Math.max(0, (posts.find(p => p.id === postId)?.like_count || 0) - 1) })
          .eq('id', postId)

        setLikedPosts(prev => {
          const next = new Set(prev)
          next.delete(postId)
          return next
        })
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p))
      } else {
        // Like
        await supabase
          .from('social_events')
          .insert({
            user_id: user.id,
            event_type: 'like',
            target_type: 'group_post',
            target_id: postId
          })

        // Update like count directly
        await supabase
          .from('group_posts')
          .update({ like_count: (posts.find(p => p.id === postId)?.like_count || 0) + 1 })
          .eq('id', postId)
        setLikedPosts(prev => new Set(prev).add(postId))
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, like_count: p.like_count + 1 } : p))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handlePostDream = async (data: {
    dream_id: string
    dream_title: string
    dream_type: string
    dream_mood: string
    vividness: number
    tags: string[]
  }) => {
    if (!user || !isMember) return

    try {
      const dream = userDreams.find(d => d.id === data.dream_id)
      if (!dream) return

      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: user.id,
          dream_id: data.dream_id,
          dream_title: data.dream_title,
          dream_type: data.dream_type,
          dream_mood: data.dream_mood,
          vividness: data.vividness,
          tags: data.tags,
          title: data.dream_title,
          content: dream.text,
          media_url: dream.panels?.[0]?.image_url || null
        })

      if (error) throw error

      // Update dream symbols
      if (data.tags && data.tags.length > 0) {
        for (const tag of data.tags) {
          await supabase.rpc('update_dream_symbols', { 
            group_uuid: groupId, 
            symbol_text: `#${tag}` 
          })
        }
      }

      // Update streak
      await supabase
        .from('dream_streaks')
        .upsert({
          group_id: groupId,
          user_id: user.id,
          current_streak: dreamStreak + 1,
          last_post_date: new Date().toISOString().split('T')[0]
        }, {
          onConflict: 'group_id,user_id'
        })

      setShowPostModal(false)
      setSelectedDream(null)
      loadPosts()
      loadDreamSymbols()
      loadDreamStreak()
    } catch (err) {
      console.error('Error posting dream:', err)
    }
  }

  const handleReact = async (postId: string, reactionType: string) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    const currentReactions = userReactions[postId] || []
    const isActive = currentReactions.includes(reactionType)

    try {
      if (isActive) {
        // Remove reaction
        await supabase
          .from('dream_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .eq('reaction_type', reactionType)

        setUserReactions(prev => ({
          ...prev,
          [postId]: (prev[postId] || []).filter(r => r !== reactionType)
        }))
      } else {
        // Add reaction
        await supabase
          .from('dream_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          })

        setUserReactions(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), reactionType]
        }))
      }

      await loadPostReactions(postId)
    } catch (err) {
      console.error('Error toggling reaction:', err)
    }
  }

  const handleViewDream = (dreamId: string) => {
    router.push(`/public/dreams/${dreamId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#0a0118' }}>
        {/* Animated stars background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1,
                height: Math.random() * 3 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4 animate-pulse">🌙</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0118' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>Group not found</h1>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 rounded-lg" style={{ background: colors.purple, color: 'white' }}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#0a0118' }}>
      {/* Animated Starry Night Sky Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Floating Dream Clouds */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="absolute top-20 left-10 w-64 h-32 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-20 w-80 h-40 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-72 h-36 bg-gradient-to-r from-pink-500/20 to-transparent rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Parallax Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-[120px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Cinematic Group Header */}
        <div className="relative mb-12 overflow-hidden rounded-3xl" style={{ background: 'linear-gradient(135deg, rgba(91, 44, 252, 0.2), rgba(138, 43, 226, 0.15))' }}>
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-cyan-600/20 animate-gradient-x"></div>

          {/* Glowing group emblem */}
          <div className="relative p-12 text-center">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative text-9xl animate-float-gentle filter drop-shadow-[0_0_30px_rgba(124,58,237,0.6)]">
                {group.emoji}
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                {group.name}
              </span>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 blur-2xl -z-10"></div>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {group.description}
            </p>

            {/* Stats with glow */}
            <div className="flex items-center justify-center gap-8 mt-8 flex-wrap">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {group.member_count.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 mt-1">Dreamers</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {posts.length}
                </div>
                <div className="text-sm text-gray-400 mt-1">Dreams Shared</div>
              </div>
              {dreamStreak > 0 && (
                <>
                  <div className="w-px h-12 bg-gradient-to-b from-transparent via-purple-500/50 to-transparent"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {dreamStreak}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">Day Streak 🔥</div>
                  </div>
                </>
              )}
            </div>

            {/* Circle Ritual */}
            {circleRitual && (
              <div className="mt-8 p-6 rounded-2xl border-2 relative overflow-hidden" style={{ 
                borderColor: 'rgba(124, 58, 237, 0.4)',
                background: 'linear-gradient(135deg, rgba(91, 44, 252, 0.15), rgba(138, 43, 226, 0.1))'
              }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-600/10 animate-pulse"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl mb-3 animate-float-gentle">🔥</div>
                  <p className="text-sm font-semibold mb-2 uppercase tracking-wider" style={{ color: '#A78BFA' }}>
                    Tonight's Circle Ritual
                  </p>
                  <p className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    "{circleRitual.prompt_text}"
                  </p>
                </div>
              </div>
            )}

            {/* Dream Symbols Constellation */}
            {dreamSymbols.length > 0 && (
              <div className="mt-6 p-6 rounded-2xl" style={{ background: 'rgba(26, 16, 37, 0.6)' }}>
                <p className="text-sm font-semibold mb-4 text-center uppercase tracking-wider" style={{ color: colors.textMuted }}>
                  🌌 Dream Symbols This Week
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {dreamSymbols.map((symbol, idx) => (
                    <div
                      key={idx}
                      className="text-center animate-float-gentle"
                      style={{ animationDelay: `${idx * 0.2}s` }}
                    >
                      <div className="text-4xl mb-1 filter drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                        {symbol.symbol}
                      </div>
                      <div className="text-xs font-bold" style={{ color: colors.textSecondary }}>
                        {symbol.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Powerful Join/Leave Button */}
            {user ? (
              <div className="mt-8">
                {!isMember ? (
                  <button
                    onClick={handleJoin}
                    className="group relative px-12 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)',
                      color: 'white',
                      boxShadow: '0 0 40px rgba(91, 44, 252, 0.5), 0 0 80px rgba(138, 43, 226, 0.3)'
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      Join This Dream Circle
                      <span className="text-2xl">✨</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>
                ) : (
                  <div className="flex items-center gap-4 justify-center">
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="px-8 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)',
                        color: 'white',
                        boxShadow: '0 0 30px rgba(91, 44, 252, 0.4)'
                      }}
                    >
                      ✨ Share Your Dream
                    </button>
                    <button
                      onClick={handleLeave}
                      className="px-6 py-3 rounded-xl font-semibold text-base transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: colors.textSecondary,
                        border: '1px solid rgba(124, 58, 237, 0.3)'
                      }}
                    >
                      Leave Group
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/sign-in')}
                className="mt-8 px-12 py-4 rounded-2xl font-bold text-lg transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)',
                  color: 'white',
                  boxShadow: '0 0 40px rgba(91, 44, 252, 0.5)'
                }}
              >
                Sign In to Join
              </button>
            )}
          </div>
        </div>

        {/* Dream Posts Feed with Comic Panel Style */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            /* Magical Empty State */
            <Card className="relative overflow-hidden text-center py-20" padding="p-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-cyan-900/10"></div>
              <div className="relative z-10">
                <div className="text-8xl mb-6 animate-float-gentle filter drop-shadow-[0_0_40px_rgba(124,58,237,0.4)]">
                  🌙✨
                </div>
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  The Dream Circle Awaits
                </h2>
                <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
                  {isMember
                    ? "Be the first to share a dream and light up this space with your imagination."
                    : "Join this circle to unlock the magic of shared dreams."}
                </p>
                {isMember && (
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 animate-pulse-glow"
                    style={{
                      background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)',
                      color: 'white',
                      boxShadow: '0 0 40px rgba(91, 44, 252, 0.6)'
                    }}
                  >
                    ✨ Share Your First Dream
                  </button>
                )}
              </div>
            </Card>
          ) : (
            posts.map((post, index) => (
              <Card
                key={post.id}
                className="comic-frame dream-panel overflow-hidden animate-slide-up"
                padding="p-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Post Header with Glow */}
                <div className="p-6 border-b relative" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', background: 'rgba(26, 16, 37, 0.5)' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-cyan-600/5"></div>
                  <div className="relative flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #5B2CFC, #8A2BE2)',
                        boxShadow: '0 0 20px rgba(91, 44, 252, 0.4)'
                      }}
                    >
                      {post.users?.email?.charAt(0).toUpperCase() || '👤'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg" style={{ color: colors.textPrimary }}>
                        {post.users?.email?.split('@')[0] || 'Dreamer'}
                      </p>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dream Content - Comic Panel Style */}
                {post.dreams ? (
                  <div className="group relative overflow-hidden">
                    <div className="p-6 relative z-10">
                      {post.dream_title && (
                        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                          {post.dream_title}
                        </h3>
                      )}
                      <div
                        className="cursor-pointer"
                        onClick={() => handleViewDream(post.dreams!.id)}
                      >
                        <p className="text-lg mb-4 leading-relaxed" style={{ color: colors.textPrimary }}>
                          {post.dreams.text}
                        </p>
                      </div>
                      {post.dreams.panels && post.dreams.panels.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                          {post.dreams.panels
                            .filter(p => p.image_url)
                            .slice(0, 3)
                            .map((panel, idx) => (
                              <div
                                key={panel.id}
                                className="relative aspect-video rounded-xl overflow-hidden border-2 border-purple-500/20 group-hover:border-purple-500/40 transition-all hover:scale-105"
                                style={{
                                  boxShadow: '0 0 20px rgba(91, 44, 252, 0.2)',
                                  animationDelay: `${idx * 0.1}s`
                                }}
                              >
                                <Image
                                  src={panel.image_url!}
                                  alt={panel.description}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                  unoptimized={panel.image_url!.includes('supabase.co') || panel.image_url!.includes('supabase.in')}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-cyan-600/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="font-bold text-xl mb-3" style={{ color: colors.textPrimary }}>{post.title}</p>
                    <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>{post.content}</p>
                    {post.media_url && (
                      <div className="mt-6 relative aspect-video rounded-xl overflow-hidden border-2 border-purple-500/20" style={{ boxShadow: '0 0 30px rgba(91, 44, 252, 0.3)' }}>
                        <Image
                          src={post.media_url}
                          alt={post.title || 'Post image'}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Dream Metadata */}
                {(post.dream_type || post.dream_mood || post.vividness) && (
                  <div className="px-6 py-3 border-t flex items-center gap-4 flex-wrap" style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}>
                    {post.dream_type && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}>
                        {post.dream_type === 'flying' && '🪽'} {post.dream_type === 'flying' ? 'Flying' : post.dream_type === 'lucid' ? '🔮 Lucid' : post.dream_type.charAt(0).toUpperCase() + post.dream_type.slice(1)}
                      </span>
                    )}
                    {post.dream_mood && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#22D3EE' }}>
                        {post.dream_mood === 'calm' && '🌙'} {post.dream_mood === 'calm' ? 'Calm' : post.dream_mood.charAt(0).toUpperCase() + post.dream_mood.slice(1)}
                      </span>
                    )}
                    {post.vividness && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#F472B6' }}>
                        Vividness: {post.vividness}/10
                      </span>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(124, 58, 237, 0.15)', color: colors.textMuted }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dream Reactions */}
                <div className="p-4 border-t" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', background: 'rgba(26, 16, 37, 0.3)' }}>
                  <DreamReactions
                    postId={post.id}
                    initialReactions={postReactions[post.id] || {}}
                    userReactions={userReactions[post.id] || []}
                    onReact={(reactionType) => handleReact(post.id, reactionType)}
                  />
                </div>

                {/* Reflections & Actions */}
                <div className="p-4 border-t flex items-center gap-4" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', background: 'rgba(26, 16, 37, 0.2)' }}>
                  <button
                    onClick={() => {
                      if (showReflections === post.id) {
                        setShowReflections(null)
                      } else {
                        setShowReflections(post.id)
                        if (!reflections[post.id]) {
                          loadReflections(post.id)
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-gray-400 hover:text-cyan-400 transition-all hover:scale-110"
                  >
                    <span className="text-xl">💭</span>
                    <span>Reflections ({post.comment_count || 0})</span>
                  </button>
                  {post.dreams && (
                    <button
                      onClick={() => handleViewDream(post.dreams!.id)}
                      className="ml-auto px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:scale-105"
                      style={{
                        background: 'rgba(91, 44, 252, 0.2)',
                        color: colors.textPrimary,
                        border: '1px solid rgba(91, 44, 252, 0.3)'
                      }}
                    >
                      View Full Dream →
                    </button>
                  )}
                </div>

                {/* Reflections Section */}
                {showReflections === post.id && (
                  <div className="p-6 border-t space-y-4" style={{ borderColor: 'rgba(124, 58, 237, 0.2)', background: 'rgba(26, 16, 37, 0.4)' }}>
                    <h4 className="font-bold text-lg mb-4" style={{ color: colors.textPrimary }}>💭 Reflections</h4>
                    {reflections[post.id] && reflections[post.id].length > 0 ? (
                      <div className="space-y-3">
                        {reflections[post.id].map((reflection: any) => (
                          <div key={reflection.id} className="p-4 rounded-xl" style={{ background: 'rgba(124, 58, 237, 0.1)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
                                {reflection.users?.email?.split('@')[0] || 'Dreamer'}
                              </span>
                              <span className="text-xs" style={{ color: colors.textMuted }}>
                                {new Date(reflection.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {reflection.quoted_text && (
                              <blockquote className="pl-4 border-l-2 mb-2 italic text-sm" style={{ borderColor: colors.purple, color: colors.textSecondary }}>
                                "{reflection.quoted_text}"
                              </blockquote>
                            )}
                            <p className="text-sm" style={{ color: colors.textPrimary }}>{reflection.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: colors.textMuted }}>
                        No reflections yet. Be the first to share your thoughts.
                      </p>
                    )}
                    {user && (
                      <div className="mt-4">
                        <textarea
                          value={reflectionInputs[post.id] || ''}
                          onChange={(e) => setReflectionInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Share your reflection on this dream... (You can quote specific lines by selecting text from the dream above)"
                          className="w-full px-4 py-3 rounded-xl border resize-none"
                          style={{ background: colors.surface, borderColor: colors.border, color: colors.textPrimary }}
                          rows={3}
                        />
                        <button
                          onClick={async () => {
                            const content = reflectionInputs[post.id]?.trim()
                            if (!content) return

                            try {
                              const { error } = await supabase
                                .from('dream_reflections')
                                .insert({
                                  post_id: post.id,
                                  user_id: user.id,
                                  content,
                                  reflection_type: 'general'
                                })

                              if (error) throw error

                              // Update comment count
                              await supabase
                                .from('group_posts')
                                .update({ comment_count: (post.comment_count || 0) + 1 })
                                .eq('id', post.id)

                              setReflectionInputs(prev => ({ ...prev, [post.id]: '' }))
                              await loadReflections(post.id)
                              setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
                            } catch (err) {
                              console.error('Error posting reflection:', err)
                            }
                          }}
                          disabled={!reflectionInputs[post.id]?.trim()}
                          className="mt-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                          style={{ background: colors.purple, color: 'white' }}
                        >
                          Post Reflection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Post Dream Modal with Structured Posting */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => {
            setShowPostModal(false)
            setSelectedDream(null)
          }} />
          <div className="relative z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card className="p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-cyan-900/20"></div>
              <div className="relative z-10">
                {!selectedDream ? (
                  <>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Share Your Dream
                    </h2>
                    <p className="text-gray-400 mb-6">Choose a dream to share with the circle</p>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {userDreams.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🌙</div>
                          <p className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>No dreams yet</p>
                          <p className="text-sm text-gray-400 mb-6">Create your first dream to share it with the group!</p>
                          <button
                            onClick={() => {
                              setShowPostModal(false)
                              router.push('/dashboard')
                            }}
                            className="px-6 py-3 rounded-xl font-bold"
                            style={{ background: colors.purple, color: 'white' }}
                          >
                            Create Dream
                          </button>
                        </div>
                      ) : (
                        userDreams.map((dream) => (
                          <div
                            key={dream.id}
                            className="p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl comic-frame"
                            style={{
                              borderColor: 'rgba(124, 58, 237, 0.3)',
                              background: 'rgba(26, 16, 37, 0.6)'
                            }}
                            onClick={() => setSelectedDream(dream)}
                          >
                            <p className="font-semibold mb-3 text-lg" style={{ color: colors.textPrimary }}>
                              {dream.text?.slice(0, 120)}...
                            </p>
                            {dream.panels?.[0]?.image_url && (
                              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-purple-500/20">
                                <Image
                                  src={dream.panels[0].image_url}
                                  alt="Dream preview"
                                  fill
                                  className="object-cover"
                                  sizes="100vw"
                                />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowPostModal(false)
                        setSelectedDream(null)
                      }}
                      className="mt-6 px-6 py-3 rounded-xl font-semibold w-full"
                      style={{ background: 'rgba(255, 255, 255, 0.1)', color: colors.textPrimary, border: '1px solid rgba(124, 58, 237, 0.3)' }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => setSelectedDream(null)}
                        className="text-2xl hover:scale-110 transition-transform"
                        style={{ color: colors.textSecondary }}
                      >
                        ←
                      </button>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                        Structure Your Dream
                      </h2>
                    </div>
                    <StructuredDreamPost
                      dream={selectedDream}
                      onSubmit={handlePostDream}
                      onCancel={() => {
                        setShowPostModal(false)
                        setSelectedDream(null)
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
