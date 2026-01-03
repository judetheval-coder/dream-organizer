'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'
import { colors, gradients } from '@/lib/design'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase'

interface GroupPost {
  id: string
  dream_id?: string
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
  const [userDreams, setUserDreams] = useState<any[]>([])

  useEffect(() => {
    if (!groupId) return
    loadGroup()
    loadPosts()
    if (user) {
      checkMembership()
      loadUserDreams()
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
    } catch (err) {
      console.error('Error loading posts:', err)
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

      // Increment member count
      await supabase.rpc('increment_group_member_count', { group_id: groupId })
      setIsMember(true)
      if (group) {
        setGroup({ ...group, member_count: group.member_count + 1 })
      }
    } catch (err) {
      console.error('Error joining group:', err)
    }
  }

  const handlePostDream = async (dreamId: string) => {
    if (!user || !isMember) return

    try {
      const dream = userDreams.find(d => d.id === dreamId)
      if (!dream) return

      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: user.id,
          title: dream.text?.slice(0, 100) || 'Shared Dream',
          content: dream.text,
          media_url: dream.panels?.[0]?.image_url || null
        })

      if (error) throw error

      setShowPostModal(false)
      loadPosts()
    } catch (err) {
      console.error('Error posting dream:', err)
    }
  }

  const handleViewDream = (dreamId: string) => {
    // Navigate to the stored dream page (not regenerate)
    router.push(`/public/dreams/${dreamId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.backgroundDark }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.purple }}></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.backgroundDark }}>
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
    <div className="min-h-screen" style={{ background: colors.backgroundDark }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Group Header */}
        <Card className="mb-8 overflow-hidden" padding="p-0">
          <div className="h-48 relative" style={{ background: gradients.card }}>
            <div className="absolute bottom-4 left-6">
              <div className="text-6xl mb-2">{group.emoji}</div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>{group.name}</h1>
              <p className="text-base" style={{ color: colors.textSecondary }}>{group.description}</p>
            </div>
            {!isMember && user && (
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleJoin}
                  className="px-6 py-3 rounded-full font-bold"
                  style={{ background: colors.purple, color: 'white' }}
                >
                  Join Group
                </button>
              </div>
            )}
          </div>
          <div className="p-6 flex items-center gap-6">
            <div className="text-sm font-medium" style={{ color: colors.textMuted }}>
              👥 {group.member_count} members
            </div>
            <div className="text-sm font-medium" style={{ color: colors.textMuted }}>
              💭 {posts.length} posts
            </div>
            {isMember && (
              <button
                onClick={() => setShowPostModal(true)}
                className="ml-auto px-4 py-2 rounded-full font-semibold"
                style={{ background: colors.purple, color: 'white' }}
              >
                + Share Dream
              </button>
            )}
          </div>
        </Card>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="text-center py-12">
              <span className="text-4xl mb-4 block">💭</span>
              <p className="font-medium" style={{ color: colors.textPrimary }}>No posts yet</p>
              <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                {isMember ? 'Be the first to share a dream!' : 'Join to start sharing dreams'}
              </p>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="overflow-hidden" padding="p-0">
                {/* Post Header */}
                <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: colors.surface }}>
                      {post.users?.email?.charAt(0).toUpperCase() || '👤'}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: colors.textPrimary }}>
                        {post.users?.email?.split('@')[0] || 'Dreamer'}
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dream Content */}
                {post.dreams ? (
                  <div
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleViewDream(post.dreams!.id)}
                  >
                    <div className="p-4">
                      <p className="text-base mb-3" style={{ color: colors.textPrimary }}>
                        {post.dreams.text}
                      </p>
                      {post.dreams.panels && post.dreams.panels.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                          {post.dreams.panels
                            .filter(p => p.image_url)
                            .slice(0, 3)
                            .map((panel) => (
                              <div key={panel.id} className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                  src={panel.image_url!}
                                  alt={panel.description}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, 33vw"
                                  unoptimized={panel.image_url!.includes('supabase.co') || panel.image_url!.includes('supabase.in')}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="font-semibold mb-2" style={{ color: colors.textPrimary }}>{post.title}</p>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{post.content}</p>
                    {post.media_url && (
                      <div className="mt-4 relative aspect-video rounded-lg overflow-hidden">
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

                {/* Post Actions */}
                <div className="p-4 border-t flex items-center gap-4" style={{ borderColor: colors.border }}>
                  <button className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    ❤️ {post.like_count}
                  </button>
                  <button className="flex items-center gap-2 text-sm" style={{ color: colors.textMuted }}>
                    💬 {post.comment_count}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Post Dream Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPostModal(false)} />
          <div className="relative z-50 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.textPrimary }}>Share a Dream</h2>
              <div className="space-y-3">
                {userDreams.length === 0 ? (
                  <p className="text-sm" style={{ color: colors.textMuted }}>You don't have any dreams yet. Create one first!</p>
                ) : (
                  userDreams.map((dream) => (
                    <div
                      key={dream.id}
                      className="p-4 rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ borderColor: colors.border, background: colors.surface }}
                      onClick={() => handlePostDream(dream.id)}
                    >
                      <p className="font-medium mb-2" style={{ color: colors.textPrimary }}>
                        {dream.text?.slice(0, 100)}...
                      </p>
                      {dream.panels?.[0]?.image_url && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden mt-2">
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
                onClick={() => setShowPostModal(false)}
                className="mt-4 px-4 py-2 rounded-lg"
                style={{ background: colors.surface, color: colors.textPrimary }}
              >
                Cancel
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

